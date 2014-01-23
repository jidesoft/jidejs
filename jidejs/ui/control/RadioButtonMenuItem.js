/**
 * A RadioButton that can be used as a MenuItem.
 *
 * @module jidejs/ui/control/RadioButtonMenuItem
 * @extends module:jidejs/ui/control/RadioButton
 */
define(['./../../base/Class', './RadioButton'], function(Class, RadioButton) {
	/**
	 * Creates a new RadioButtonMenuItem.
	 *
	 * @memberof module:jidejs/ui/control/RadioButtonMenuItem
	 * @param config
	 * @constructor
	 * @alias module:jidejs/ui/control/RadioButtonMenuItem
	 */
	function RadioButtonMenuItem(config) {
		RadioButton.call(this, config);
		this.classList.add('jide-radiobuttonmenuitem');
	}
	Class(RadioButtonMenuItem).extends(RadioButton);
	return RadioButtonMenuItem;
});