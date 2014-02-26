/**
 * An abstract base class for different kinds of ComboBoxes that optionally allows the user to input a custom value
 * instead of selecting a pre-defined value.
 *
 * Concrete implementations of this control could be date pickers, color pickers or similar.
 *
 * @module jidejs/ui/control/ComboBoxBase
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../../base/Util',
	'./../../base/DOM', './../../base/ObservableList', './../Control', './../Skin', './../Pos',
	'./SingleSelectionModel', './Popup', './ListView',
	'./TextField', './Button', './../register'
], function(
	Class, Observable, _, DOM, ObservableList, Control, Skin, Pos, SingleSelectionModel, Popup, ListView,
	TextField, Button, register
) {
	"use strict";

	/**
	 * The default base Skin for all comboboxes.
	 *
	 * @memberof module:jidejs/ui/control/ComboBoxBase
	 * @param choiceBox
	 * @param element
	 * @constructor
	 */
	function ComboBoxBaseSkin(choiceBox, element) {
		Skin.call(this, choiceBox);
		this.element = element || document.createElement('div');
		DOM.removeChildren(this.element);
		this.textField = new TextField({editable: false});
		this.button = new Button({
			text: '&#x25bc;'
		});
		this.element.appendChild(this.textField.element);
		this.element.appendChild(this.button.element);
		this.autoHideHandler = function(e) {
			if(!DOM.isInElement(this.element, { x:e.pageX, y:e.pageY})
				&& !DOM.isInElement(this.popup.element, {x: e.pageX, y: e.pageY})) {
				this.component.showing = false;
			}
		}.bind(this);
	}
	Class(ComboBoxBaseSkin).extends(Skin).def({
		install: function() {
			var comboBox = this.component;
			var popup = this.popup = new Popup({
				autoHide: false,
				consumeAutoHidingEvents: false
			});

			var element = this.element;
			var textField = this.textField;
			var button = this.button;

			var over = false, visibleState = false;
			this.bindings = [
				popup.visibleProperty.bind(comboBox.showingProperty),
				comboBox.showingProperty.subscribe(function(event) {
					if(event.value) {
						var box = DOM.getBoundingBox(element);
						var width = (box.right - box.left)+"px";
						if(popup.element.style.minWidth !== width) {
							popup.element.style.minWidth = width;
						}
						popup.setLocation(comboBox, Pos.BOTTOM);
					}
				}),
				comboBox.editableProperty.subscribe(function(event) {
					comboBox.classList[event.value ? 'add' : 'remove']('jide-state-editable');
					textField.editable = event.value;
				}),
				button.on({
					action: function() {
						if(comboBox.editable) {
							comboBox.showing = !comboBox.showing;
						}
					}
				}),
				comboBox.on({
					'click': function() {
						if(!comboBox.editable) {
							comboBox.showing = !comboBox.showing;
						}
					}
				}),
				textField.on('action', function() {
					if(comboBox.editable) {
						comboBox.value = comboBox.converter(textField.text);
					}
				}),
				comboBox.valueProperty.subscribe(function(event) {
					textField.text = comboBox.converter(event.value);
				})
			];
			if(comboBox.editable) {
				comboBox.classList.add('jide-state-editable');
				textField.editable = true;
			}
		},
		dispose: function() {
			this.bindings.forEach(function(binding) {
				if(binding) binding.dispose();
			});
			delete this.bindings;
		}
	});

	/**
	 * Initializes the new base combo box.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/ComboBoxBase
     * @abstract
     * @extends module:jidejs/ui/Control
     *
     * @param {object} config The configuration
     * @param {Array} config.items The default choices for the user.
	 */
	var exports = function ComboBoxBase(config) {
		installer(this);

		config = _.defaults(config || {}, { tabIndex: 0 });

		if(!config.items) this.items = new ObservableList();
		else if(Array.isArray(config.items)) this.items = new ObservableList(config.items);
		else this.items = config.items; // assume config.items is an ObservableList
		delete config.items;

		if(config.selectionModel) this.selectionModel = config.selectionModel;
		else this.selectionModel = new SingleSelectionModel(this.items);
		delete config.selectionModel;

		Control.call(this, config);
		this.classList.add('jide-comboboxbase');
	};
	Class(exports).extends(Control).def(/** @lends module:jidejs/ui/control/ComboBoxBase# */{
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The items that should be offered to the user when he opens the popup of the ComboBox.
		 *
		 * @type module:jidejs/base/ObservableList
		 * @readonly
		 */
		items: null,
		/**
		 * The SelectionModel used by the ComboBox.
		 *
		 * @type module:jidejs/ui/control/SelectionModel
		 * @readonly
		 */
		selectionModel: null,
		/**
		 * Converts the currently selected value into a `string` that can be displayed directly
		 * by the ChoiceBox.
		 *
		 * This method must support cases where there is no selection, i.e. the value passed to it is `null` or
		 * `undefined`.
		 *
		 * @param {*} o The currently selected value.
		 * @returns {string} A `string` representation of the value.
		 */
		converter: function(o) { return ""+(o || "None"); },
		/**
		 * Contains the converter used by the ChoiceBox.
		 *
		 * @see module:jidejs/ui/control/ComboBoxBase#converter
		 * @type module:jidejs/base/ObservableProperty
		 */
		converterProperty: null,
		/**
		 * `true`, if the popup is currently being shown; `false`, otherwise.
		 *
		 * @type boolean
		 * @readonly
		 */
		showing: false,
		/**
		 * `true`, if the popup is currently being shown; `false`, otherwise.
		 *
		 * @type module:jidejs/base/ObservableProperty
		 * @see module:jidejs/ui/control/ComboBoxBase#showing
		 */
		showingProperty: null,
		/**
		 * When `true`, the combo box is editable and allows the user to input arbitrary strings; otherwise it allows
		 * the user to only choose between the predefined options.
		 */
		editable: false,
		/**
		 * @see module:jidejs/ui/control/ComboBoxBase#editable
		 * @type module:jidejs/base/ObservableProperty
		 */
		editableProperty: null
	});
	var installer = Observable.install(exports, 'value', 'converter', 'showing', 'editable');
	/**
	 * The default Skin for all new combo boxes.
	 *
	 * @memberof module:jidejs/ui/control/ComboBoxBase
	 * @type {module:jidejs/ui/control/ComboBoxBase.Skin}
	 */
    exports.Skin = ComboBoxBaseSkin;
    register('jide-comboboxbase', exports, Control, ['items', 'value', 'converter', 'showing', 'editable'], []);
	return exports;
});