//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '/bower_components/jidejs'
	}],
    paths: {
        text: '/bower_components/requirejs-text/text'
    }
});
//endregion

//region application code
require([
	'jidejs/base/ObservableList',
	'jidejs/ui/control/ListView'
], function(
	ObservableList, ListView
) {
	"use strict";

	var dataArray = [];
	for(var i = 0; i < 10000; i++) {
		dataArray[i] = i+1;
	}

	function even(i) {
		return (i & 1) === 0;
	}

	var data = new ObservableList(dataArray);

	var list = new ListView({
		// high performance filtering
		items: data.asStream(50, 500).filter(even),
		// uncomment to see full data (no filtering, but still fast)
		// items: data.asStream(50, 500),

		// uncomment to see standard filter behaviour
		// items: data.filter(even),

		// uncomment to see standard behaviour
		// items: data,

		style: {
			width: '500px',
			height: '500px'
		}
	});
	document.getElementById('approot').appendChild(list.element);
});