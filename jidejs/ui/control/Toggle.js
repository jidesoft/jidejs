/**
 * Toggle is a Mixin to support the creation of controls that can be selected and belong to a
 * {@link module:jidejs/ui/control/ToggleGroup}.
 * It will update the {@link module:jidejs/ui/control/ToggleGroup} when its `selected` property is set to `true`.
 * @module jidejs/ui/control/Toggle
 */
define(['./../../base/Class', './../../base/ObservableProperty'], function(Class, Observable) {
	/**
	 * Adds the properties `selected` and `toggleGroup` to the object.
	 * Must be invoked using the `call` syntax with the toggleable control as the context during the construction
	 * of the control.
	 *
	 * @example
	 * 	Toggle.call(myToggleButton);
	 * @memberof module:jidejs/ui/control/Toggle
	 * @constructor
	 * @alias module:jidejs/ui/control/Toggle
	 *
	 * @property {boolean} selected `true`, if the control is selected; `false`, otherwise.
	 * @property {module:jidejs/ui/control/ObservableProperty} selectedProperty `true`, if the control is selected;
	 * 		`false`, otherwise.
	 * @property {module:jidejs/ui/control/ToggleGroup} toggleGroup The ToggleGroup that the control belongs to.
	 * @property {module:jidejs/ui/control/ObservableProperty} toggleGroupProperty The ToggleGroup that the control belongs to.
	 */
	function Toggle() {
		this.selectedProperty.subscribe(function(event) {
			if(this.toggleGroup) {
				if(event.value) {
					this.toggleGroup.selectedToggle = this;
				}
			}
		});
		this.toggleGroupProperty.subscribe(function(event) {
			event.value.toggles.add(this);
		});
	}
	Toggle.installer = Observable.install(Toggle, 'selected', 'toggleGroup');
	return Toggle;
});