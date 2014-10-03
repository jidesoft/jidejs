/**
 * A ComboBox can be used to offer choices to users. As opposed to a {@link module:jidejs/ui/control/ChoiceBox} it
 * can be editable, allowing the user to input custom text instead of selecting one of the choices.
 *
 * It is a concrete implementation of {@link module:jidejs/ui/control/ComboBoxBase} which shows its items as a
 * {@link module:jidejs/ui/control/ListView}.
 *
 * @module jidejs/ui/control/ComboBox
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../../base/Util',
	'./../../base/DOM', './../../base/ObservableList', './../Control', './../Pos',
	'./SingleSelectionModel', './Popup', './ListView',
	'./ComboBoxBase', './Cell', './../register'
], function(
	Class, Observable, _, DOM, ObservableList, Control, Pos, SingleSelectionModel, Popup, ListView, ComboBoxBase, Cell, register
) {
	"use strict";
	var ComboBoxBaseSkin = ComboBoxBase.Skin;

	/**
	 * Creates a new Skin.
	 *
	 * @memberof module:jidejs/ui/control/ComboBox
	 * @param choiceBox
	 * @param element
	 * @constructor
	 * @extends module:jidejs/ui/control/ComboBoxBase.Skin
	 */
	function ComboBoxSkin(choiceBox, element) {
		ComboBoxBaseSkin.call(this, choiceBox, element);
	}
	Class(ComboBoxSkin).extends(ComboBoxBaseSkin).def({
		install: function() {
			ComboBoxBaseSkin.prototype.install.call(this);
			var comboBox = this.component;
			var listView = this.listView = new ListView({
				selectionModel: comboBox.selectionModel,
				items: comboBox.items,
				cellFactory: comboBox.cellFactory,
				converter: comboBox.converter
			});
			this.popup.content = listView;
			this.popup.classList.add('jide-combobox-popup');

			var element = this.element;
			var textField = this.textField;
			var button = this.button;

			var over = false, visibleState = false;
			this.managed(
				listView.cellFactoryProperty.bind(comboBox.cellFactoryProperty),
				listView.converterProperty.bind(comboBox.converterProperty),
				listView.selectionModel.selectedItemProperty.subscribe(function(event) {
					comboBox.value = event.value;
					comboBox.showing = false;
				})
			);
			textField.text = comboBox.converter(listView.selectionModel.selectedItem);
		},
		dispose: function() {
			ComboBoxBaseSkin.prototype.dispose.call(this);
			this.popup.dispose();
			this.listView.dispose();
			delete this.popup;
			delete this.listView;
		}
	});

	/**
	 * Creates a new ComboBox.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/ComboBox
     * @extends module:jidejs/ui/control/ComboBoxBase
     * @param {object} config The configuration
	 */
	var exports = function ComboBox(config) {
		installer(this);
		config = _.defaults(config || {}, { tabIndex: 0 });

		ComboBoxBase.call(this, config);
		this.classList.add('jide-combobox');
	};
	Class(exports).extends(ComboBoxBase).def(/** @lends module:jidejs/ui/control/ComboBox# */{
		dispose: function() {
			ComboBoxBase.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * Creates a new Cell that is displayed in the popup of the ComboBox.
		 *
		 * If you would like to change the display of the popup, you should override this method and configure
		 * a custom Cell.
		 *
		 * @returns {module:jidejs/ui/control/Cell}
		 */
		cellFactory: function() {
			var cell = new Cell();
			cell.converterProperty.bind(this.converterProperty);
			return cell;
		},
		/**
		 * The factory that creates a new Cell for the ListView.
		 * @type module:jidejs/base/ObservableProperty
		 * @see module:jidejs/ui/control/ComboBox#cellFactory
		 */
		cellFactoryProperty: null,
		/**
		 * The converter can be used to easily transform the item to a string and can be used as an alternative
		 * to overriding the {@link module:jidejs/ui/control/ComboBox#cellFactory} method when all you want is display a string.
		 *
		 * **Note**: The converter might be invoked without or with a different context. Do not use the `this` context
		 * within the function.
		 *
		 * @param {*} item The item
		 * @returns {string}
		 */
		converter: function(item) {
			return item && item.toString() || '';
		},
		/**
		 * The converter can be used to easily transform the item to a string and can be used as an alternative
		 * to overriding the {@link module:jidejs/ui/control/ComboBox#cellFactory} method when all you want is display a string.
		 * @type module:jidejs/base/ObservableProperty
		 */
		converterProperty: null
	});
	var installer = Observable.install(exports, 'cellFactory');
    exports.Skin = ComboBoxSkin;
    register('jide-combobox', exports, ComboBoxBase, ['cellFactory'], []);
	return exports;
});