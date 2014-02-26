/**
 * A Button control should be used to allow users to invoke commands and actions such as "Save" and "Update".
 *
 * It should never be used to toggle states or display a popup menu, offering more choices, since there are specialized
 * controls for those purposes: {@link module:jidejs/ui/control/ToggleButton ToggleButton} and
 * {@link module:jidejs/ui/control/PopupButton PopupButton}.
 *
 * @module jidejs/ui/control/Button
 */
define([
	'./../../base/Class', './../Component', './../Skin', './ButtonBase',
	'./../register'
], function(Class, Component, Skin, ButtonBase, register) {
		/**
		 * Creates a new Button.
		 *
		 * @example
		 * var myButton = new Button({
		 *     text: 'Save',
		 *     on: {
		 *     	action: function() {
		 *     		alert('Data was saved!');
		 *     	}
		 *     }
		 * });
		 *
		 * @constructor
		 * @alias module:jidejs/ui/control/Button
         * @extends module:jidejs/ui/control/ButtonBase
         * @param {object} config The Button configuration.
		 */
		var exports = function Button(config) {
			if(!config) config = {};
			ButtonBase.call(this, config);
			this.classList.add('jide-button');
		};
		Class(exports).extends(ButtonBase);
    /**
     * The default Skin used by buttons.
     * @type {module:jidejs/ui/Skin}
     */
        exports.Skin = Skin.create(ButtonBase.Skin, {
            /**
             * @memberof! module:jidejs/ui/control/Button.Skin#
             */
            defaultElement: 'button'
        });
		register('jide-button', exports, ButtonBase);
		return exports;
});