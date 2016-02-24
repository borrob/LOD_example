var map;

var rdProjection;

var brtAchtgrondPastelOptions;
var brtAchtergrondPastel;

var pandenKaartlaag;
var pandenKaartlaagSource;

var osm;

$(document).ready(initApp);

function initApp() {
	//initialise variables, layers and the map
	initVars();
	initMap();
	defineLayers();

	$('#getBAG').click(function(){
		getBAGpand();
	});
}

function initVars(){
	//init all the variables
	rdProjection = ol.proj.get('EPSG:28992');
	rdProjection.setExtent([-7000, 289000, 300000, 629000]);
}

function initMap(){
	//init the map
	map = new ol.Map({
		target: 'map',
		numZoomLevels: 12,
		logo: false,
		units: 'm',
		displayProjection: rdProjection,
		view: new ol.View({
			center: [155000, 483000],
			zoom: 3,
			projection: rdProjection,
			maxExtent: rdProjection.getExtent()
		})
	});
}

function defineLayers() {
	//define all the layers and load them on the map

	//pandenkaartlaag
	pandenKaartlaagSource = new ol.source.Vector({
		//features: [feature]
	});

	pandenKaartlaag = new ol.layer.Vector({
		source: pandenKaartlaagSource
	});

	map.addLayer(pandenKaartlaag);
	pandenKaartlaag.setZIndex(10);

	//BRTachtergrondkaartPastel
	var parser = new ol.format.WMTSCapabilities();
	$.ajax({
		url: 'https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaartpastel?layer=brtachtergrondkaartpastel&style=default&tilematrixset=EPSG%3A28992&Service=WMTS&Request=GetCapabilities'
	}).done(
		function(response) {
			var result = parser.read(response);
			brtAchtgrondPastelOptions = ol.source.WMTS.optionsFromCapabilities(
				result,
				{
					layer: 'brtachtergrondkaartpastel', matrixSet: 'EPSG:28992'
				}
			);
			brtAchtergrondPastel = new ol.layer.Tile({
				source: new ol.source.WMTS(brtAchtgrondPastelOptions)
			});
			map.addLayer(brtAchtergrondPastel);
			brtAchtergrondPastel.setZIndex(0);
		}
	);

	//OSM
	osm = new ol.layer.Tile({
		source: new ol.source.OSM()
	});
}

function removeAllFromPandenKaartlaag() {
	//remove all features from the pandenkaartlaag
	var feats = pandenKaartlaagSource.getFeatures();
	for (var feat in feats){
		pandenKaartlaagSource.removeFeature(feats[feat]);
	}
}

function addWKTtoPandenKaartlaag(addWKT){
	//read WKT and add it to the map (and zoom)
	var format = new ol.format.WKT();
	var addFeature = format.readFeature(addWKT, {
		dataProjection: 'EPSG:4326',
		featureProjection: 'EPSG:28992'
	});
	pandenKaartlaagSource.addFeature(addFeature);

	var extent = pandenKaartlaagSource.getExtent();
	map.getView().setCenter([
		(extent[0] + extent[2])/2,
		(extent[1] + extent[3])/2
	]);
	map.getView().setZoom(11);
}

function getBAGpand(pc, hn){
	//zoek het adres met pc en hn op via SPARQL en voeg alle gevonden records toe aan de kaart
	var url = "http://almere.pilod.nl/sparql?default-graph-uri=&query=SELECT+DISTINCT+%3Fgeom+%3Fhuisnummer+%3Fpc%0D%0AWHERE+%7B%0D%0A%3Fnummer+a+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23Nummeraanduiding%3E+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23postcode%3E+%3Fpc+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23huisnummer%3E+%3Fhuisnummer+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23gerelateerdeOpenbareRuimte%3E+%3For+.%0D%0A%3Fvo+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23hoofdadres%3E+%3Fnummer+.+%0D%0A%3Fvo+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23onderdeelVan%3E+%3Fpand+.%0D%0A%3Fpand+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23hasGeometry%3E+%3Fgeompand+.%0D%0A%3Fgeompand+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23asWKT%3E+%3Fgeom+.%0D%0AFILTER+regex%28%3Fpc%2C+%22" + pc + "%22%2C+%22i%22%29%0D%0AFILTER+%28xsd%3Ainteger%28%3Fhuisnummer%29+%3D+xsd%3Ainteger%28" + hn + "%29%29+.%0D%0A%7D+order+by+ASC%28%3Fpc%29+ASC%28%3Fhuisnummer%29&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on"
	console.log('Er is geklikt. Maar de Cross-origin werkt nog niet lekker');
	$.ajax({
		url: url
	}).done(function(data) {
		removeAllFromPandenKaartlaag();
		for (var binding in data.results.bindings){
			var addWKT = data.results.bindings[binding].geom.value;
			addWKTtoPandenKaartlaag(addWKT);
		}
	});
}
