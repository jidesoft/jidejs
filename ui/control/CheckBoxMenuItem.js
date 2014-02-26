/**
 * A CheckBoxMenuItem is a specialized menu item that is rendered as a CheckBox.
 *
 * @module jidejs/ui/control/CheckBoxMenuItem
 */
define([
    './../../base/Class', './CheckBox', './../Skin', './../register'
], function(Class, CheckBox, Skin, register) {
	/**
	 * Creates a new CheckBoxMenuItem.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/CheckBoxMenuItem
     * @extends module:jidejs/ui/control/CheckBox
     *
     * @param {object} config The configuration.
	 */
	var exports = function CheckBoxMenuItem(config) {
		config || (config = {});
		CheckBox.call(this, config);
		this.classList.add('jide-checkboxmenuitem');
	};
	Class(exports).extends(CheckBox);
	exports.Skin = Skin.create(CheckBox.Skin);

    register('jide-checkboxmenuitem', exports, CheckBox, [], []);
	return exports;
});