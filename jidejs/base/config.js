define('jidejs/base/config', [], function() {
	var exports = {};

	exports.is = function(key) {
		var value = this.data[key];
		return typeof value !== 'undefined' ? value : false;
	};

	if(typeof jidejs !== 'undefined') {
		exports.data = jidejs;
	} else {
		exports.data = {};
	}

	return exports;
});