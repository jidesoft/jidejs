/**
 * A CheckBoxMenuItem is a specialized menu item that is rendered as a CheckBox.
 *
 * @module jidejs/ui/control/CheckBoxMenuItem
 * @extends module:jidejs/ui/control/CheckBox
 */
define([
    'jidejs/base/Class', 'jidejs/ui/control/CheckBox', 'jidejs/ui/Skin', 'jidejs/ui/register'
], function(Class, CheckBox, Skin, register) {
	/**
	 * Creates a new CheckBoxMenuItem.
	 *
	 * @memberof module:jidejs/ui/control/CheckBoxMenuItem
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/CheckBoxMenuItem
	 */
	function CheckBoxMenuItem(config) {
		config || (config = {});
		config.skin || (config.skin = new CheckBoxMenuItem.Skin(this, config.element));
		CheckBox.call(this, config);
		this.classList.add('jide-checkboxmenuitem');
	}
	Class(CheckBoxMenuItem).extends(CheckBox);
	CheckBoxMenuItem.Skin = Skin.create(CheckBox.Skin);

    register('jide-checkboxmenuitem', CheckBoxMenuItem, CheckBox, [], []);
	return CheckBoxMenuItem;
});