//GLOBALS
var map;

function init(){
    var url = 'http://data.actmapi.act.gov.au/arcgis/rest/services/actmapi/imagery2015mga/MapServer';
    var baseUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';

    var arcgisLayer = new ol.layer.Tile({
        source: new ol.source.TileArcGISRest({
            url: url
        })
    });

    var baseLayer = new ol.layer.Tile({
        source: new ol.source.TileArcGISRest({
            url: baseUrl
        })
    });

    var view = new ol.View({
        center: ol.proj.transform([149.125699, -35.284922], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12
    })

    var scaleLineControl = new ol.control.ScaleLine();

    map = new ol.Map({
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }).extend([
            scaleLineControl
        ]),
        loadTilesWhileAnimating: false,
        loadTilesWhileInteracting:false,
        target: 'map',
        layers: [baseLayer,arcgisLayer],
        view: view
    });
    scaleLineControl.setUnits("metric");
}

//Show elements on dropdown click
function dropFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown on external click
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {
    var myDropdown = document.getElementById("myDropdown");
      if (myDropdown.classList.contains('show')) {
        myDropdown.classList.remove('show');
      }
  }
}

function snapTo(long, lat){
    console.log(long + ", " + lat);
    map.getView().setCenter(ol.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(13);
}

function hideFeature(id) {

    var i,
        feature,
        layerSourceFeatures = map.pointsLayer.getSource().getFeatures(),
        len = layerSourceFeatures.length;

    var emptyImgStyle = new ol.style.Style({ image: '' });

    // If an aces id was provided
    if (id !== undefined) {
        for( i = 0; i < len; i++ ) {
            feature = layerSourceFeatures[i];

            feature.setStyle(emptyImgStyle);

            // Resetting feature style back to default function given in defaultPointStyleFunction()
            if (feature.get('aces_id') == id) {
                feature.setStyle(null);
            }
            // Hiding marker by removing its associated image
            else {
                feature.setStyle(emptyImgStyle);
            }
        }
    }
    // No id was provided - all points are hidden
    else {
        for( i = 0; i < len; i++ ) {
            feature = layerSourceFeatures[i];
            feature.setStyle(emptyImgStyle);
        }
    }
}

