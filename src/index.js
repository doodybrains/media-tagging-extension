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

  console.log(document.querySelectorAll("[data-test-id='create-asset']"));
  const button = document.getElementById('update-assets');

  if (sys) {
    console.log('sys exists');
    const mainContainer = document.getElementById('assets');
    button.addEventListener("click", function( event ) {
      axios.post('https://media-tagging-proxy-server.herokuapp.com/', { sysId: `${sys.id}` }, config)
      .then(function(response){
          mainContainer.innerHTML = '';
         updateAssets(response)
       });
    }, false);
  }
}

function updateAssets(assets) {
  const mainContainer = document.getElementById('assets');
  if (assets) {
    assets.data.fields.images.forEach(function (fi) {
      const id = fi.sys.id;
      const tagId = assets.data.sys.id
      const element = document.getElementById(`${id}-${tagId}`);

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
