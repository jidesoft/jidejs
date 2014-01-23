/**
 * This module is used to create semi-private properties that have a non-guessable name and
 * are not enumerable.
 *
 * Please note that they still show up when queried using {@code Object.keys}, {@code Object.getOwnPropertyNames} and similar.
 *
 * @module jidejs/base/Name
 */
define(function() {
	var id = +new Date();
	/**
	 * @function
	 * @alias module:jidejs/base/Name
	 * @return {string} The name of the generated field.
	 */
	return function(obj, value) {
		var name = '$$_jidejs_$_'+(id++);
		Object.defineProperty(obj, name, { value: value });
		return name;
	};
});