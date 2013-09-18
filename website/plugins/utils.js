/**
 * Generic utility function for the templates.
 * @param env
 * @param callback
 */
module.exports = function(env, callback) {
	"use strict";

	env.helpers.startsWith = function(str, start) {
		if(start === '') return true;
		if(str == null || start == null) return false;
		str = String(str); start = String(start);
		return str.length >= start.length && str.slice(0, start.length) === start;
	};

	callback();
};