var mapapp =(function(){

	var app={};

	app.map=null;
	
	app.pandenKaartlaag=null;
	var pandenKaartlaagSource;
	
	app.bagPandenKaartlaag=null;
	var bagPandenKaartlaagSource;

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
			"pandenKaartlaag": 10,
			"bagPandenKaartlaag": 4,
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
	
		//pandenKaartlaag
		//addPandenKaartlaag();
	
		//bagpanden
		//addBagPandenKaartlaag();
	
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

	function addPandenKaartlaag(){
		var oranjeStijl = new ol.style.Style({
			fill: new ol.style.Fill({
				color: "rgba(223, 117, 20, 0.3)"
			}),
			stroke: new ol.style.Stroke({
				color: "rgb(223, 117, 20)",
				width: 3
			})
		});
	
		pandenKaartlaagSource = new ol.source.Vector({});
	
		app.pandenKaartlaag = new ol.layer.Vector({
			source: pandenKaartlaagSource,
			style: oranjeStijl
		});
	
		app.map.addLayer(app.pandenKaartlaag);
		app.pandenKaartlaag.setZIndex(tekenvolgorde.pandenKaartlaag);
	}

	function addAddressPointLayer(){
		//TODO: add style
		
		addressPointLayerSource = new ol.source.Vector({});
		app.addressPointLayer = new ol.layer.Vector({
			source: addressPointLayerSource
			//TODO: add style
		});
		app.map.addLayer(app.addressPointLayer);
		app.addressPointLayer.setZIndex(tekenvolgorde.addressPoint);
		}

	function addBagPandenKaartlaag(){
		bagPandenKaartlaagSource = new ol.source.ImageWMS({
			url: "https://geodata.nationaalgeoregister.nl/bag/wms?",
			params: {
				"LAYERS": "pand",
				"FORMAT": "image/png",
				"CRS": "EPSG:28992"
			}
		});
	
		app.bagPandenKaartlaag = new ol.layer.Image({
			source: bagPandenKaartlaagSource,
			opacity: 0.5
		});
	
		app.map.addLayer(app.bagPandenKaartlaag);
		app.bagPandenKaartlaag.setZIndex(tekenvolgorde.bagPandenKaartlaag);
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

	function removeAllFromPandenKaartlaag() {
		//remove all features from the pandenkaartlaag and the datadiv
		var feats = pandenKaartlaagSource.getFeatures();
		for (var feat in feats){
			pandenKaartlaagSource.removeFeature(feats[feat]);
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

	function addWKTtoPandenKaartlaag(addWKT){
		//read WKT, add it to the map and zoom
		var format = new ol.format.WKT();
		var addFeature = format.readFeature(addWKT, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:28992'
		});
		pandenKaartlaagSource.addFeature(addFeature);
	
		var extent = pandenKaartlaagSource.getExtent();
		app.map.getView().setCenter([
			(extent[0] + extent[2])/2,
			(extent[1] + extent[3])/2
		]);
		app.map.getView().setZoom(12);
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
		app.map.getView().setZoom(17);
	}

	function fillData(){
		//fill the data-table with data from cbs-wijk
		//only use the first returned building
		//also draw the pubs in the area
		var feature = pandenKaartlaagSource.getFeatures()[0];
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

	function getBAGpandFromUrl(url){
		$.ajax({
			url: url,
			dataType: "jsonp"
		}).done(function(data) {
			if (data.results.bindings.length>0){
				var html = "<table><tbody>";
				if (data.results.bindings[0].straat!=undefined){
					html +="<tr><td>Straat: </td><td>" + data.results.bindings[0].straat.value + "</td></tr>";
				}
				html += "<tr><td>Huisnummer:</td><td>" + data.results.bindings[0].huisnummer.value;
				if (data.results.bindings[0].huisletter!=undefined) {
					html += "-" + data.results.bindings[0].huisletter.value
				}
				if (data.results.bindings[0].toevoeging!=undefined) {
					html += "-" + data.results.bindings[0].toevoeging.value
				}
				html += "</td></tr>";
				html += "<tr><td>Postcode:</td><td>" + data.results.bindings[0].pc.value + "</td></tr>";
				if (data.results.bindings[0].plaats!=undefined){
					html += "<tr><td>Plaats:</td><td>" + data.results.bindings[0].plaats.value + "</td></tr>";
				}
				html += "</tbody></table>";
				$("#data")[0].innerHTML += html;
				for (var binding in data.results.bindings){
					var addWKT = data.results.bindings[binding].geom.value;
					addWKTtoPandenKaartlaag(addWKT);
				}
				//add data about this feature to the table
				fillData();
			} else {
				//geen data binnengekomen
				var html = "<p>Sorry... geen data gevonden.</p>";
				$("#data")[0].innerHTML += html;
				$("#spinner").toggle();
			}
		});
	}

	function getLocation(url){
		console.log(url);
		$.ajax({
			url: url
		}).done(function(data) {
			console.log(data);
			var addWKT = "POINT("+data[0].lon + " " + data[0].lat + ")";
			addWKTtoAddressPointLayer(addWKT);
			app.pubs.getWKTpubs(data[0].lon, data[0].lat);
		});
		$("#spinner").toggle();
	}

	function doSearch(ad){
		removeAllFromAdressPointLayer();
		ad = ad.replace(/\ /g,'+');
		console.log(ad);
		var url = "http://nominatim.openstreetmap.org/search?q=";
		url += ad
		url += "&format=json&polygon=0&addressdetails=1";
		getLocation(url);
		}

	function startZoeken(){
		//haal postcode en huisnummer op en start de zoekactie
		removeAllFromAdressPointLayer();
		var address = $("#ad")[0].value;
		$("#spinner").toggle();

		doSearch(address);

	}

	return app;
}());
