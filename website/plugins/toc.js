/**
 * A simple plugin that helps to create generate a simple (two-level deep) table of contents.
 * @param env
 * @param callback
 */
module.exports = function(env, callback) {
	"use strict";

	function getFiles(directory) {
		return Object.getOwnPropertyNames(directory).filter(function(fileName) {
			return directory[fileName] && directory[fileName].metadata && directory[fileName].metadata.view !== 'none';
		}).map(function(fileName) {
			return directory[fileName];
		}).sort(function(a, b) {
			return a.filename.localeCompare(b.filename);
		});
	}

	function getSubtree(contents) {
		var files = Object.getOwnPropertyNames(contents);
		return files.filter(function(fileName) {
			return contents[fileName] && contents[fileName]['index.json'];
		}).sort().map(function(fileName) {
			var directory = contents[fileName];
			return {
				title: directory['index.json'].metadata.title,
				children: getFiles(directory)
			};
		});
	}

	env.helpers.getSubtree = getSubtree;

	callback();
};