const contentful = require('contentful')
const mgmt = require('contentful-management')

window.contentfulExtension.init(initExtension);

const cda = contentful.createClient({space: '', accessToken: ''})

function initExtension(extension) {
  extension.window.updateHeight();
  extension.window.startAutoResizer();
  if (extension.entry.fields.imageTags) {
    getAssets(extension);
  }
}

function getAssets(extension) {
  const sys = extension.entry.getSys();
  if (sys) {
    // hit heroku app with sys.id
    // get response and send through to getAssets
    cda.getEntry(sys.id).then(response => {
      updateAssets(response)
    }).catch(console.error)
  }
}

function updateAssets(assets) {
  const mainContainer = document.getElementById('assets');

  assets.fields.images.forEach(function (fi) {
    const id = fi.sys.id;
    const tagId = assets.sys.id

    mainContainer.insertAdjacentHTML('beforeend', `<div class="thumb" id="${id}-${tagId}"><img src=${fi.fields.file.url} /></thumb>` );
    buildEntries(`${fi.sys.id}`, `${assets.fields.imageTags}`, `${assets.sys.id}`, `${fi.sys.revision}`)
  })
}

function buildEntries(asset_id, tags, tagId, version) {
  const client = mgmt.createClient({accessToken: '', headers: {'X-Contentful-Version': version}})

  client.getSpace('l93sefy83g83')
  .then((space) => space.getEnvironment('master'))
  .then((environment) => environment.getAsset(asset_id))
  .then((asset) => {
    if (!asset.fields.description) {
      asset.fields.description = {'en-US': ''};
    }

    const des = asset.fields.description['en-US'];
    let description = `${des}`;
    const tagWords = ` ${tags}`;
    let newDescription = '';

    if (des.includes(tagWords)) {
      return asset;
    } else {
      description = `${des}`;
      newDescription = description.concat(tagWords);
      asset.fields.description['en-US'] = newDescription
      return asset.update()
    }
  })
  .then((asset) => {
    if (asset.isUpdated()) {
      return asset.publish()
    } else {
      return asset;
    }
  })
  .then((asset) => {
    const assetThumb = document.getElementById(`${asset_id}-${tagId}`);
    if (asset.isPublished()) {
      assetThumb.classList.add('published');
      return asset;
    }
  })
  .catch(console.error)
}
