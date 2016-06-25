var mapapp =(function(){

	var app={};

	app.map=null;
	
	app.buildingLayer=null;
	var buildingLayerSource;

	app.addressPointLayer=null;
	var addressPointLayerSource;
	
	app.osm=null;
	
	app.cbsWijkenBuurten=null;
	var cbsWijkenBuurtenSource;
	
	app.pubs=null;

	var tekenvolgorde;

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
			startZoeken();
		});
	}

	function initVars(){
		//init all the variables
		app.pubs = new pub();

		tekenvolgorde = {
			"buildingLayer": 2,
			"osm": 1,
			"cbsWijkenBuurten": 5,
			"pubs": 7,
			"addressPoint": 6
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
	
		//CBS
		//addCBSKaartlaag();
	
		//pubs
		app.pubs.createLayer(tekenvolgorde.pubs);
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
		app.buildingLayer.setZIndex(tekenvolgorde.buildingLayer);
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
		app.addressPointLayer.setZIndex(tekenvolgorde.addressPoint);
		}

	function addOSM(){
		app.osm = new ol.layer.Tile({
			source: new ol.source.OSM()
		});
		app.map.addLayer(app.osm);
	}

	function addCBSKaartlaag(){
		cbsWijkenBuurtenSource = new ol.source.ImageWMS({
			url: "https://geodata.nationaalgeoregister.nl/wijkenbuurten2014/wms",
			params: {
				"LAYERS": "cbs_wijken_2014",
				"FORMAT": "image/png",
				"CRS": "EPSG:28992"
			}
		});
		cbsWijkenBuurten = new ol.layer.Image({
			source: cbsWijkenBuurtenSource
		});
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
		
		var viewResolution = app.map.getView().getResolution();
		var url = cbsWijkenBuurtenSource.getGetFeatureInfoUrl(
			interpointCoords, viewResolution, 'EPSG:28992',{'INFO_FORMAT': 'application/json'}
		);
		if (url) {
			$.ajax({
				url: url
			}).done(function(data){
				var datprop = data.features[0].properties;
				var html = $("#data")[0].innerHTML.slice(0,-16); //remove </tbody></table>
				html += "<tr><td>Locatie:</td><td>[" + parseInt(interpointCoords[0]) + ", " + parseInt(interpointCoords[1]) + "]</td></tr>";
				html += "<tr colspan=2><td><h3>CBS 2014 data</h3></td></tr>";
				html += "<tr><td>Wijknaam:</td><td>" + datprop.wijknaam + "</td></tr>";
				html += "<tr><td>Gemeentenaam:</td><td>" + datprop.gemeentenaam + "</td></tr>";
				html += "<tr><td>Oppervlakte:</td><td>" + datprop.oppervlakte_totaal_in_ha + " ha</td></tr>";
				html += "<tr><td>Woningvoorraad:</td><td>" + datprop.woningvoorraad + "</td></tr>";
				html += "<tr><td>Aantal inwoners (tot/m/v):</td><td>" + datprop.aantal_inwoners + "/" + datprop.mannen + "/" + datprop.vrouwen + "</td></tr>";
				html += "<tr><td>Aantal huishoudens:</td><td>" + datprop.aantal_huishoudens + "</td></tr>";
				html += "<tr><td>Aantal personenauto's:</td><td>" + datprop.personenautos_totaal +  "</td></tr>";
				html += "<tr><td>Gemiddelde woningwaarde:</td><td>" + datprop.gemiddelde_woningwaarde + " x 1.000 euro</td></tr>";
				html += "<tr><td>Gemiddeld gasverbruik:</td><td>" + datprop.gemiddeld_gasverbruik_totaal + " m3/jaar </td></tr>";
				html += "<tr><td>Gemiddeld elektriciteitsverbruik:</td><td>" + datprop.gemiddeld_electriciteitsverbruik_totaal + " kWh/jaar</td></tr>";
				html += "<tr><td>Gemiddeld aantal cafe's binnen 1 km:</td><td>" + datprop.cafe_gemiddeld_aantal_binnen_1_km + "</td></tr>";
				html += "<tr><td>Gemiddelde afstand oprit hoofdverkeersweg:</td><td>" + datprop.oprit_hoofdverkeersweg_gemiddelde_afstand_in_km + " km</td></tr>";
				html += "<tr><td>Gemiddelde afstand treinstations:</td><td>" + datprop.treinstation_gemiddelde_afstand_in_km + " km</td></tr>";
				html += "</tbody></table>";
				$("#data")[0].innerHTML =html;
				$("#spinner").toggle();
			});
		}
	}

	function doBuildings(lat_string, lon_string){
		var lat = parseFloat(lat_string);
		var lon = parseFloat(lon_string);
		$.ajax({
			url: "http://overpass-api.de/api/interpreter",
			type: "POST",
			data: {
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
		var addWKT;
		$.ajax({
			url: url
		}).done(function(data) {
			addWKT = "POINT("+data[0].lon + " " + data[0].lat + ")";
			addWKTtoAddressPointLayer(addWKT);
			app.pubs.getWKTpubs(data[0].lon, data[0].lat);
			doBuildings(data[0].lat, data[0].lon);
		});

		$("#spinner").toggle();
	}

	function doSearch(ad){
		ad = ad.replace(/\ /g,'+');
		var url = "http://nominatim.openstreetmap.org/search?q=";
		url += ad
		url += "&format=json&polygon=0&addressdetails=1";
		getLocation(url);
		}

	function startZoeken(){
		//haal postcode en huisnummer op en start de zoekactie
		removeAllFromAdressPointLayer();
		removeAllFromBuildingLayer();
		var address = $("#ad")[0].value;
		$("#spinner").toggle();

		doSearch(address);

	}

	return app;
}());
