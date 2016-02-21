var map;
var brtAchtergrondPastel;
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
			brtAchtergrondPastel
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
	})
}
