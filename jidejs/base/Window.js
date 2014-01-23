/**
 * This module provides a set of observables that contain the available width and height of the browser window.
 * These values are particularly useful if you want to create an application that uses the full height of the screen
 * but only scrolls in specific areas.
 *
 * The values are updated when the browser is resized.
 *
 * @module jidejs/base/Window
 */
define([
	'./Observable',
	'./Util'
], function(Observable, _) {
	"use strict";

	var Window = {
		/**
		 * Returns the height of the window.
		 * @returns {Number}
		 */
		get height() {
			return this.heightProperty.get();
		},

		/**
		 * Returns the width of the window.
		 * @returns {Number}
		 */
		get width() {
			return this.widthProperty.get();
		},

		/**
		 * The height of the window as a property.
		 * @type {module:jidejs/base/Observable}
		 */
		heightProperty: Observable.computed(function() {
			return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		}),

		/**
		 * The width of the window as a property.
		 * @type {module:jidejs/base/Observable}
		 */
		widthProperty: Observable.computed(function() {
			return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		})
	};

	window.addEventListener('resize', _.throttle(function() {
		Window.heightProperty.invalidate();
		Window.widthProperty.invalidate();
	}, 200), false);

	return Window;
});