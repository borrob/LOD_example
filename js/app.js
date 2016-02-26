var map;

var rdProjection;

var brtAchtgrondPastelOptions;
var brtAchtergrondPastel;

var pandenKaartlaag;
var pandenKaartlaagSource;

var osm;

var cbsWijkenBuurten;
var cbsWijkenBuurtenSource;

$(document).ready(initApp);

function initApp() {
	//initialise variables, layers and the map
	initVars();
	initMap();
	defineLayers();

	$('#getBAG').click(function(){
		startZoeken();
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
		theme: null,
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

	var oranjeStijl = new ol.style.Style({
		fill: null,
		stroke: new ol.style.Stroke({
			color: "rgb(223, 117, 20)",
			width: 3
		})
	});
	//pandenkaartlaag
	pandenKaartlaagSource = new ol.source.Vector({
		//features: [feature]
	});

	pandenKaartlaag = new ol.layer.Vector({
		source: pandenKaartlaagSource,
		style: oranjeStijl
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

	//CBS
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
	//map.addLayer(cbsWijkenBuurten);
	//cbsWijkenBuurten.setZIndex(5);
}

function removeAllFromPandenKaartlaag() {
	//remove all features from the pandenkaartlaag and the datadiv
	var feats = pandenKaartlaagSource.getFeatures();
	for (var feat in feats){
		pandenKaartlaagSource.removeFeature(feats[feat]);
	}
	$("#data")[0].innerHTML="";
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

function fillData(){
	//fill the data-table with data from cbs-wijk
	//we gebruiken enkel de het eerste pand dat we terug krijgen
	var feature = pandenKaartlaagSource.getFeatures()[0];
	var interpoint = feature.getGeometry().getInteriorPoint().getFirstCoordinate();
	var viewResolution = map.getView().getResolution();
	var url = cbsWijkenBuurtenSource.getGetFeatureInfoUrl(
		interpoint, viewResolution, 'EPSG:28992',{'INFO_FORMAT': 'application/json'}
	);
	if (url) {
		$.ajax({
			url: url
		}).done(function(data){
			var datprop = data.features[0].properties;
			var html = $("#data")[0].innerHTML.slice(0,-16); //remove </tbody></table>
			html += "<tr><td>Locatie:</td><td>[" + parseInt(interpoint[0]) + ", " + parseInt(interpoint[1]) + "]</td></tr>";
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
		});
	}
}

function getBAGpand(pc, hn){
	//zoek het adres met pc en hn op via SPARQL en voeg alle gevonden records toe aan de kaart
	var url = "http://almere.pilod.nl/sparql?default-graph-uri=&query=SELECT+DISTINCT+%3Fstraat+%3Fhuisnummer+%3Fpc+%3Fplaats+%3Fgeom%0D%0AWHERE+%7B%0D%0A%3Fnummer+a+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23Nummeraanduiding%3E+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23postcode%3E+%3Fpc+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23huisnummer%3E+%3Fhuisnummer+.%0D%0A%3Fnummer+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23gerelateerdeOpenbareRuimte%3E+%3For+.%0D%0A%3For+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23naamOpenbareRuimte%3E+%3Fstraat+.%0D%0A%3For+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23woonplaatsOpenbareRuimte%3E+%3Fwp+.%0D%0A%3Fwp+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23woonplaatsnaam%3E+%3Fplaats+.%0D%0A%3Fvo+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23hoofdadres%3E+%3Fnummer+.+%0D%0A%3Fvo+%3Chttp%3A%2F%2Fbag.kadaster.nl%2Fdef%23onderdeelVan%3E+%3Fpand+.%0D%0A%3Fpand+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23hasGeometry%3E+%3Fgeompand+.%0D%0A%3Fgeompand+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23asWKT%3E+%3Fgeom+.%0D%0AFILTER+regex%28%3Fpc%2C+%22" + pc + "%22%2C+%22i%22%29%0D%0AFILTER+%28xsd%3Ainteger%28%3Fhuisnummer%29+%3D+xsd%3Ainteger%28%22" + hn + "%22%29%29+.%0D%0A%7D&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on"
	$.ajax({
		url: url
	}).done(function(data) {
		var html = "<table><tbody><tr><td>Straat: </td><td>";
		html += data.results.bindings[0].straat.value + "</td></tr>";
		html += "<tr><td>Huisnummer:</td><td>" + data.results.bindings[0].huisnummer.value + "</td></tr>";
		html += "<tr><td>Postcode:</td><td>" + data.results.bindings[0].pc.value + "</td></tr>";
		html += "<tr><td>Plaats:</td><td>" + data.results.bindings[0].plaats.value + "</td></tr>";
		html += "</tbody></table>";
		$("#data")[0].innerHTML += html;
		for (var binding in data.results.bindings){
			var addWKT = data.results.bindings[binding].geom.value;
			addWKTtoPandenKaartlaag(addWKT);
		}
		//add data about this feature to the table
		fillData();
	});
}

function startZoeken(){
	//haal postcode en huisnummer op en start de zoekactie
	removeAllFromPandenKaartlaag();
	var pc = $("#pc")[0].value;
	var hn = $("#hn")[0].value;
	$("#data")[0].innerHTML = "<h2>Zoekresultaten voor: " + pc + "-" + hn + "</h2>";
	getBAGpand(pc, hn);
}
