var pub = function(){

	var pub={};

	var pubLayerSource;
	pub.pubLayer=null;

	pub.createLayer = function(index){
		//create the Layer for the pub places
		var pubLayerStyle = new ol.style.Style({
			"pointRadius":20
		});
		
		pubLayerSource = new ol.source.Vector({
			//features: [feature]
		});
		
		pub.pubLayer = new ol.layer.Vector({
			source: pubLayerSource
			//,
			//style: pubLayerStyle
		});
		
		pub.pubLayer.setZIndex(index);
	};

	pub.removeAll = function(){
		//remove all pubs from the layer
		var feats = pubLayerSource.getFeatures();
		for (var feat in feats){
			pubLayerSource.removeFeature(feats[feat]);
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
				data: "[out:json];node[amenity=pub](" + (lat-0.1).toString() + "," + (lon-0.1).toString() + "," + (lat+0.1).toString() + "," + (lon+0.1).toString() +");out;"
			}
		}).done(
			function(result){
				console.log(result);
				addPubsToSource(result);
			}
		);
	}

	addPubsToSource = function(pubs_json){
		//add the pubs from pubs_json to the pubLayerSoure
		var elems = pubs_json.elements;
		for (var el in elems){
			console.log(el, elems[el]);
			//var theName = elems[el].tags.name || "no_name";
			console.log(elems[el].lat, elems[el].lon);
			var lon = elems[el].lat;
			var lat = elems[el].lon;
			var coor = new ol.geom.Point([lat, lon]);
			coor.transform('EPSG:4326', 'EPSG:28992');
			var feat = new ol.Feature({
				geometry: coor,
				//dataProjection: 'EPSG:4326',
				//featureProjection: 'EPSG:28992',
				name: "testname"
			});
			console.log(feat);
			pubLayerSource.addFeature(feat);
		}
	}

	return pub;
};
