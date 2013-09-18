/**
 * A PasswordField is a TextField which masks the input so that it cannot be read by the user or anyone watching him.
 *
 * It is best used to, as the name suggests, allow the user to insert a password for a login or similar action.
 *
 * @module jidejs/ui/control/PasswordField
 * @extends module:jidejs/ui/control/TextField
 */
define(['jidejs/base/Class', 'jidejs/ui/control/TextField', 'jidejs/ui/Skin'], function(Class, TextField, Skin) {
	function PasswordFieldSkin(input, el) {
		this.component = input;
		this.element = el || (function() {
			var i = document.createElement('input');
			i.type = 'password';
			return i;
		}());
	}
	Class(PasswordFieldSkin).extends(Skin);

	/**
	 * Creates a new PasswordField.
	 * @memberof module:jidejs/ui/control/PasswordField
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/PasswordField
	 */
	function PasswordField(config) {
		config = config || {};
		if(!config.skin) {
			config.skin  = new PasswordFieldSkin(this, config.element);
		}
		TextField.call(this, config);
	}
	Class(PasswordField).extends(TextField);
	return PasswordField;
});