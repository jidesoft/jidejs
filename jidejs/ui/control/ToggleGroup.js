/**
 * A ToggleGroup is used to create a logical group between multiple, toggleable, controls such that only one of them can
 * be selected at a given time.
 *
 * @module jidejs/ui/control/ToggleGroup
 */
define(['./../../base/Class', './../../base/ObservableProperty', './../../base/ObservableList'], function(Class, Observable, ObservableList) {
	/**
	 * Creates a new ToggleGroup.
	 * @memberof module:jidejs/ui/control/ToggleGroup
	 * @constructor
	 * @alias module:jidejs/ui/control/ToggleGroup
	 */
	function ToggleGroup() {
		installer(this);
		this.selectedToggleProperty.subscribe(function(event) {
			var toggle = event.value;
			this.toggles.forEach(function(t) {
				if(t === toggle && !t.selected) {
					t.selected = true;
				} else if(t !== toggle && t.selected) {
					t.selected = false;
				}
			});
		});
		this.toggles = new ObservableList();
	}
	Class(ToggleGroup).mixin(Observable).def({
		/**
		 * The currently selected control.
		 * @type module:jidejs/ui/control/Toggle
		 */
		selectedToggle: null,
		/**
		 * The currently selected control.
		 * @type module:jidejs/base/ObservableProperty
		 */
		selectedToggleProperty: null,

		/**
		 * An ObservableList of toggleable controls that belong to this group.
		 * You do not need to add your controls to this list yourself since that is handled by all toggleable controls
		 * internally when you specify their ToggleGroup.
		 * @type module:jidejs/base/ObservableList
		 */
		toggles: null
	});
	var installer = Observable.install(ToggleGroup, 'selectedToggle');
	return ToggleGroup;
});