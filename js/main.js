require.config({
	paths: {
		'jQuery': 'jquery-2.2.0.min',
		'openLayers': 'ol',
		'proj': 'proj4'
	},
	shim: {
		'jQuery': {
			exports: '$'
		},
		'proj': {
			exports: 'proj4'
		},
		'openLayers': {
			exports: 'ol'
		}
	}
});
requirejs(["app"], function(App){
	var theApp = App;
	theApp();
	console.log(theApp.map);
})
