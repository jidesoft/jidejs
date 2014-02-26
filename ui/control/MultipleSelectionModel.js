/**
 * A {@link module:jidejs/ui/control/SelectionModel} that can contain more than just one selected element.
 *
 * @module jidejs/ui/control/MultipleSelectionModel
 */
define([
	'./../../base/Class', './../../base/ObservableList', './SelectionModel', './../../base/Util'
], function(Class, ObservableList, SelectionModel, _) {

	/**
	 * Creates a new MultipleSelectionModel. The provided List must be the same as is used by the control which relies
	 * on this selection model.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/MultipleSelectionModel
     * @extends module:jidejs/ui/control/SelectionModel
     *
     * @param {module:jidejs/base/Collection} list The List of items that can be selected.
	 */
	var exports = function MultipleSelectionModel(list) {
		this.__selectedIndices = new ObservableList();
		this.__selectedItems = new ObservableList();
		SelectionModel.call(this, list);
		var THIS = this;
		this._listChangedHandler = list.on('change', function(event) {
			var changes = event.enumerator(),
				selectedIndex = THIS.selectedIndex,
				// we really shouldn't have to use _data but ListView needs
				// to be improved first.
				selectedIndices = THIS.__selectedIndices._data;
			while(changes.moveNext()) {
				var change = changes.current;
				if(change.isInsert && change.index <= selectedIndex) {
					selectedIndex++;
					for(var i = 0, len = selectedIndices.length; i < len; i++) {
						if(change.index <= selectedIndices[i]) {
							selectedIndices[i]++;
						}
					}
				} else if(change.isDelete && change.index < selectedIndex) {
					selectedIndex--;
					for(var i = 0, len = selectedIndices.length; i < len; i++) {
						if(change.index < selectedIndices[i]) {
							selectedIndices[i]--;
						}
					}
				}
			}
			if(THIS.selectedIndex !== selectedIndex) {
				// The below line is a temporary fix that is required because of how
				// the SelectionModel works with the ListView.
				THIS.selectedIndexProperty._value = selectedIndex;
			}
		});
	};
	Class(exports).extends(SelectionModel).def(
        /** @lends module:jidejs/ui/control/MultipleSelectionModel */ {
		/**
		 * An ObservableList of the indices of the selected items.
		 * @type module:jidejs/base/ObservableList
		 */
		get selectedIndices() {
			return this.__selectedIndices;
		},

		/**
		 * An ObservableList of the selected items.
		 * @type module:jidejs/base/ObservableList
		 */
		get selectedItems() {
			return this.__selectedItems;
		},

		/**
		 * Deselects either the item at the given `index` or everything, if no `index` is given.
		 * @param {number?} index The index of the selected item that should be deselected.
		 */
		clearSelection: function(index) {
			var indices = this.__selectedIndices;
			var items = this.__selectedItems;
			if(typeof index === 'undefined') {
				indices.clear();
				items.clear();
				this.selectedItem = null;
				this.selectedIndex = null;
			} else if(indices.contains(index)) {
				indices.remove(index);
				items.remove(this.list.get(index));
				if(indices.length) {
					index = this.selectedIndices.get(indices.length-1);
					this.selectedItem = this.list.get(index);
					this.selectedIndex = index;
				} else {
					this.selectedItem = null;
					this.selectedIndex = null;
				}
			}
		},

		/**
		 * `true`, if there is no selected item; `false`, if there is at least one selected item.
		 *
		 * @type boolean
		 * @readonly
		 */
		get empty() {
			return this.__selectedIndices.length === 0;
		},

		/**
		 * Returns `true`, if the item at the given `index` is selected; `false`, otherwise.
		 * @param {number} index The index of the possibly selected item.
		 * @returns {boolean}
		 */
		isSelected: function(index) {
			return this.__selectedIndices.contains(index);
		},

		/**
		 * Adds the given item or the item at the given index to the selection.
		 *
		 * If the `indexOrObject` parameter is a number, it assumes that the index of the item is meant.
		 *
		 * @param {number|*} indexOrObject The index or item that should be selected.
		 */
		select: function(indexOrObject) {
			if(_.isNumber(indexOrObject)) {
				var item = this.list.get(indexOrObject);
				this.__selectedItems.add(item);
				this.__selectedIndices.add(indexOrObject);
				this.selectedItem = item;
				this.selectedIndex = indexOrObject;
			} else {
				var index = this.list.indexOf(indexOrObject);
				if(index !== -1) {
					this.__selectedItems.add(indexOrObject);
					this.__selectedIndices.add(index);
					this.selectedItem = indexOrObject;
					this.selectedIndex = index;
				}
			}
		},

		/**
		 * Selects all items.
		 */
		selectAll: function() {
			this.clearSelection();
			var indices = this.__selectedIndices;
			var items = this.__selectedItems;
			var range = [];
			for(var i = 0, len = this.list.length; i < len; i++) {
				range[i] = i;
			}
			items.addAll(this.list.toArray());
			indices.addAll(range);
			this.selectedItem = items.get(items.length-1);
			this.selectedIndex = items.length-1;
		}
	});
	return exports;
});