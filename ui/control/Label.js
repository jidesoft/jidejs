/**
 * A Label is used to display text and an optional graphic.
 *
 * @module jidejs/ui/control/Label
 */
define([
	'./../../base/Class', './../Component', './Labeled', './../Skin', './../register'
], function(Class, Component, Labeled, Skin, register) {
	/**
	 * Creates a new Label control.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/Label
     * @extends module:jidejs/ui/control/Labeled
     *
     * @param {object} config The configuration
	 */
	var exports = function Label(config) {
		config = config || {};
		Labeled.call(this, config);
		this.classList.add('jide-label');
	};

	Class(Label).extends(Labeled);

	exports.Skin = Skin.create(Labeled.Skin, {
		defaultElement: 'label'
	});

    register('jide-label', Label, Labeled, [], []);

	return exports;
});