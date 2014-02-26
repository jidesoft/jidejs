/**
 * A PasswordField is a TextField which masks the input so that it cannot be read by the user or anyone watching him.
 *
 * It is best used to, as the name suggests, allow the user to insert a password for a login or similar action.
 *
 * @module jidejs/ui/control/PasswordField
 */
define([
    './../../base/Class', './TextField', './../Skin', './../register'
], function(Class, TextField, Skin, register) {
	function PasswordFieldSkin(input, el) {
		TextField.Skin.call(this, input, el);
	}
	Class(PasswordFieldSkin).extends(TextField.Skin).def({
        createDefaultRootElement: function() {
            var i = document.createElement('input');
            i.type = 'password';
            return i;
        }
    });

	/**
	 * Creates a new PasswordField.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/PasswordField
     * @extends module:jidejs/ui/control/TextField
     *
     * @param {object} config The configuration.
	 */
	var exports = function PasswordField(config) {
		config = config || {};
		TextField.call(this, config);
	};
	Class(exports).extends(TextField);
    exports.Skin = PasswordFieldSkin;
    register('jide-passwordfield', exports, TextField, [], []);
	return exports;
});