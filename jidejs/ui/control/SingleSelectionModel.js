/**
 * A specific implementation of a SelectionModel that allows only one item to be selected at a time.
 *
 * @module jidejs/ui/control/SingleSelectionModel
 */
define(['jidejs/base/Class', 'jidejs/ui/control/SelectionModel', 'jidejs/base/Util'], function(Class, SelectionModel, _) {
	/**
	 * Creates a new SingleSelectionModel.
	 * @memberof module:jidejs/ui/control/SingleSelectionModel
	 * @param {module:jidejs/base/ObservableList} list The list of items that can be selected.
	 * @constructor
	 * @alias module:jidejs/ui/control/SingleSelectionModel
	 */
	function SingleSelectionModel(list, requireSelectedItem) {
		SelectionModel.call(this, list);
		this.requireSelectedItem = requireSelectedItem || false;
		if(requireSelectedItem && list.length > 0) {
			this.select(0);
		}
		var THIS = this;
		this._listChangedHandler = list.on('change', function(event) {
			var changes = event.enumerator(),
				selectedIndex = THIS.selectedIndex;
			while(changes.moveNext()) {
				var change = changes.current;
				if(change.isInsert && change.index <= selectedIndex) {
					selectedIndex++;
				} else if(change.isDelete && change.index < selectedIndex) {
					selectedIndex--;
				}
			}
			if(THIS.selectedIndex !== selectedIndex) {
				// The below line is a temporary fix that is required because of how
				// the SelectionModel works with the ListView.
				THIS.selectedIndexProperty._value = selectedIndex;
			}
		});
	}
	Class(SingleSelectionModel).extends(SelectionModel).def({
		/**
		 * Deselects the given index or the currently selected item if no `index` is given.
		 * @param {number?} index The index of the item that should be deselected.
		 */
		clearSelection: function(index) {
			if(typeof index === 'undefined' || this.selectedIndex === index) {
				if(this.requireSelectedItem && this.list.length > 0) {
					var oldItem = this.selectedItem;
					this.select(Math.min(index || 0, this.list.length-1));
					// this is one those extremely rare cases where we want to notify listeners even though the old and new values
					// are the same
					this.selectedIndexProperty.notify({value: this.selectedIndex, oldValue: index, source: this.selectedIndexProperty._context});
					this.selectedItemProperty.notify({value: this.selectedItem, oldValue: oldItem, source: this.selectedItemProperty._context});
				} else {
					this.selectedIndex = null;
					this.selectedItem = null;
				}
			}
		},
		/**
		 * `true`, if no item is selected; `false`, otherwise.
		 * @type {boolean}
		 */
		get empty() {
			return this.selectedIndex == null;
		},
		/**
		 * Returns `true` if the given `index` is currently selected; `false`, otherwise.
		 * @param {number} index The index of the item that might be selected.
		 * @returns {boolean}
		 */
		isSelected: function(index) {
			return this.selectedIndex === index || this.selectedItem === index;
		},
		/**
		 * Selects the given index or item, deselects the previously selected item.
		 *
		 * If the parameter is a number, it will assume that you meant the index of the item.
		 *
		 * @param {number|*} indexOrObject The index or the item that should be selected.
		 */
		select: function(indexOrObject) {
			if(_.isNumber(indexOrObject)) {
				this.selectedItem = this.list.get(indexOrObject);
				this.selectedIndex = indexOrObject;
			} else {
				var index = this.list.indexOf(indexOrObject);
				if(index !== -1) {
					this.selectedItem = indexOrObject;
					this.selectedIndex = index;
				}
			}
		},
		/**
		 * Deselects the currently selected item and selects the given index or item.
		 * @param {number|*} index The index or the item that should be selected.
		 */
		clearAndSelect: function(index) {
			this.select(index);
		}
	});
	return SingleSelectionModel;
});