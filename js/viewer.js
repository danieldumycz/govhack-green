//GLOBALS
var map;

function init(){
    var url = 'http://data.actmapi.act.gov.au/arcgis/rest/services/actmapi/imagery2015mga/MapServer';
    var baseUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
    // Set up pop-up wrappers
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    var overlay = new ol.Overlay({element: container});
    // Listener for the pop-up close button
    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        //vectorLayer.getSource().clear();
        return false;
    };

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

	var currentGardens = new ol.layer.Tile({
        source: new ol.source.TileWMS(({
            url: 'http://gis.opboomtown.com/geoserver/wms',
            params: {'LAYERS': 'cite:communitygardens', 'TILED': true},
            serverType: 'geoserver'
        }))
    });

    var view = new ol.View({
        center: [149.125699, -35.284922],
        zoom: 12,
        projection: 'EPSG:4326'
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
        layers: [baseLayer,arcgisLayer,currentGardens],
        view: view,
        overlays: [overlay]
    });
    scaleLineControl.setUnits("metric");

    map.on('singleclick', function(evt) {
        var wmsSource = new ol.source.TileWMS({
            url: 'http://gis.opboomtown.com/geoserver/wms',
            params: {'LAYERS': ['communitygardens']},
            serverType: 'geoserver'
        });
        var url = wmsSource.getGetFeatureInfoUrl(
            evt.coordinate,
            view.getResolution(),
            'EPSG:4326',
            {'INFO_FORMAT': 'application/json', "feature_count": '1000'}
        );
    
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var jsonResponse = JSON.parse(xhttp.responseText);
                if(jsonResponse.features.length != 0){
                    closer.click();
                    content.innerHTML = '';
                    overlay.setPosition(evt.coordinate);
                    
                    //Offset
                    var extent = map.getView().calculateExtent(map.getSize())
                    var yoffset = (extent[3] - extent[1])*0.2
                    
                    map.getView().animate({
                        center: [evt.coordinate[0], evt.coordinate[1] + yoffset],
                        duration: 500
                    });
                    content.innerHTML += '<img src="' + jsonResponse.features[0].properties.img + '"/>';
                    content.innerHTML += '<b>' + jsonResponse.features[0].properties.name + '</b><br/>';
                    content.innerHTML += '<p>' + jsonResponse.features[0].properties.description + '</p>';
                }
            }
        }
        xhttp.open("GET", url, true);
        xhttp.send();
    });
}

//Show elements on dropdown click
function dropFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}


function snapTo(long, lat){
    console.log(long + ", " + lat);
    map.getView().setCenter([long, lat]);
    map.getView().setZoom(13);
}

// var someFeature = ...; // create some feature
// someFeature.set('style', someStyle) // set some style
// var someFeatureLayer = ...; // create Layer from someFeature
// map.addLayer( someFeatureLayer ); // add someFeatureLayer


function toggleFeatureVis(){
    someFeatureLayer.set('visible', false);
    someFeatureLayer.set('visible', true); 
}