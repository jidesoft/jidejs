/**
 * A CheckBox is a special kind of button used to allow users to enable or disable certain options.
 * It is therefore similiar to {@link module:jidejs/ui/control/ToggleButton} but is displayed radically different from it
 * and looks more like a checkbox the user may know from paper forms.
 *
 * CheckBoxes in jide.js support three states that the user can toggle between:
 *
 * * indeterminate
 * * not selected
 * * selected
 *
 * As opposed to standard {@link module:jidejs/ui/control/Button Buttons} you should not listen to the `action` event
 * and instead observe its {@link #selected} and {@link #indeterminate} state.
 *
 * @module jidejs/ui/control/CheckBox
 */
define([
    './../../base/Class', './../../base/ObservableProperty', './../Skin', './ButtonBase', './Toggle',
	'./../../base/Util', './Templates', './../register'
], function(Class, Observable, Skin, ButtonBase, Toggle, _, Templates, register) {
		/**
		 * Creates a new CheckBox.
		 *
		 * @constructor
		 * @alias module:jidejs/ui/control/CheckBox
         * @extends module:jidejs/ui/control/ButtonBase
         * @extends module:jidejs/ui/control/Toggle
         *
         * @param {object} config The configuration.
		 */
		var exports = function CheckBox(config) {
			installer(this);
			Toggle.installer(this);
			config || (config = {});
			ButtonBase.call(this, config);
			Toggle.call(this);

			this.classList.add('jide-checkbox');
		};

		Class(exports).extends(ButtonBase).mixin(Toggle).def(/** @lends module:jidejs/ui/control/CheckBox# */{
			/**
			 * `true`, if the CheckBox is selected; `false`, otherwise.
			 *
			 * The value of this property does not matter when the {@link #indeterminate} property is `true`.
			 * @type boolean
			 * @property selected
			 */
			/**
			 * `true`, if the CheckBox is selected; `false`, otherwise.
			 * @type module:jidejs/base/ObservableProperty
			 * @property selectedProperty
			 */
			/**
			 * The toggle group that manages this CheckBox.
			 *
			 * This property is optional and doesn't need to be specified.
			 *
			 * @type module:jidejs/ui/control/ToggleGroup
			 * @property toggleGroup
			 */
			/**
			 * The toggle group that manages this CheckBox.
			 *
			 * @type module:jidejs/base/ObservableProperty
			 * @property toggleGroupProperty
			 */
			/**
			 * `true`, if the CheckBox should be considered neither _selected_ nor _not selected_; `false`, otherwise.
			 *
			 * If this property is `true`, then the value of the {@link #selected} property should be ignored.
			 *
			 * @type boolean
			 */
			indeterminate: false,
			/**
			 * `true`, if the CheckBox should be considered neither _selected_ nor _not selected_; `false`, otherwise.
			 */
			indeterminateProperty: null,
			/**
			 * If `true`, then the CheckBox allows three states: _indeterminate_, _not selected_ and _selected_,
			 * otherwise the CheckBox will only allow two states: _not selected_ and _selected_.
			 *
			 * @type boolean
			 */
			allowIndeterminate: false,

			dispose: function() {
				ButtonBase.prototype.dispose.call(this);
				installer.dispose(this);
			}
		});
		var installer = Observable.install(exports, 'indeterminate');
    exports.Skin = Skin.create(ButtonBase.Skin, {
            template: Templates.CheckBox,
            handleAction: function() {
                var checkBox = this.component;
                if(checkBox.allowIndeterminate) {
                    // !s & i => !s & !i => s & !i
                    var isSelected = checkBox.selected;
                    var isIndeterminate = checkBox.indeterminate;
                    if(!isSelected) {
                        if(isIndeterminate) {
                            checkBox.indeterminate = false;
                        } else {
                            checkBox.selected = true;
                        }
                    } else {
                        checkBox.selected = false;
                        checkBox.indeterminate = true;
                    }
                } else {
                    checkBox.selected = !checkBox.selected;
                }
            }
		});

        register('jide-checkbox', exports, ButtonBase, ['indeterminate', 'allowIndeterminate'], []);

		return exports;
});