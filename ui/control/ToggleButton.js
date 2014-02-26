/**
 * A ToggleButton is used to toggle the state of an object. Good usages include states such as "Auto save enabled".
 *
 * @module jidejs/ui/control/ToggleButton
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './ButtonBase', './Toggle'
], function(Class, Observable, ButtonBase, Toggle) {
	/**
	 * Creates a new ToggleButton.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/ToggleButton
     * @extends module:jidejs/ui/control/ButtonBase
     * @extends module:jidejs/ui/control/Toggle
     *
     * @param {object} config The configuration.
	 */
	var exports = function ToggleButton(config) {
		Toggle.installer(this);
		ButtonBase.call(this, config);
		Toggle.call(this);
		this.selectedProperty.subscribe(function(event) {
			if(event.value) {
				this.classList.add('jide-state-selected');
			} else {
				this.classList.remove('jide-state-selected');
			}
		});
		if(this.selected) this.classList.add('jide-state-selected');
		this.on('action', function() {
			this.selected = !this.selected;
		});
		this.classList.add('jide-togglebutton');
	};

	Class(exports).extends(ButtonBase).mixin(Toggle).def(/** @lends module:jidejs/ui/control/ToggleButton# */{
		/**
		 * `true`, if the ToggleButton is currently selected; `false`, otherwise.
		 * @type boolean
		 * @property selected
		 */
		/**
		 * `true`, if the ToggleButton is currently selected; `false`, otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 * @property selectedProperty
		 */
		/**
		 * (Optional) The ToggleGroup that this control belongs to.
		 * @type module:jidejs/ui/control/ToggleGroup
		 * @property toggleGroup
		 */
		/**
		 * (Optional) The ToggleGroup that this control belongs to.
		 * @type module:jidejs/base/ObservableProperty
		 * @property toggleGroupProperty
		 */
	});

    exports.Skin = ButtonBase.Skin;

	return exports;
});