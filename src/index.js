const axios = require('axios');
const config = {
  headers: {'Accept': 'application/json', 'Content-Type': 'application/json',}
};

window.contentfulExtension.init(initExtension);

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
    console.log('sys');
    axios.post('https://media-tagging-proxy-server.herokuapp.com/', { sysId: `${sys.id}` }, config)
    .then(function(response){
       updateAssets(response)
     });
  }
}

function updateAssets(assets) {
  const mainContainer = document.getElementById('assets');
  if (assets) {
    assets.data.fields.images.forEach(function (fi) {
      const id = fi.sys.id;
      const tagId = assets.data.sys.id

      mainContainer.insertAdjacentHTML('beforeend', `<div class="thumb" id="${id}-${tagId}"><img src=${fi.fields.file.url} /></thumb>` );
      buildEntries(`${fi.sys.id}`, `${assets.data.fields.imageTags}`, `${assets.data.sys.id}`, `${fi.sys.revision}`)
    })
  }
}

function buildEntries(asset_id, tags, tag_id, version) {
  axios.post('https://media-tagging-proxy-server.herokuapp.com/build', {assetId: asset_id, allTags: tags, versionNo: version}, config)
  .then(function(response) {
     console.log(response);
     const assetThumb = document.getElementById(`${asset_id}-${tag_id}`);
     assetThumb.classList.add('published');
   });
}
