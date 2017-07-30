//GLOBALS
var map;
// Set up pop-up wrappers
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var overlay = new ol.Overlay({element: container});

//GLOBAL MAP TILES
var proposedGardens = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: 'http://gis.opboomtown.com/geoserver/wms',
        params: {'LAYERS': 'cite:potential_sites2', 'TILED': true},
        serverType: 'geoserver'
    }))
})

var threatenedWoodLands = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest(({
        url: 'http://data.actmapi.act.gov.au/arcgis/rest/services/data_extract/Environment/MapServer',
        params: {'layers': 'show:8', 'TILED': true},
    }))
});

var floodZones = new ol.layer.Tile({
    source: new ol.source.TileArcGISRest(({
        url: 'http://data.actmapi.act.gov.au/arcgis/rest/services/data_extract/Emergency_Management/MapServer/',
        params: {'layers': 'show:0', 'TILED': true},
    }))
});

var busRoutes = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: 'http://gis.opboomtown.com/geoserver/wms',
        params: {'LAYERS': 'cite:bus_routes', 'TILED': true},
        serverType: 'geoserver'
    }))
});

var currentGardens = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: 'http://gis.opboomtown.com/geoserver/wms',
        params: {'LAYERS': 'cite:communitygardens', 'TILED': true},
        serverType: 'geoserver'
    }))
});

var crimeStats = new ol.layer.Tile({
    source: new ol.source.TileWMS(({
        url: 'http://gis.opboomtown.com/geoserver/wms',
        params: {'LAYERS': 'cite:Potential_sites_Attributed_v2_pt2', 'TILED': true},
        serverType: 'geoserver'
    }))
});

var featuresDict = {};
featuresDict["gardens"] = proposedGardens;
featuresDict["floods"] = floodZones;
featuresDict["crimes"] = crimeStats;
featuresDict["buses"] = busRoutes;
featuresDict["fires"] = threatenedWoodLands;

function init(){
    //Disable Layers
    featuresDict["floods"].setVisible(false);
    featuresDict["crimes"].setVisible(false);
    featuresDict["buses"].setVisible(false);
    featuresDict["fires"].setVisible(false);

    var url = 'http://data.actmapi.act.gov.au/arcgis/rest/services/actmapi/imagery2015mga/MapServer';
    var baseUrl = 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer';
    
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
        layers: [baseLayer,arcgisLayer,crimeStats,threatenedWoodLands, floodZones, busRoutes,currentGardens,proposedGardens],
        view: view,
        overlays: [overlay]
    });
    scaleLineControl.setUnits("metric");

    map.on('singleclick', function(evt) {
        showPopup(evt);
    });
}

//Show elements on dropdown click
function dropFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

function resetView(){
    map.getView().setCenter([149.125699, -35.284922]);
    map.getView().setZoom(12);
}

function snapTo(long, lat){
    map.getView().setCenter([long,lat]);
    map.getView().setZoom(17);
    showPopup({'coordinate': [long, lat]});
}

function toggleFeatureVis(value){
    if(featuresDict[value].getVisible()){
        featuresDict[value].setVisible(false);
    } else {
        featuresDict[value].setVisible(true);
    }
}

function showPopup(evt){
    var wmsSource = new ol.source.TileWMS({
        url: 'http://gis.opboomtown.com/geoserver/wms',
        params: {'LAYERS': ['communitygardens','cite:potential_sites2']},
        serverType: 'geoserver'
    });
    var url = wmsSource.getGetFeatureInfoUrl(
        evt.coordinate,
        map.getView().getResolution(),
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
                content.innerHTML += '<p>' + (jsonResponse.features[0].properties.description || (jsonResponse.features[0].properties.descriptio + jsonResponse.features[0].properties.descripti1)) + '</p>';
            }
        }
    }
    xhttp.open("GET", url, true);
    xhttp.send();
}