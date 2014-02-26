/**
 * A RadioButton that can be used as a MenuItem.
 *
 * @module jidejs/ui/control/RadioButtonMenuItem
 */
define(['./../../base/Class', './RadioButton'], function(Class, RadioButton) {
	/**
	 * Creates a new RadioButtonMenuItem.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/RadioButtonMenuItem
     * @extends module:jidejs/ui/control/RadioButton
     *
     * @param {object} config The configuration object.
	 */
	var exports = function RadioButtonMenuItem(config) {
		RadioButton.call(this, config);
		this.classList.add('jide-radiobuttonmenuitem');
	};
	Class(RadioButtonMenuItem).extends(RadioButton);
    RadioButtonMenuItem.Skin = RadioButton.Skin;
	return RadioButtonMenuItem;
});