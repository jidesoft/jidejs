module.exports = function(env, callback) {
	"use strict";
	var urlmapping = require('./../contents/api/urlmapping');
	function linkTo(text, page) {
		text || (text = page.html || page.markdown);
		text || (text = '');
		return text.replace((/\{@link\s+([^\}\s]+)(\s+([^\}]+))?\}/g), function(match) {
			var c = RegExp.$1, url, text = RegExp.$2 || c.replace(/^module:/, '');
			if(c in urlmapping) url = urlmapping[c];
			else if(('module:'+c) in urlmapping) url = urlmapping['module:'+c];
			else {
				console.log("Couldn't find mapping for "+c);
				return match;
			}
			return '<a href="/api/'+url+'">'+text+'</a>';
		});
	}

	env.helpers.doclink = linkTo;

	callback();
};