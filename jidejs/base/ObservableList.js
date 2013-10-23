/**
 * @module jidejs/base/ObservableList
 */
define('jidejs/base/ObservableList', [
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Observable', 'jidejs/base/Collection'
], function(Class, _, Observable, Collection) {
	/**
	 * Creates a new observable list.
	 *
	 * Can be used without the _new_ keyword to cast an array to an observable list or return the given value if it is already
	 * an observable list.
	 *
	 * @memberof module:jidejs/base/ObservableList
	 * @param {array|jidejs/base/ObservableList?} data The initial data of the observable list.
	 * @returns {jidejs/base/ObservableList} A new observable list or the _data_ parameter, if it already is an observable list.
	 * @constructor
	 * @extends module:jidejs/base/Collection
	 * @alias module:jidejs/base/ObservableList
	 */
	function ObservableList(data) {
		if(!(this instanceof ObservableList)) {
			if(data instanceof ObservableList) {
				return data;
			}
			return new ObservableList(data);
		}
		Collection.call(this);
		this._data = data || [];
	}

	Class(ObservableList).extends(Collection).def({
		/**
		 * Releases all resources held by this instance and frees them for garbage collection.
		 */
		dispose: function() {
			Collection.prototype.dispose.call(this);
			this._data = null;
		},

		/**
		 * Removes, and optionally adds, items at a given index.
		 * @param {Number} index The index of the change
		 * @param {Number} removeCount The number of removed items
		 * @param {...*} items The items that should be added at the given index.
		 */
		splice: function(index, removeCount, items) {
			var publisher = this.updates,
				insertCount = arguments.length - 2,
				i, len, oldItem, item, data = this._data;
			publisher.beginChange();
			// handle updates
			for(i = 0, len = Math.min(insertCount, removeCount); i < len; i++) {
				oldItem = data[index+i];
				item = arguments[2+i];
				publisher.update(index+i, oldItem, item);
			}
			// handle removes
			if(insertCount < removeCount) {
				for(i = insertCount, len = removeCount - insertCount; i < len; i++) {
					publisher.remove(index, data[index+i]);
				}
			} else if(removeCount < insertCount) {
				// handle inserts
				for(i = removeCount, len = insertCount - removeCount; i < len; i++) {
					publisher.insert(index+i, arguments[2+i]);
				}
			}
			// perform data modification
			data.splice.apply(data, arguments);

			publisher.commitChange();
		},

		push: function(item) {
			this.add.apply(this, arguments);
		},

		/**
		 * Adds a items to the end of the list.
		 * @param {...*} item The new items
		 * @fires ObservableList#change Notifies all listeners of the modification.
		 */
		add: function(item) {
			var idx = this._data.length;
			var publisher = this.updates;
			publisher.beginChange();
			publisher.insert(idx, item);
			this._data[idx] = item;
			if(arguments.length > 1) {
				for(var i = 1, len = arguments.length; i < len; i++) {
					item = arguments[i];
					publisher.insert(idx+i, item);
					this._data[idx+i] = item;
				}
			}
			publisher.commitChange();
		},

		/**
		 * Adds all items from the collection or array to the end of the list.
		 * @param {Array<*>} items The items
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		addAll: function(items) {
			var idx = this._data.length,
				publisher = this.updates;
			publisher.beginChange();
			for(var i = 0, len = items.length; i < len; i++) {
				var item = items[i];
				publisher.insert(idx+i, item);
				this._data[idx+i] = item;
			}
			publisher.commitChange();
		},

		/**
		 * Inserts the new items at the specified index.
		 * @param {number} index The index of the new items.
		 * @param {...*} child The new items.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		insertAt: function(index, child) {
			var publisher = this.updates;
			publisher.beginChange();
			if(arguments.length === 2) {
				publisher.insert(index, child);
				this._data.splice(index, 0, child);
			} else {
				var data = [index, 0];
				for(var i = 1, len = arguments.length; i < len; i++) {
					data[i+1] = arguments[i];
					publisher.insert(index+i-1, arguments[i]);
				}
				this._data.splice.apply(this._data, data);
			}
			publisher.commitChange();
		},

		/**
		 * Inserts the new item directly before the other item.
		 * @param {*} newChild The new item.
		 * @param {*} relChild The other item.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		insertBefore: function(newChild, relChild) {
			var index = this.indexOf(relChild);
			this.insertAt(index, newChild);
		},

		/**
		 * Inserts the new item directly after the other item.
		 * @param {*} newChild The new item.
		 * @param {*} relChild The other item.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		insertAfter: function(newChild, relChild) {
			var index = this.indexOf(relChild);
			this.insertAt(index+1, newChild);
		},

		/**
		 * Removes all items from the list.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		clear: function() {
			this.remove(0, this.length);
		},

		/**
		 * Removes _length_ items from the given _from_ index.
		 *
		 * An overload accepts a single item from the list that should be removed.
		 *
		 * @param {number|*} from The start index of the removal or the item that should be removed.
		 * @param {number} length The number of elements that should be removed.
		 * @returns {Array} Returns an array of the removed items.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		remove: function(from, length) {
			var publisher = this.updates;
			publisher.beginChange();
			if(typeof length !== 'undefined') {
				// remove(from, length)
				// this._data.slice(from, from+length);
				var removed = this._data.splice(from, length);
				for(var i = 0, len = removed.length; i < len; i++) {
					publisher.remove(from, removed[i]);
				}
				publisher.commitChange();
				return removed;
			}
			// remove(item)
			var item = from;
			var idx = this._data.indexOf(item);
			if(idx === -1) {
				return [];
			}
			this._data.splice(idx, 1);
			publisher.remove(idx, item);
			publisher.commitChange();
			return [item];
		},

		/**
		 * Removes the item at the given index and returns an array containing the item.
		 * @param {number} index The index of the item that should be removed.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		removeAt: function(index) {
			this.remove(index, 1);
		},

		/**
		 * Contains the number of items in the list.
		 * @returns {Number}
		 */
		get length() {
			return this._data.length;
		},

		/**
		 * Returns the item at the given index.
		 * @param {number} index The index whose value should be retrieved.
		 * @returns {*} The item at the given index.
		 */
		get: function(index) {
			return this._data[index];
		},

		/**
		 * Sets the item at the given index.
		 * @param {number} index The index at which the item should be stored.
		 * @param {*} data The value that should be stored at the given index.
		 * @fires ObservableList#change Notifies all listeners of the modification
		 */
		set: function(index, data) {
			var publisher = this.updates,
				old = this._data[index];
			publisher.beginChange();
			publisher.update(index, old, data);
			this._data[index] = data;
			publisher.commitChange();
		},

		/**
		 * Returns _true_, if the item is contained in the list; _false_ otherwise.
		 * @param {*} item The item that might be in the list.
		 * @returns {boolean}
		 */
		contains: function(item) {
			return this._data.indexOf(item) !== -1;
		},

		/**
		 * Returns the index of the item in the list or _-1_ if the item is not in the list.
		 * @param {*} item The item that might be in the list.
		 * @returns {number} The index of the item or _-1_ if the item is not in the list.
		 */
		indexOf: function(item) {
			return this._data.indexOf(item);
		},

		reduce: function(callback, initialValue, context) {
			var prop = Observable.computed(function() {
				return this.toArray().reduce(callback, initialValue, context);
			}, this);
			var handle = this.on('change', function() {
				prop.invalidate();
			});
			var dispose = prop.dispose;
			prop.dispose = function() {
				dispose.call(prop);
				handle.dispose();
			};
			return prop;
		},

		/**
		 * Returns a new array that contains all items of the list.
		 * @returns {Array} A copy of the data in the list as an array.
		 */
		toArray: function() {
			return this._data.concat();
		}
	});
	return ObservableList;
});