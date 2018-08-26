const contentful = require('contentful')
const mgmt = require('contentful-management')

window.contentfulExtension.init(initExtension);

const cda = contentful.createClient({space: process.env.SPACE_ID, accessToken: process.env.ACCESS_TOKEN})

console.log(process.env.process.env.SPACE_ID)
cda.getEntries({content_type:'taggedImages'}).then(response => {
  buildTreeWithJSONArray(response.items, 'assets')
}).catch(console.error)


function initExtension(extension) {
  extension.window.updateHeight();
  extension.window.startAutoResizer();
}

function buildTreeWithJSONArray(json, root, linkId) {
  let mainContainer = '';
  if (!linkId) {
    mainContainer = document.getElementById(root);
  }

  for (var i = 0; i < json.length; i++) {
    mainContainer.insertAdjacentHTML('beforeend', `<h4>${json[i].fields.imageTags}</h4>` );
    json[i].fields.images.forEach(function (fi) {
      const id = fi.sys.id;
      const tagId = json[i].sys.id

      mainContainer.insertAdjacentHTML('beforeend', `<div class="thumb" id="${id}-${tagId}"><img src=${fi.fields.file.url} /></thumb>` );
      buildEntries(`${fi.sys.id}`, `${json[i].fields.imageTags}`, `${json[i].sys.id}`, `${fi.sys.revision}`)
    })
  }
}

function buildEntries(asset_id, tags, tagId, version) {
  const client = mgmt.createClient({accessToken: process.env.PERSONAL, headers: {'X-Contentful-Version': version}})

  client.getSpace(process.env.SPACE_ID)
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
