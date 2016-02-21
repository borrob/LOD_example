var map;
var brtAchtergrondPastel;
var bagKaartlaag;
var rdProjection;
var rdProjectionExtent;
var size;
var resolutions;
var matrixIds;

$(document).ready(initApp);

function initApp() {
	//initialise variables, layers and the map
	initVars();
	defineLayers();
	initMap();
	$('#getBAG').click(function(){
		console.log('Er is geklikt.');
		$.post("http://almere.pilod.nl/sparql?default-graph-uri=&query=SELECT+DISTINCT+%3Fgeom+%3Fhuisnummer+%3Fpc%0D%0AWHERE+%7B%0D%0A%3Fnummer+a+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23Nummeraanduiding%3E+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23postcode%3E+%3Fpc+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23huisnummer%3E+%3Fhuisnummer+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23gerelateerdeOpenbareRuimte%3E+%3For+.%0D%0A%3Fvo+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23hoofdadres%3E+%3Fnummer+.+%0D%0A%3Fvo+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23onderdeelVan%3E+%3Fpand+.%0D%0A%3Fpand+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23hasGeometry%3E+%3Fgeompand+.%0D%0A%3Fgeompand+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23asWKT%3E+%3Fgeom+.%0D%0AFILTER+regex%28%3Fpc%2C+%221223LS%22%2C+%22i%22%29%0D%0AFILTER+%28xsd%3Ainteger%28%3Fhuisnummer%29+%3D+xsd%3Ainteger%289%29%29+.%0D%0A%7D+order+by+ASC%28%3Fpc%29+ASC%28%3Fhuisnummer%29&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on", null, function(data) {
				console.log('Dit is het eerste resultaat: geometry van het pand.');
				console.log(data.results.bindings[0].geom.value);
			}
		);
	});
}

function initVars(){
	//init all the variables
	rdProjection = ol.proj.get('EPSG:28992');
	rdProjection.setExtent([-7000, 300000, 289000, 629000]);
	rdProjectionExtent = rdProjection.getExtent();
	size = ol.extent.getWidth(rdProjectionExtent) / 256;
	resolutions = new Array(14);
	matrixIds = new Array(14);
	for (var z = 0; z < 15; ++z) {
		// generate resolutions and matrixIds arrays for this WMTS
		resolutions[z] = size / Math.pow(2, z);
		matrixIds[z] = 'EPSG:28992:' + z;
	}
}

function initMap(){
	//init the map
	map = new ol.Map({
		target: 'map',
		layers: [
			brtAchtergrondPastel,
			bagKaartlaag
		],
		numZoomLevels: 12,
		logo: false,
		units: 'm',
		displayProjection: rdProjection,
		view: new ol.View({
			center: [155000, 483000],
			zoom: 3,
			projection: rdProjection,
			maxExtent: rdProjectionExtent
		})
	});
}

function defineLayers() {
	//define all the layers to show on the map
	brtAchtergrondPastel = new ol.layer.Tile({
		source: new ol.source.WMTS({
			url: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts/brtachtergrondkaartpastel",
			layer: 'brtachtergrondkaartpastel',
			matrixSet: 'EPSG:28992',
			format: 'image/png',
			projection: rdProjection,
			tileGrid: new ol.tilegrid.WMTS({
				origin: ol.extent.getTopLeft(rdProjectionExtent),
				resolutions: resolutions,
				matrixIds: matrixIds
			}),
			style: 'default',
			wrapX: true
		})
	});

	bagKaartlaag = new ol.layer.Tile({
		source: new ol.source.WMTS({
			url: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts/bag",
			layer: 'bag',
			matrixSet: 'EPSG:28992',
			format: 'image/png',
			projection: rdProjection,
			tileGrid: new ol.tilegrid.WMTS({
				origin: ol.extent.getTopLeft(rdProjectionExtent),
				resolutions: resolutions,
				matrixIds: matrixIds
			}),
			style: 'default',
			wrapX: true
		})
	})
}
