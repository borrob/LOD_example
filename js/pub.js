var pub = function(){

	var pub={};

	var pubLayerSource;
	pub.pubLayer=null;

	pub.createLayer = function(index){
		//create the Layer for the pub places
		var pubLayerStyle = new ol.style.Style({
			image: new ol.style.RegularShape({
				radius1: 10,
				radius2: 5,
				points: 7,
				fill: new ol.style.Fill({
					color: "rgba(0, 128, 500, 0.5)"
				}),
				stroke: new ol.style.Stroke({
					width: 1,
					color: "rgba(0, 128, 500, 1)"
				})
			})
		});
		
		pubLayerSource = new ol.source.Vector({
			//features: [feature]
		});
		
		pub.pubLayer = new ol.layer.Vector({
			source: pubLayerSource,
			style: pubLayerStyle
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

	pub.getWKTpubs = function (lon, lat) {
		lon = parseFloat(lon);
		lat = parseFloat(lat);
		pub.removeAll();
		$.ajax({
			url: "http://overpass-api.de/api/interpreter",
			type: "POST",
			data: {
				data: "[out:json];node[\"amenity\"~\"pub|bar|biergarten\"](" + (lat-0.1).toString() + "," + (lon-0.1).toString() + "," + (lat+0.1).toString() + "," + (lon+0.1).toString() +");out;"
			}
		}).done(
			function(result){
				addPubsToSource(result);
			}
		);
	}

	addPubsToSource = function(pubs_json){
		//add the pubs from pubs_json to the pubLayerSoure
		if (pubs_json.elements != undefined){
			var elems = pubs_json.elements;
			if (elems.length > 0){
				for (var el in elems){
					var theName = elems[el].tags.name || "no_name";
					var lon = elems[el].lat;
					var lat = elems[el].lon;
					var coor = new ol.geom.Point([lat, lon]);
					coor.transform('EPSG:4326', 'EPSG:3857');
					var feat = new ol.Feature({
						geometry: coor,
						name: theName
					});
					pubLayerSource.addFeature(feat);
				}
			}
		}
	}
	return pub;
};
