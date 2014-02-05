/**
 * A Cell is a reusable control used by tables, lists and trees to display their content.
 *
 * They can be editable and their content can change at any time to allow for optimized data update in such controls.
 *
 * @example A simple Cell that can display a persons name and a picture of that person.
 * var myPersonCell = new Cell({
 * 	updateItem: function(person) {
 * 		// release previous bindings
 * 		if(this._myBindings) this._myBindings.forEach(function(binding) { binding.dispose(); });
 * 		// create new bindings
 * 		this._myBindings = [
 * 			this.graphics.bind(person.pictureProperty),
 * 			this.text.bind(person.fullNameProperty)
 * 		];
 * 	}
 * });
 *
 * @module jidejs/ui/control/Cell
 * @extends module:jidejs/ui/control/Labeled
 */
define([
	'./../../base/Class', './../../base/Observable', './../../base/ObservableProperty', './../../base/Property', './../Skin',
	'./Labeled', './TextField'
], function(Class, Observable, ObservableProperty, Property, Skin, Labeled, TextField) {
	/**
	 * Creates a new instance of the default Cell editor which displays a TextField to allow the user
	 * to edit the data within the cell.
	 *
	 * @memberof module:jidejs/ui/control/Cell
	 * @param {object} config The configuration of the editor. No options are supported by the default editor.
	 * @constructor
	 * @class
	 */
	function Editor(config) {

	}
	Class(Editor).def({
		/**
		 * Installs an editor for the given cell.
		 *
		 * In most cases this means temporarily replacing the cell with another control. Care must be taken in this case
		 * that the editor control has all required CSS classes and properties that are needed by the cell managing
		 * control.
		 *
		 * It is expected to return the created editor component and should always create a new one so that the editor
		 * itself is reusable and can be used to edit multiple cells at the same time.
		 *
		 * Must also be able to handle the user interactions for commiting changes and update the data and the cell when
		 * a commit is performed. Editors that use TextFields as representation should commit their changes
		 * when the user presses the `enter` key.
		 *
		 * @param {module:jidejs/ui/control/Cell} cell The cell that the editor belongs to.
		 * @returns {module:jidejs/ui/Component} The editor component.
		 * @memberof module:jidejs/ui/control/Cell.Editor#
		 */
		install: function(cell) {
			var editor = new TextField();
			editor.element.className += cell.element.className;
			editor.text = cell.text;
			editor.on('action', function() {
				cell.commitEdit(editor.text);
			});
			editor.on('click', function(evt) {
				evt.stopPropagation();
			});
			cell.element.parentNode.replaceChild(editor.element, cell.element);
			return editor;
		},

		/**
		 * Removes the editing capability from the cell.
		 *
		 * Usually this means replacing the `editorControl` with the Cell again.
		 *
		 * @param {module:jidejs/ui/control/Cell} cell The previously modified cell.
		 * @param {module:jidejs/ui/Component} editorControl The editor component that was used to edit the cell.
		 * @memberof module:jidejs/ui/control/Cell.Editor#
		 */
		uninstall: function(cell, editorControl) {
			editorControl.element.parentNode.replaceChild(cell.element, editorControl.element);
			editorControl.dispose();
		}
	});

	/**
	 * Creates a new cell.
	 *
	 * @memberof module:jidejs/ui/control/Cell
	 * @param {object} config The configuration of the cell.
	 * @constructor
	 * @alias module:jidejs/ui/control/Cell
	 */
	function Cell(config) {
		installer(this);
		this.__bindings = null;
		config || (config = {});
		Labeled.call(this, config);

		this.classList.add('jide-cell');
	}
	Class(Cell).extends(Labeled).def({
		/**
		 * The item is the part of the data that should be displayed by the cell.
		 * Modifying this property will update the cells contents.
		 *
		 * @type {*}
		 */
		item: null,
		/**
		 * The item is the part of the data that should be displayed by the cell.
		 *
		 * @type module:jidejs/base/ObservableProperty
		 */
		itemProperty: null,
		/**
		 * `true`, if the cell is currently selected; `false`, otherwise.
		 * @type boolean
		 */
		selected: false,
		/**
		 * `true`, if the cell is currently selected; `false`, otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 */
		selectedProperty: null,
		/**
		 * `true`, if the cell is editable; `false`, otherwise.
		 * @type boolean
		 */
		editable: false,
		/**
		 * `true`, if the cell is currently being edited; `false`, otherwise.
		 * @readonly
		 * @type boolean
		 */
		editing: false,
		/**
		 * `true`, if the cell is currently being edited; `false`, otherwise.
		 */
		editingProperty: null,
		/**
		 * The editor that should be used by this Cell.
		 * @type module:jidejs/ui/control/Cell.Editor
		 */
		editor: new Editor(),
		/**
		 * The currently used editor control, as created by the editor.
		 * @protected
		 */
		_editorControl: null,

		/**
		 * The converter can be used to easily transform the item to a string and can be used as an alternative
		 * to overriding the {@link #updateItem} method when all you want is display a string.
		 * @param {*} item The item
		 * @returns {string}
		 */
		converter: function(item) {
			return item && item.toString() || '';
		},

		/**
		 * The converter can be used to easily transform the item to a string and can be used as an alternative
		 * to overriding the {@link #updateItem} method when all you want is display a string.
		 * @type module:jidejs/base/ObservableProperty
		 */
		converterProperty: null,

		/**
		 * This method is used whenever the {@link #item} of the Cell changes and should update the content
		 * of the cell accordingly.
		 * @param {*} item The new data item.
		 */
		updateItem: function(item) {
			if(this.__bindings) this.__bindings.forEach(function(binding) { binding.dispose(); });
			if(Observable.is(item)) {
				this.__bindings = [
					this.textProperty.bind(item.convert(this.converterProperty))
				];
			} else {
				item = this.converter(item);
				if(Observable.is(item)) {
					this.__bindings = [
						this.textProperty.bind(item)
					];
				} else {
					this.text = item;
					this.bindings = null;
				}
			}
		},

		/**
		 * Starts the editing of the cell.
		 */
		startEdit: function() {
			this._editorControl = this.editor.install(this);
			this.editing = true;
		},

		/**
		 * Cancels the editing of the cell without storing the changes.
		 */
		cancelEdit: function() {
			if(!this._editorControl) return;
			this.editor.uninstall(this, this._editorControl);
			this._editorControl = null;
			this.editing = false;
		},

		/**
		 * Updates the value of the cell and stops the editing.
		 * @param newValue
		 */
		commitEdit: function(newValue) {
			this.editor.uninstall(this, this._editorControl);
			this._editorControl = null;
			this.editing = false;
			this.item = newValue;
		},

		dispose: function() {
			Labeled.prototype.dispose.call(this);
			installer.dispose(this);
		}
	});
	var installer = ObservableProperty.install(Cell, 'item', 'selected', 'editing', 'converter');
	Cell.Skin = Skin.create(Labeled.Skin, {
		installBindings: function() {
			var cell = this.component;
			if(cell.item) {
				cell.updateItem(cell.item);
			}
			if(cell.selected) {
				cell.classList.add('jide-state-selected');
			}
			return Labeled.Skin.prototype.installBindings.call(this).concat(
				cell.converterProperty.subscribe(function(event) {
					cell.item && cell.updateItem(cell.item);
					event.stopPropagation();
				}),
				cell.itemProperty.subscribe(function(event) {
					cell.updateItem(event.value);
					event.stopPropagation();
				}),
				cell.selectedProperty.subscribe(function(event) {
					if(event.value) {
						cell.classList.add('jide-state-selected');
					} else {
						cell.classList.remove('jide-state-selected');
					}
					event.stopPropagation();
				})
			);
		}
	});
	/**
	 * The default editor that will be used by all cells if no other editor has been specified for them.
	 * @memberof module:jidejs/ui/control/Cell
	 * @type {module:jidejs/ui/control/Cell.Editor}
	 */
	Cell.DefaultEditor = Editor;
	return Cell;
});