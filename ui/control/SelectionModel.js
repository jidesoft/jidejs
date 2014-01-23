/**
 * The SelectionModel handles the selected items in a {@link module:jidejs/ui/control/ListView} or similar control.
 *
 * @module jidejs/ui/control/SelectionModel
 * @abstract
 * @see module:jidejs/ui/control/SingleSelectionModel
 * @see module:jidejs/ui/control/MultipleSelectionModel
 */
define(['./../../base/Class', './../../base/ObservableProperty', './../../base/EventEmitter'], function(Class, Observable, EventEmitter) {
	/**
	 * Creates a new SelectionModel.
	 *
	 * @memberof module:jidejs/ui/control/SelectionModel
	 * @param {module:jidejs/base/ObservableList} list The list of items that can be selected.
	 * @constructor
	 * @alias module:jidejs/ui/control/SelectionModel
	 */
	function SelectionModel(list) {
		installer(this);
		EventEmitter.call(this);
		this.list = list;
	}
	Class(SelectionModel).mixin(EventEmitter).def({
		dispose: function() {
			EventEmitter.prototype.dispose.call(this);
			installer.dispose(this);
			if(this._listChangedHandler) this._listChangedHandler.dispose();
		},

		/**
		 * The index of the selected item. In case of a {@link module:jidejs/ui/control/MultipleSelectionModel}, this
		 * property will contain the index of the last item that was added to the selection.
		 * @type number
		 */
		selectedIndex: -1,
		/**
		 * The index of the selected item. In case of a {@link module:jidejs/ui/control/MultipleSelectionModel}, this
		 * property will contain the index of the last item that was added to the selection.
		 * @type module:jidejs/base/ObservableProperty
		 */
		selectedIndexProperty: null,
		/**
		 * The selected item. In case of a {@link module:jidejs/ui/control/MultipleSelectionModel}, this
		 * property will contain the last item that was added to the selection.
		 * @type {*}
		 */
		selectedItem: null,
		/**
		 * The selected item. In case of a {@link module:jidejs/ui/control/MultipleSelectionModel}, this
		 * property will contain the last item that was added to the selection.
		 * @type module:jidejs/base/ObservableProperty
		 */
		selectedItemPropert: null,
		/**
		 * Deselects all previously selected items and selects the item at the given index.
		 * @param {number} index The index of the item that should be selected.
		 */
		clearAndSelect: function(index) {
			this.clearSelection();
			this.select(index);
		},
		/**
		 * Deselects all previously selected items.
		 * @function
		 * @abstract
		 */
		clearSelection: null,
		/**
		 * `true`, if there is no selected item; `false`, otherwise.
		 * @type boolean
		 * @abstract
		 */
		empty: null,
		/**
		 * Returns `true`, if the given index or item is selected; `false`, otherwise.
		 * @function
		 * @abstract
		 */
		isSelected: null,
		/**
		 * Selects the given index or item but does not deselect any previously selected items if the SelectionModel
		 * supports multiple selected items.
		 * @function
		 * @abstract
		 */
		select: null,
		/**
		 * Selects the first item, deselects all previously selected items.
		 */
		selectFirst: function() {
			this.clearAndSelect(0);
		},
		/**
		 * Selects the last item, deselects all previously selected items.
		 */
		selectLast: function() {
			this.clearAndSelect(this.list.length - 1);
		},
		/**
		 * Selects the item after the currently selected one, deselects all previously selected items.
		 *
		 * If the currently selected item already is the last item, it will select the first one instead.
		 */
		selectNext: function() {
			var nextIndex = this.selectedIndex+1;
			if(nextIndex < this.list.length) {
				this.clearAndSelect(nextIndex);
			} else {
				this.clearAndSelect(0);
			}
		},
		/**
		 * Selects the item before the currently selected one, deselects all previously selected items.
		 *
		 * If the currently selected item already is the first item, it will select the last one instead.
		 */
		selectPrevious: function() {
			var nextIndex = this.selectedIndex - 1;
			if(nextIndex < 0) {
				this.clearAndSelect(this.list.length - 1);
			} else {
				this.clearAndSelect(nextIndex);
			}
		}
	});
	var installer = Observable.install(SelectionModel, 'selectedIndex', 'selectedItem');
	return SelectionModel;
});