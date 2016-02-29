var pub = function(){

	var pub={};

	var pubLayerSoure;
	pub.pubLayer=null;

	pub.createLayer = function(index){
		//create the Layer for the pub places
		var pubLayerStyle = new ol.style.Style({
			"pointRadius":20
		});
		
		pubLayerSoure = new ol.source.Vector({
			//features: [feature]
		});
		
		pub.pubLayer = new ol.layer.Vector({
			source: pubLayerSoure,
			style: pubLayerStyle
		});
		
		pub.pubLayer.setZIndex(index);
		
		return pub.pubLayer
	};

	pub.removeAll = function(){
		//remove all pubs from the layer
		var feats = pubLayerSoure.getFeatures();
		for (var feat in feats){
			pubLayerSoure.removeFeature(feats[feat]);
		}
	};

	pub.getPubs = function(the_point){
		//retrieve all the pubs around [lat, lon] from OSM
		the_point.transform('EPSG:28992', 'EPSG:4326');
		var lon=the_point.getCoordinates()[0];
		var lat=the_point.getCoordinates()[1];
		$.ajax({
			url: "http://overpass-api.de/api/interpreter",
			type: "POST",
			data: {
				data: "node[amenity=pub](" + (lat-0.1).toString() + "," + (lon-0.1).toString() + "," + (lat+0.1).toString() + "," + (lon+0.1).toString() +");out;"
			}
		}).done(
			function(result){
				console.log(result);
			}
		);
	}

	return pub;
};
