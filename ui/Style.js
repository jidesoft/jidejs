/**
 * This module allows to modify the `style` property of a DOM element.
 *
 * It can update multiple properties at once and can handle browser specific prefixes as well.
 *
 * *Note*: When updating the style specification, it will override any manual changes to the `cssText` property of
 * the element.
 *
 * @module jidejs/ui/Style
 */
define([
	'./../base/Class', './../base/has'
], function(
	Class, has
) {
	var cssPropertyNames = {};

	var dashRegex = /([A-Z])/g,
		dashReplace = function(x) { return '-'+x.toLowerCase(); };
	var msRegex = /^ms-/;

	/**
	 * Creates a new `Style` object for the given element.
     *
     * @constructor
     * @alias module:jidejs/ui/Style
	 * @param {Element} element The DOM element.
	 */
	var exports = function Style(element) {
		this.element = element;
		this.properties = {};
	};
	Class(Style).def(/** @lends module:jidejs/ui/Style# */{
		/**
		 * Sets a CSS property. Allows to use CSSOM property names, i.e. `MSTransition` but does not automatically
		 * add any prefixes.
		 *
		 * *Note*: Does not update the CSS style automatically.
		 *
		 * @param {string} propertyName The property name.
		 * @param {string} value The property value
		 * @returns {module:jidejs/ui/Style}
		 */
		set: function(propertyName, value) {
			propertyName = propertyName.replace(dashRegex, dashReplace).replace(msRegex, '-ms-');
			this.properties[propertyName] = value;
			return this;
		},

		/**
		 * Removes a previously specified property from the Style.
		 *
		 * *Note*: Does not update the CSS style automatically.
		 *
		 * @param {string} propName The property name.
		 * @returns {module:jidejs/ui/Style}
		 */
		remove: function(propName) {
			delete this.properties[propName];
			return this;
		},

		/**
		 * Automatically detects any required prefixes for a CSS property and sets the prefixed property.
		 *
		 * *Note*: Does not update the CSS style automatically.
		 *
		 * @param {string} propertyName The property name.
		 * @param {string} value The property value
		 * @returns {module:jidejs/ui/Style}
		 */
		setPrefixed: function(propertyName, value) {
			var propName = has.prefix(propertyName);
			if(propName) {
				this.properties[propName] = value;
			}
			return this;
		},

		/**
		 * Updates the style of the element, overrides the `cssText` property of the element.
		 */
		update: function() {
			var style = '';
			var properties = this.properties;
			for(var propName in properties) {
				if(properties.hasOwnProperty(propName)) {
					style += propName + ':'+properties[propName]+';';
				}
			}
			this.element.style.cssText = style;
		}
	});
	return exports;
});