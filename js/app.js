var mapapp =(function(){

	var app={};

	app.map=null;
	
	app.buildingLayer=null;
	var buildingLayerSource;

	app.addressPointLayer=null;
	var addressPointLayerSource;
	
	app.osm=null;
	
	app.pubs=null;

	var layerorder;

	$(document).ready(initApp);

	/*
	 * INIT
	 */

	function initApp() {
		//initialise variables, layers and the map
		initVars();
		initMap();
		defineLayers();
	
		//add function to UI-elements
		$('#doSearch').click(function(){
			doSearch();
		});
	}

	function initVars(){
		//init all the variables
		app.pubs = new pub();

		layerorder = {
			"buildingLayer": 2,
			"osm": 1,
			"pubs": 5,
			"addressPoint": 7
		};
	}

	function initMap(){
		//init the map
		app.map = new ol.Map({
			target: 'map',
			numZoomLevels: 12,
			logo: false,
			theme: null,
			units: 'm',
			view: new ol.View({
				center: [570000, 6837140],
				zoom: 7,
				displayprojection: 'EPSG:4326',
				projection: 'EPSG:3857',
			})
		});
	}

	/*
	 * DEFINE AND ADD MAP LAYERS
	 */

	function defineLayers() {
		//define all the layers and load them on the map
	
		//buildingLayer
		addBuildingLayer();
	
		//OSM
		addOSM();
	
		//pubs
		app.pubs.createLayer(layerorder.pubs);
		app.map.addLayer(app.pubs.pubLayer);

		//addressPoint
		addAddressPointLayer();
	}

	function addBuildingLayer(){
		var buildingStyle = new ol.style.Style({
			fill: new ol.style.Fill({
				color: "rgba(150, 150, 150, 0.8)"
			}),
			stroke: new ol.style.Stroke({
				color: "rgb(100, 200, 100)",
				width: 3
			})
		});
	
		buildingLayerSource = new ol.source.Vector({});
	
		app.buildingLayer = new ol.layer.Vector({
			source: buildingLayerSource,
			style: buildingStyle
		});
	
		app.map.addLayer(app.buildingLayer);
		app.buildingLayer.setZIndex(layerorder.buildingLayer);
	}

	function addAddressPointLayer(){
		var addressPointStyle = new ol.style.Style({
			image: new ol.style.Circle({
				radius: 10,
				fill: new ol.style.Fill({
					color: '#ff9900',
					opacity: 0.6
				}),
				stroke: new ol.style.Stroke({
					color: '#ffcc00',
					opacity: 0.4
				})
			})
		});
		
		addressPointLayerSource = new ol.source.Vector({});
		app.addressPointLayer = new ol.layer.Vector({
			source: addressPointLayerSource,
			style: addressPointStyle
		});
		app.map.addLayer(app.addressPointLayer);
		app.addressPointLayer.setZIndex(layerorder.addressPoint);
		}

	function addOSM(){
		app.osm = new ol.layer.Tile({
			source: new ol.source.OSM()
		});
		app.map.addLayer(app.osm);
	}

	/*
	 * UI FUNCTIONS
	 */

	function removeAllFromBuildingLayer() {
		//remove all features from the pandenkaartlaag and the datadiv
		var feats = buildingLayerSource.getFeatures();
		for (var feat in feats){
			buildingLayerSource.removeFeature(feats[feat]);
		}
		$("#data")[0].innerHTML="";
	}

	function removeAllFromAdressPointLayer(){
		var feats = addressPointLayerSource.getFeatures();
		for (var feat in feats){
			var feats = addressPointLayerSource.removeFeature(feats[feat]);
		}
		$("#data")[0].innerHTML="";
	}

	function addWKTtoBuildingLayer(addWKT){
		//read WKT, add it to the map
		var format = new ol.format.WKT();
		var addFeature = format.readFeature(addWKT, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		});
		buildingLayerSource.addFeature(addFeature);
	}

	function addWKTtoAddressPointLayer(addWKT){
		//read WKT, add it to the map and zoom
		var format = new ol.format.WKT();
		var addFeature = format.readFeature(addWKT, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		});
		addressPointLayerSource.addFeature(addFeature);
	
		var extent = addressPointLayerSource.getExtent();
		app.map.getView().setCenter([
			(extent[0] + extent[2])/2,
			(extent[1] + extent[3])/2
		]);
		app.map.getView().setZoom(18);
	}

	function fillData(){
		//fill the data-table with data from cbs-wijk
		//only use the first returned building
		//also draw the pubs in the area
		var feature = buildingLayerSource.getFeatures()[0];
		var interpoint = feature.getGeometry().getInteriorPoint();
		var interpointCoords = interpoint.getFirstCoordinate();
		
		app.pubs.getPubs(interpoint);
	}

	function doBuildings(lat_string, lon_string){
		var lat = parseFloat(lat_string);
		var lon = parseFloat(lon_string);
		$.ajax({
			url: "http://overpass-api.de/api/interpreter",
			type: "POST",
			data: {
				//only search in the neighbourhood: offset point with 0.005 in each direction
				data: "[out:json];way[\"building\"~\".\"](" + (lat-0.005).toString() + "," + (lon-0.005).toString() + "," + (lat+0.005).toString() + "," + (lon+0.005).toString() +");(._;>;);out;"
				}
		}).done(function(data) {
			var dat = data.elements;
			var nodes = {};
			var way = {};
			for (var d in dat){
				//loop through the returned data
				//extract nodes and ways
				if (dat[d].type === "node"){
					nodes[dat[d].id]=dat[d];
				}
				else {
					if (dat[d].type === "way"){
						way[dat[d].id]=dat[d];
					}
				}
			}
			for (var w in way){
				var wkt="POLYGON((";
				for (var n in way[w].nodes){
					var node = way[w].nodes[n];
					wkt+= nodes[node].lon + " " + nodes[node].lat + ", ";
				}
				//remove the last komma and close parentices
				addWKTtoBuildingLayer(wkt.substr(0,wkt.length-2)+"))");
			}
		});
	}

	function getLocation(url){
		$.ajax({
			url: url
		}).done(function(data) {
			var addWKT = "POINT("+data[0].lon + " " + data[0].lat + ")";
			addWKTtoAddressPointLayer(addWKT);
			app.pubs.getWKTpubs(data[0].lon, data[0].lat);
			doBuildings(data[0].lat, data[0].lon);
		});
		
		$("#spinner").toggle();
	}

	function doSearch(){
		
		removeAllFromAdressPointLayer();
		removeAllFromBuildingLayer();
		
		var address = $("#ad")[0].value;
		var ad = address.replace(/\ /g,'+');
		$("#spinner").toggle();
		
		var url = "http://nominatim.openstreetmap.org/search?q=";
		url += ad
		url += "&format=json&polygon=0&addressdetails=1";
		getLocation(url);
	}

	return app;
}());
