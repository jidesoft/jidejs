/**
 * The collection is the base class for the ObservableList and allows for custom implementations of it.
 *
 * @module jidejs/base/Collection
 */
define('jidejs/base/Collection', [
	'jidejs/base/Class',
	'jidejs/base/EventEmitter',
	'jidejs/base/Property',
	'jidejs/base/ObservableProperty',
	'jidejs/base/Observable',
	'jidejs/base/Util',
	'jidejs/base/Enumerator'
], function(Class, EventEmitter, Property, ObservableProperty, Observable, _, Enumerator) {
	"use strict";
	//region ChangeEvent
	/**
	 * This event is fired whenever the list changes and contains all modifications.
	 *
	 * The indices are structured such that following them verbartim leads to an exact duplicate of the
	 * original collection.
	 *
	 * Thus, if two consecutive items are removed from a collection, the index for both removal events would
	 * be the same, since, once the first item is removed, the next one is moved back and takes the same
	 * index.
	 *
	 * @memberof module:jidejs/base/Collection
	 * @param {module:jidejs/base/Collection} source The source of the event.
	 * @param {Array<*>} changes The event changes.
	 * @property {module:jidejs/base/Collection} source The source of the event.
	 * @property {Array<Change>} changes The changes that were made to the source.
	 * @method enumerator Returns an enumerator over all changes.
	 * @alias module:jidejs/base/Collection.ChangeEvent
	 * @constructor
	 * @event Collection#change
	 */
	function ChangeEvent(source, changes) {
		this.source = source;
		this.changes = changes;
		this.length = changes.length;
	}
	Class(ChangeEvent).def({
		/**
		 * Returns an enumerator for all changes covered by this event.
		 * @memberof module:jidejs/base/Collection.ChangeEvent#
		 * @returns {Enumerator}
		 */
		enumerator: function() {
			return new Enumerator.Array(this.changes);
		}
	});

	/**
	 * Contains information about a single change in a collection.
	 *
	 * @alias module:jidejs/base/Collection.Change
	 * @memberof module:jidejs/base/Collection
	 * @param {Number} index The index of the change.
	 * @param {*} oldValue The removed value.
	 * @param {*} newValue The inserted value.
	 * @property {Number} index The index of the change.
	 * @property {*|undefined} oldValue The removed value or `undefined`, if no value was removed.
	 * @property {*|undefined} newValue The inserted value or `undefined`, if no value was inserted.
	 * @constructor
	 */
	function Change(index, oldValue, newValue) {
		this.index = index;
		this.oldValue = oldValue;
		this.newValue = newValue;
	}
	Class(Change).def({
		/**
		 * `true`, if this event represents a deletion; `false`, otherwise.
		 *
		 * Deletion events only have an {@link #oldValue} property.
		 *
		 * @type {boolean}
		 * @memberof module:jidejs/base/Collection.Change#
		 */
		get isDelete() {
			return this.oldValue !== undefined && this.newValue === undefined;
		},

		/**
		 * `true`, if this event represents an update; `false`, otherwise.
		 *
		 * Update events have both, {@link #oldValue} and {@link #newValue} properties.
		 *
		 * @type {boolean}
		 * @memberof module:jidejs/base/Collection.Change#
		 */
		get isUpdate() {
			return this.oldValue !== undefined && this.newValue !== undefined;
		},

		/**
		 * `true`, if this event represents an insertion; `false`, otherwise.
		 *
		 * Insertion events only have a {@link #newValue} property.
		 *
		 * @type {boolean}
		 * @memberof module:jidejs/base/Collection.Change#
		 */
		get isInsert() {
			return this.newValue !== undefined && this.oldValue === undefined;
		}
	});

	function changeComparator(a, b) {
		return a.index - b.index;
	}

	/**
	 * The ChangeEventAssembler is responsible for creating a {@link module:jidejs/base/Collection.ChangeEvent}.
	 *
	 * @memberof module:jidejs/base/Collection
	 * @alias module:jidejs/base/Collection.ChangeEventAssembler
	 * @param {module:jidejs/base/Collection} source The source for the assembled events.
	 * @constructor
	 */
	function ChangeEventAssembler(source) {
		this.source = source;
		this.changes = null;
		this.level = 0;
		this.useCapture = false;
		this.needsChangeSorting = false;
	}
	Class(ChangeEventAssembler).def({
		/**
		 * Adds a new insert event.
		 * @param {Number} index The index at which the item was inserted.
		 * @param {*} value The inserted value.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		insert: function(index, value) {
			this.update(index, undefined, value);
		},

		/**
		 * Adds a new delete event.
		 * @param {Number} index The index from which the item was removed.
		 * @param {*} value The removed value.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		remove: function(index, value) {
			this.update(index, value, undefined);
		},

		/**
		 * Adds a new update event.
		 * @param {Number} index The index at which the value was changed.
		 * @param {*} oldValue The previous value.
		 * @param {*} newValue The new value.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		update: function(index, oldValue, newValue) {
			var previousChange = this.changes[this.changes.length-1];
			if(previousChange && index < previousChange.index) {
				this.needsChangeSorting = true;
			}
			this.changes.push(new Change(index, oldValue, newValue));
		},

		/**
		 * Prepares the assembling process, must be called before any other method.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		beginChange: function(useCapture) {
			if(!this.useCapture) {
				this.changes = [];
				this.useCapture = useCapture;
			} else if(useCapture) {
				this.level++;
			}
		},

		/**
		 * Dispatches the created `change` event.
		 * It will reorder all previously created events by their index and tries to compress them when possible.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		commitChange: function() {
			if(this.useCapture && this.level > 0) {
				this.level--;
				return;
			}
			if(this.changes.length > 0) {
				var changes = this.changes;
				/* // TODO the standard sorting is not smart enough, figure out a way to optimize events anyway
				if(this.needsChangeSorting) changes.sort(changeComparator);
				var result = [];
				for(var i = 0, len = changes.length; i < len; i++) {
					var change = changes[i], last = result[result.length-1];
					if(!change.isUpdate && last
						&& last.index === change.index
						&& (change.isInsert && last.isDelete || change.isDelete && last.isInsert)) {
					//if(!change.isUpdate && (last = result[result.length-1]) && !last.isUpdate && last.index === change.index) {
						if(last.isDelete) {
							last.newValue = change.newValue;
						} else {
							last.oldValue = change.oldValue;
						}
					} else if(last && change.index === last.index) {
						if(last.isUpdate && change.isInsert && last.oldValue === change.newValue) {
							last.oldValue = undefined;
						} else {
							result[result.length] = change;
						}
					} else {
						result[result.length] = change;
					}
				}
				this.needsChangeSorting = false;
				var event = new ChangeEvent(this.source, result);*/
				var event = new ChangeEvent(this.source, changes);
				this.source.emit('change', event);
			}
			this.changes = null;
		},

		/**
		 * Cancels the event assembling.
		 * @returns {*|Array} The changes that were generated so far.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		cancelChange: function() {
			// todo update to revert only the changes done at this level
			var changes = this.changes;
			this.level = 0;
			this.needsChangeSorting = false;
			this.useCapture = false;
			this.changes = null;
			return changes;
		},

		/**
		 * Pipes an event from another collection through this EventAssembler.
		 * @param {jidejs/base/ChangeEvent} event The event.
		 * @memberof module:jidejs/base/Collection.ChangeEventAssembler#
		 */
		pipe: function(event) {
			this.source.emit('change', new ChangeEvent(this.source, event.changes));
		}
	});
	//endregion

	//region Enumerators
	function ListEnumerator(list) {
		this.list = list;
		this.index = -1;
	}
	Class(ListEnumerator).def({
		get current() {
			return this.list.get(this.index);
		},

		moveNext: function() {
			this.index++;
			return this.index < this.list.length;
		}
	});
	//endregion

	//region Collection implementation
	function pluckTransform(propertyName, person) {
		return person[propertyName];
	}

	/**
	 * Creates a new Collection. The abstract methods should be provided trough the config object unless
	 * an explicit sub class is defined as invokes this as the parents constructor.
	 *
	 * @memberof module:jidejs/base/Collection
	 * @param {object?} config The configuration.
	 * @constructor
	 * @alias module:jidejs/base/Collection
	 */
	function Collection(config) {
		EventEmitter.call(this);
		if(config) _.extends(this, config);
		if(!this.updates) this.updates = new ChangeEventAssembler(this);
	}
	Class(Collection).mixin(EventEmitter).def({
		/**
		 * Returns the item at the given `index`.
		 *
		 * Subclasses must implement this method to provide a mapping from the given index to the actual item.
		 *
		 * @function
		 * @param {Number} index The index of the item that should be retrieved
		 * @abstract
		 */
		get: null,

		/**
		 * The number of items stored in this collection.
		 *
		 * Subclasses must override or set this property.
		 *
		 * @type {Number}
		 * @abstract
		 */
		length: 0,

		enumerator: function() {
			return new ListEnumerator(this);
		},

		/**
		 * Iterates over all items in this collection.
		 * @param {Function} callback The callback to be invoked on all items. Receives the parameters:
		 * 						The item, its index and the collection
		 * @param {object?} context The context in which the function should be evaluated.
		 */
		forEach: function(callback, context) {
			for(var i = 0, len = this.length; i < len; i++) {
				callback.call(context, this.get(i), i, this);
			}
		},

		/**
		 * Releases all resources held by this instance and frees them for garbage collection.
		 */
		dispose: function() {
			EventEmitter.prototype.dispose.call(this);
		},

		/**
		 * Returns `true`, if the item is part of the collection; `false`, otherwise.
		 *
		 * **Note**: This implementation is highly inefficient as it needs to iterate over every item in the collection.
		 * Subclasses should override it.
		 *
		 * @param {*} item The item
		 * @returns {boolean}
		 */
		contains: function(item) {
			var e = this.enumerator();
			while(e.moveNext()) {
				if(item === e.current) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Returns the first index of the given item within the collection.
		 *
		 * **Note**: This implementation is highly inefficient as it needs to iterate over every item in the collection.
		 * Subclasses should override it.
		 *
		 * @param {*} item The item
		 * @returns {number}
		 */
		indexOf: function(item) {
			var e = this.enumerator();
			while(e.moveNext()) {
				if(item === e.current) {
					return e.index;
				}
			}
			return -1;
		},

		/**
		 * Iterates over all items in the list and returns the index of the first that matches the predicate.
		 *
		 * @example
		 * var indexOfPaul = peopleList.findIndex(function(person) { return person.name === 'Paul'; });
		 *
		 * @param {function} predicate A function that receives an item from the list and returns _true_ if that item matches its criteria.
		 * @returns {number} The index of the item.
		 */
		findIndex: function(predicate) {
			for(var i = 0, len = this.length; i < len; i++) {
				if(predicate(this.get(i))) {
					return i;
				}
			}
			return -1;
		},

		/**
		 * Finds the first item that matches the predicate and returns it.
		 * @param {function} predicate A function that receives an item from the list and returns _true_ if that item matches its criteria.
		 * @returns {*} The item that matches the predicate.
		 */
		findFirst: function(predicate) {
			for(var i = 0, len = this.length; i < len; i++) {
				var item = this.get(i);
				if(predicate(item)) {
					return item;
				}
			}
			return null;
		},

		/**
		 * Returns the contents of this collection as an array.
		 * @returns {Array} A copy of this collection as an array.
		 */
		toArray: function() {
			var array = [];
			for(var i = 0, len = this.length; i < len; i++) {
				array[array.length] = this.get(i);
			}
			return array;
		},

		/**
		 * Returns a collection which contains the items between the given `startIndex` and `endIndex`.
		 * @param startIndex
		 * @param endIndex
		 * @returns {SubCollection}
		 */
		subCollection: function(startIndex, endIndex) {
			return new SubCollection(this, startIndex, endIndex);
		},

		reduce: function(callback, initialValue, context) {
			var result = initialValue;
			for(var i = 0, len = this.length; i < len; i++) {
				result = callback.call(context, result, this.get(i));
			}
			return result;
		},

		/**
		 * Returns a new collection which contains the given property from the items in the original collection.
		 * @param {string} propertyName The name of the property that should be plucked from the collections items.
		 * @returns {module:jidejs/base/Collection}
		 */
		pluck: function(propertyName) {
			return this.map(pluckTransform.bind(null, propertyName), null);
		},

		/**
		 * Returns a new collection which contains the transformed items from this collection.
		 * The `transform` can receive three parameters:
		 *
		 * - The item from this collection.
		 * - The index of the item as a Number.
		 * - This collection.
		 *
		 * @param {function|module:jidejs/base/Property} transform The transform that translates between this list and the transformed list.
		 * @param {object?} context The context in which the `transform` should be evaluated.
		 * @returns {TransformedCollection}
		 */
		map: function(transform, context) {
			return new TransformedCollection(this, transform, context);
		},

		/**
		 * Returns a new collection that contains only those items from this list for which the `matcher` function
		 * returns `true`.
		 *
		 * The `matcher` can receive three parameters:
		 *
		 * - The item from this collection.
		 * - The index of the item as a Number.
		 * - This collection.
		 *
		 * @param {function|module:jidejs/base/Property} matcher The matcher function.
		 * @param {object?} context The context in which the `matcher` should be evaluated.
		 * @returns {FilteredCollection}
		 */
		filter: function(matcher, context) {
			return new FilteredCollection(this, matcher, context);
		},

		/**
		 * Returns a new collection that contains all items from this collection in the sort order that is specified
		 * by the `comparator`.
		 *
		 * The sort mode parameter can be used when moving the items should be limited, i.e. an update should not
		 * change the position of the item in the collection. This can be useful for visual controls such as a
		 * ListView or TableView.
		 *
		 * The `comparator` must accept two parameters (items from the collection) and should return one of the following values:
		 * - `-1`, if the first parameter is smaller than the second
		 * - `0`, if both parameters are equivalent with respect to the sort order
		 * - `1`, if the second parameter is bigger than the first.
		 *
		 * @param {function|module:jidejs/base/Property} comparator The comparator used to compare two items.
		 * @param {object?} context The context in which the `comparator` should be evaluated.
		 * @param {module:jidejs/base/Collection.SortMode} sortMode The sort mode
		 * @returns {SortedCollection}
		 */
		sort: function(comparator, context, sortMode) {
			return new SortedCollection(this, comparator, sortMode, context);
		},

		/**
		 * Returns a new collection which contains exactly the same data as the original collection but devides the
		 * data into smaller *chunks* and grows continually until it successfully replicated the full size of
		 * the original collection.
		 *
		 * Streaming a collection is must useful when working with a huge amount of data that you want to filter or
		 * display to the user.
		 *
		 * @param {Nuber?} chunkSize The size of each chunk of data.
		 * @param {Number?} delay The delay between each update in milliseconds.
		 * @returns {StreamCollection}
		 */
		asStream: function(chunkSize, delay) {
			return new StreamCollection(this, chunkSize, delay);
		},

		/**
		 * Returns a new collection which contains the unique group keys as delivered by the given `keySelector`.
		 * The items that belong to these keys can be retrieved using the `getByKey(key:string)` method.
		 *
		 * The `keySelector` can receive three parameters:
		 *
		 * - The item from this collection.
		 * - The index of the item as a Number.
		 * - This collection.
		 *
		 * and must return a `String` that describes the group that the item belongs to.
		 *
		 * @param {function|module:jidejs/base/Property} keySelector The key selector.
		 * @param context
		 * @returns {GroupCollection}
		 */
		groupBy: function(keySelector, context) {
			return new GroupCollection(this, _.isString(keySelector)
				? pluckTransform.bind(null, keySelector)
				: keySelector, context);
		}
	});
	Collection.ChangeEvent = ChangeEvent;
	/**
	 * Returns a new, immutable, collection which contains all items from the given array.
	 *
	 * @memberof module:jidejs/base/Collection
	 * @alias module:jidejs/base/Collection.fromArray
	 * @param {Array<*>} array An array of items.
	 * @returns {ArrayCollection}
	 */
	Collection.fromArray = function(array) {
		return new ArrayCollection(array);
	};
	function ArrayCollection(data) {
		Collection.call(this);
		this._data = data;
	}
	Class(ArrayCollection).extends(Collection).def({
		get: function(index) {
			return this._data[index];
		},

		get length() {
			return this._data.length;
		},

		set length(value) {
			throw new Error("IllegalAccess: Can't update length of a collection. Tried to set it to "+value);
		},

		toArray: function() {
			return this._data.slice();
		},

		dispose: function() {
			this._data = null;
			Collection.prototype.dispose.call(this);
		}
	});
	//endregion

	//region SubCollection
	function updateSubCollection(event) {
		var e = event.enumerator(),
			updates = this.updates;
		updates.beginChange();
		while(e.moveNext()) {
			var change = e.current,
				changeIndex = change.index;
			if(changeIndex < this.startIndex || (change.isInsert && changeIndex === this.startIndex)) {
				if(change.isInsert) {
					this.startIndex++;
					this.endIndex++;
				} else if(change.isDelete) {
					this.startIndex--;
					this.endIndex--;
				}
			} else if(changeIndex < this.endIndex) {
				if(change.isInsert) {
					this.endIndex++;
					updates.insert(changeIndex - this.startIndex, change.newValue);
				} else if(change.isUpdate) {
					updates.update(changeIndex - this.startIndex, change.oldValue, change.newValue);
				} else if(change.isDelete) {
					this.endIndex--;
					updates.remove(changeIndex - this.startIndex, change.oldValue);
				}
			}
		}
		if(this.startIndex > this.endIndex) {
			throw new Error('Illegal State: End of sublist is before its start!');
		}
		this.length = this.endIndex - this.startIndex;
		updates.commitChange();
	}

	function SubCollection(source, startIndex, endIndex) {
		Collection.call(this);
		this.source = source;
		this.startIndex = startIndex;
		this.endIndex = endIndex;
		this.length = endIndex - startIndex;
		this._binding = this.source.on('change', updateSubCollection.bind(this));
	}
	Class(SubCollection).extends(Collection).def({
		get: function(index) {
			index += this.startIndex;
			if(index >= this.endIndex) {
				throw new Error('IllegalAcess: Trying to get item at index '+
					(index-this.startIndex)+' from collection of length '+this.length);
			}
			return this.source.get(index);
		},

		dispose: function() {
			this._binding.dispose();
			this._binding = null;
			Collection.prototype.dispose.call(this);
		}
	});
	//endregion

	//region TransformCollection
	function handleTransformChange(evt) {
		var data = this._data,
			updates = this.updates,
			e = evt.enumerator();
		updates.beginChange();
		while(e.moveNext()) {
			var change = e.current;
			if(change.isUpdate) {
				var oldValue = data[change.index];
				data[change.index] = this.transform.call(this.context, change.newValue, change.index, this.source);
				updates.update(change.index, oldValue, data[change.index]);
			} else if(change.isInsert) {
				var newValue = this.transform.call(this.context, change.newValue, change.index, this.source);
				data.splice(change.index, 0, newValue);
				updates.insert(change.index, undefined, newValue);
			} else if(change.isDelete) {
				updates.remove(change.index, data.splice(change.index, 1), undefined);
			}
		}
		updates.commitChange();
	}

	function mapCallback(item, index) {
		return this.transform.call(this.context, item, index, this.source);
	}

	function updateTransform() {
		this._data = this.source.toArray().map(mapCallback, this);
	}

	function TransformedCollection(source, transform, context) {
		Collection.call(this);
		transformedCollectionInstaller(this);
		this.source = source;
		this.context = context;
		if(Observable.is(transform)) {
			this.transformProperty.bind(transform);
		} else {
			this.transform = transform;
		}
		this._bindings = [
			source.on('change', handleTransformChange.bind(this)),
			this.transformProperty.subscribe(updateTransform, this)
		];
		updateTransform.call(this);
	}
	Class(TransformedCollection).extends(Collection).def({
		_bindings: null,
		_data: null,

		dispose: function() {
			this._bindings.forEach(function(binding) { binding.dispose() });
			this._bindings = null;
			this._data = null;
			Collection.prototype.dispose.call(this);
		},

		get: function(index) {
			return this._data[index];
		},

		get length() {
			return this._data.length;
		},

		toArray: function() {
			return this._data.slice();
		}
	});
	var transformedCollectionInstaller = ObservableProperty.install(TransformedCollection, 'transform');
	//endregion

	//region FilteredCollection
	function updateFilter() {
		var old = this._data,
			publisher = this.updates,
			matcher = this.matcher,
			source = this.source,
			data = source.toArray(),
			context = this.context,
			oldLength = old.length,
			sourceLength = source.length,
			iOld = 0,
			iSource = 0,
			result = [];
		publisher.beginChange();
		while(iSource < sourceLength) {
			var item = data[iSource];
			var isMatch = matcher.call(context, item, iSource, source);
			// was previously matched
			if(iOld < oldLength && iSource === old[iOld]) {
				if(!isMatch) {
					// no longer matched => remove
					publisher.remove(result.length, item);
				} else {
					result[result.length] = iSource;
				}
				iOld++;
			} else if(isMatch) {
				var i = result.length;
				result[i] = iSource;
				publisher.insert(i, item);
			}
			iSource++;
		}
		this._data = result;
		publisher.commitChange();
	}

	function handleFilterSourceChanged2(event) {
		var changes = event.enumerator(),
			data = this._data,
			matcher = this.matcher,
			context = this.context,
			source = this.source,
			publisher = this.updates;
		publisher.beginChange();
		while(changes.moveNext()) {
			var change = changes.current,
				changeIndex = change.index,
				localIndex = data.length,
				i, len;

			// simple and stupid "find index" implementation
			// it doesn't matter so much that this is slow since the really slow and stupid part
			// is moving the indices when handling the actual event
			// we might want to optimize that later, perhaps by changing the data structure into something like
			// + value: the actual value (instead of the index we store now)
			// + whitespace: The number of items after this one that are not included in the filter
			// this would require us to do a linear search for the changeIndex (which we already do know)
			// but instead of updating every item afterwards, its just a simple, fast, single decrement/increment.
			// However, iterating over an array of ints shouldn't be too slow to begin with, even when we do
			// it O(n^x), n = data.length, x = #changes, times.
			//if(data.length > 0 && data[data.length-1] >= changeIndex) {
				for(i = 0, len = data.length; i < len; i++) {
					var index = data[i];
					if(index >= changeIndex) {
						localIndex = i;
						break;
					}
				}
			//}

			// okay, so right now we know the following:
			// for all i in data, when i < localIndex, then data[i] < changeIndex
			// for all i in data, when i > localIndex, then data[i] > changeIndex
			// and data[localIndex] >= changeIndex

			if(data[localIndex] === changeIndex) {
				// whatever happened, happened right at this index
				if(change.isDelete) {
					// Since the stored index is the same as the changeIndex, we can be certain already
					// that the deleted item was part of the filter
					data.splice(localIndex, 1);
					publisher.remove(localIndex, change.oldValue);
					for(i = localIndex, len = data.length; i < len; i++) {
						data[i]--;
					}
				} else if(change.isInsert) {
					// case 1: New item belongs here
					if(matcher.call(context, change.newValue, changeIndex, source)) {
						data.splice(localIndex, 0, changeIndex);
						publisher.insert(localIndex, change.newValue);
						for(i = localIndex+1, len = data.length; i < len; i++) {
							data[i]++;
						}
					} else {
						// case 2: New item doesn't belong to filter
						for(i = localIndex, len = data.length; i < len; i++) {
							data[i]++;
						}
					}
				} else if(change.isUpdate) {
					// again, since the stored index is the same at which the update happens, we already know that
					// the old value was part of the filter, thus we only need to know if the new value is also part of the filter
					if(matcher.call(context, change.newValue, changeIndex, source)) {
						// case 1: new item is part of the filter, too => update
						// we don't need to change its value since we're just keeping indices
						publisher.update(localIndex, change.oldValue, change.newValue);
					} else {
						// case 2: new item is not part of the filter => delete
						data.splice(localIndex, 1);
						publisher.remove(localIndex, change.oldValue);
					}
				} else {
					console.log('Unknown change for filtered list:', change)
				}
			} else if(data.length === localIndex || data[localIndex] > changeIndex) {
				// in this case, the change happened between two indices
				if(change.isDelete) {
					// we already know that the old value isn't part of the filter, otherwise we would've found the exact index,
					// not the next bigger one
					for(i = localIndex, len = data.length; i < len; i++) {
						data[i]--;
					}
				} else if(change.isInsert) {
					if(matcher.call(context, change.newValue, changeIndex, source)) {
						// case 1: new item belongs to filter
						data.splice(localIndex, 0, changeIndex);
						publisher.insert(localIndex, change.newValue);
						for(i = localIndex+1, len = data.length; i < len; i++) {
							data[i]++;
						}
					} else {
						// case 2: new item doesn't belong to filter
						for(i = localIndex, len = data.length; i < len; i++) {
							data[i]++;
						}
					}
				} else if(change.isUpdate) {
					// we already know that the old value wasn't a part of the filter, thus we only need to test
					// if the new item belongs to the filter, if so => insert
					// otherwise, we don't need to do anything
					if(matcher.call(context, change.newValue, changeIndex, source)) {
						data.splice(localIndex, 0, changeIndex);
						publisher.insert(localIndex, change.newValue);
					}
				} else {
					console.log('Unkown change type', change);
				}
			} else {
				console.log('Filter bug: data[localIndex] < changeIndex; changeIndex = '+changeIndex+'; localIndex = '+localIndex, data);
			}
		}
		publisher.commitChange();
	}

	function handleFilterSourceChanged(event) {
		var e = event.enumerator(),
			data = this._data,
			l = 0,
			len = data.length,
			matcher = this.matcher,
			context = this.context,
			source = this.source,
			publisher = this.updates;
		publisher.beginChange();
		// The clear preference here would be to use some kind of tree to store the mappings between
		// the local index and the foreign index.
		// Since we're currently using a flat array we need to iterate over everything. We definitely want to explore
		// an alternative implementation at a later point.
		while(e.moveNext()) {
			var change = e.current,
				changeIndex = change.index,
				insertedItem = null,
				removedItem = null,
				r = len, i;
			l = 0; // TODO find out in which cases l === r or l > r can happen and fix them!
			if(data[l] === changeIndex) {
				r = l+1;
			}
			// speed up for "insert/remove/update at end" case
			if(data[data.length-1] <= changeIndex) {
				l = r-1;
			}
			while(1 < (r-l)) {
				var p = l+((r-l)>>1),
					item = data[p];
				if(item < changeIndex) {
					l = p;
				} else if(changeIndex < item) {
					r = p;
				} else {
					l = p;
					r = p+1;
				}
			}
			if(change.isInsert) {
				if(matcher.call(context, change.newValue, changeIndex, source)) {
					// matches, needs to be inserted
					data.splice(r, 0, changeIndex);
					publisher.insert(r, change.newValue);
					r++;
					len++;
				}
				for(i = r; i < len; i++) {
					data[i]++;
				}
			} else if(change.isDelete) {
				if(matcher.call(context, change.oldValue, changeIndex, source)) {
					// matched, needs to be removed
					data.splice(l, 1);
					publisher.remove(l, change.oldValue);
					len--;
					for(i = l; i < len; i++) {
						data[i]--;
					}
				} else {
					for(i = l+1; i < len; i++) {
						data[i]--;
					}
				}
			} else if(change.isUpdate) {
				var oldMatched = matcher.call(context, change.oldValue, changeIndex, source),
					newMatches = matcher.call(context, change.newValue, changeIndex, source);
				if(oldMatched && newMatches) {
					publisher.update(l, change.oldValue, change.newValue);
				} else if(oldMatched && !newMatches) {
					// same as remove
					if(data.length <= l) debugger;
					data.splice(l, 1);
					publisher.remove(l, change.oldValue);
					len--;
					/*for(i = l; i < len; i++) {
						data[i]--;
					}*/
				} else if(!oldMatched && newMatches) {
					if(data.length < l) debugger;
					data.splice(l, 0, changeIndex);
					publisher.insert(l, change.newValue);
					//r++;
					len++;
					/*for(i = r; i < len; i++) {
						data[i]++;
					}*/
				}
			}
		}
		publisher.commitChange();
	}

	function filter(filtered, source) {
		var result = [],
			matcher = filtered.matcher,
			context = filtered.context,
			data = source.toArray();
		for(var i = 0, len = source.length; i < len; i++) {
			var item = data[i];
			if(matcher.call(context, item, i, source)) {
				result[result.length] = i;
			}
		}
		return result;
	}

	function FilteredCollection(source, predicate, context) {
		Collection.call(this);
		filteredCollectionInstaller(this);
		this.source = source;
		this.context = context;
		if(Observable.is(predicate)) {
			this.matcherProperty.bind(predicate);
		} else {
			this.matcher = predicate;
		}
		this._bindings = [
			source.on('change', handleFilterSourceChanged2.bind(this)),
			this.matcherProperty.subscribe(updateFilter, this),
		];
		this._data = filter(this, source);
	}
	Class(FilteredCollection).extends(Collection).def({
		_bindings: null,
		_data: null,

		dispose: function() {
			this._bindings.forEach(function(binding) { binding.dispose() });
			this._bindings = null;
			this._data = null;
			Collection.prototype.dispose.call(this);
		},

		get: function(index) {
			return this.source.get(this._data[index]);
		},

		get length() {
			return this._data.length;
		},

		set length(value) {
			throw new Error('FilteredCollection#length is read-only. Tried to set it to '+value);
		},

		updateFilter: updateFilter,

		matchNone: function() {
			var data = this._data,
				publisher = this.updates;
			publisher.beginChange();
			for(var i = 0, len = data.length; i < len; i++) {
				publisher.remove(i, this.source.get(data[i]));
			}
			this._data = [];
			publisher.commitChange();
		},

		matchAll: function() {
			var old = this._data,
				publisher = this.updates,
				source = this.source,
				data = source.toArray(),
				oldLength = old.length,
				sourceLength = source.length,
				iOld = 0,
				iSource = 0,
				result = [];
			publisher.beginChange();
			while(iSource < sourceLength) {
				var item = data[iSource];
				// was previously matched
				if(iOld < oldLength && iSource === old[iOld]) {
					result[result.length] = iSource;
					iOld++;
				} else {
					var i = result.length;
					result[i] = iSource;
					publisher.insert(i, item);
				}
				iSource++;
			}
			this._data = result;
			publisher.commitChange();
		},

		/**
		 * Should be called when the matcher accepts a strictly narrower set of data instead of
		 * updating the matcher completely.
		 *
		 * The following assertion must be true:
		 * Let i be any item of the original list,
		 * let old_matcher be the matcher before it changed
		 * and let matcher be the modified matcher,
		 * when old_matcher(i) equals false,
		 * then matcher(i) equals false.
		 *
		 * It provides significant performance improvements in comparison to a full rematch.
		 */
		constrainFilter: function() {
			var result = [],
				publisher = this.updates,
				matcher = this.matcher,
				context = this.context,
				data = this._data,
				source = this.source;
			publisher.beginChange();
			for(var i = 0, len = data.length; i < len; i++) {
				var originalIndex = data[i],
					item = source.get(originalIndex);
				if(matcher.call(context, item, originalIndex, source)) {
					result[result.length] = originalIndex;
				} else {
					publisher.remove(result.length, item);
				}
			}
			this._data = result;
			publisher.commitChange();
		},

		/**
		 * Should be called when the matcher is strictly relaxed, i.e. every item that previously matched still matches
		 * but items that were previously not matched may be matched now.
		 *
		 * Calling this method instead of resetting the matcher completely may offer huge performance benefits and is
		 * advised to be used when possible.
		 */
		relaxFilter: function() {
			var old = this._data,
				publisher = this.updates,
				source = this.source,
				data = source.toArray(),
				matcher = this.matcher,
				context = this.context,
				oldLength = old.length,
				sourceLength = source.length,
				iOld = 0,
				iSource = 0,
				result = [];
			publisher.beginChange();
			while(iSource < sourceLength) {
				var item = data[iSource];
				// was previously matched
				if(iOld < oldLength && iSource === old[iOld]) {
					result[result.length] = iSource;
					iOld++;
				} else if(matcher.call(context, item, iSource, source)) {
					var i = result.length;
					result[i] = iSource;
					publisher.insert(i, item);
				}
				iSource++;
			}
			this._data = result;
			publisher.commitChange();
		}
	});
	var filteredCollectionInstaller = ObservableProperty.install(FilteredCollection, 'matcher');
	//endregion

	//region SortedCollection
	var SortMode = {
		STRICT: 1,
		AVOID_MOVE: 2
	};
	function handleSortSourceChanged(event) {
		var data = this._data,
			publisher = this.updates,
			changes = event.enumerator(),
			comparator = this.comparator,
			avoidMove = this.sortMode === SortMode.AVOID_MOVE,
			inserts = [],
			deletes = [],
			updates = [];
		publisher.beginChange();
		while(changes.moveNext()) {
			var change = changes.current;
			if(change.isUpdate) {
				if(avoidMove) {
					updates[updates.length] = change;
				} else {
					deletes[deletes.length] = change.oldValue;
					inserts[inserts.length] = change.newValue;
				}
			} else if(change.isDelete) {
				deletes[deletes.length] = change.oldValue;
			} else if(change.isInsert) {
				inserts[inserts.length] = change.newValue;
			}
		}
		// now sort
		inserts.sort(comparator);
		deletes.sort(comparator);
		updates.sort(function(a, b) {
			return comparator(a.oldValue, b.oldValue);
		});

		var len = data.length,
			insertIndex = 0,
			deleteIndex = 0,
			updateIndex = 0,
			updateLength = updates.length,
			deleteLength = deletes.length,
			insertLength = inserts.length,
			item;
		if(!avoidMove || updateLength === 0) {
			// When we don't need to avoide moving items, i.e. are sorting strictly so that all items in the list are
			// always sorted, then we don't need to look at every item in the list just to make some changes to it.
			// Instead, we can use a binary search to find the index where the change should happen.
			// Since all modifications (inserts and deletes) are sorted internally, we can make the assertion that
			// we can reuse the left boundary for the search for each modification if we start with the
			// smallest changed value.
			// This has the huge benefit that if rather large values are removed, we can potentially skip past half
			// of the list in the first iteration. Which also means significantly fewer comparisions between the items.
			var l = 0;
			while(true) {
				// figure out what to do next
				var r = len, nextInsert, nextDelete, cmp, searchBoth = false;
				if(insertIndex < insertLength && deleteIndex < deleteLength) {
					nextInsert = inserts[insertIndex];
					nextDelete = deletes[deleteIndex];
					cmp = comparator(nextInsert, nextDelete);
					if(cmp < 0) {
						item = nextInsert;
						insertIndex++;
					} else if(cmp > 0) {
						item = nextDelete;
						deleteIndex++;
					} else {
						// can't decide, look for both
						item = nextInsert;
						searchBoth = true;
					}
				} else if(insertIndex < insertLength) {
					nextInsert = item = inserts[insertIndex];
					nextDelete = undefined;
					insertIndex++;
				} else if(deleteIndex < deleteLength) {
					nextDelete = item = deletes[deleteIndex];
					nextInsert = undefined;
					deleteIndex++;
				} else {
					break;
				}
				// figure out where to place the item
				var p;
				if(!searchBoth && item === nextInsert) {
					// If we are really just inserting an item, we can use the fast search
					while(1 < (r-l)) {
						p = l+((r-l)>>1);
						cmp = comparator(data[p], item);
						if(cmp <= 0) {
							l = p;
						} else {
							r = p;
						}
					}
				} else {
					// We're either removing an item or it is unclear whether we want to
					// add or remove an item, thus we need to work with a potentially slower
					// algorithm that starts with a binary search but falls back to
					// a sequential search when we've found a potential match.
					while(1 < (r-l)) {
						p = l+((r-l)>>1);
						cmp = comparator(data[p], item);
						if(cmp < 0) {
							l = p;
						} else if(cmp > 0) {
							r = p;
						} else {
							// Special case: we may have found the item or we may be in a really bad situation
							// where multiple items are equal (with respect to the comparator) but not the same.
							// In that case we must switch our search strategy to a slower but more accurate
							// sequential search
							while(l < r) {
								var d = data[l];
								if(searchBoth) {
									if(d === nextInsert) {
										item = nextInsert;
										insertIndex++;
										r = l+1;
										break;
									} else if(d === nextDelete) {
										item = nextDelete;
										deleteIndex++;
										r = l+1;
										break;
									}
								} else if(d === item) {
									r = l+1;
									break;
								}
								l++;
							}
						}
					}
				}
				if(item === nextInsert) {
					if(l < r && comparator(data[l], item) > 0) {
						data.splice(l, 0, item);
						publisher.insert(l, item);
					} else {
						data.splice(r, 0, item);
						publisher.insert(r, item);
					}
					len++;
				} else if(item === nextDelete) {
					if(l < data.length) {
						data.splice(l, 1);
						publisher.remove(l, item);
						len--;
					} else {
						// The comparator does not sort properly, we haven't found the searched item yet.
						// Thus we have to search again, but reset l to start at the beginning.
						l = 0;
						deleteIndex--;
					}
				}
			}
		} else {
			// merging: O(n), can't be faster since we may have only a partially sorted array
			for(var i = 0; i < len; i++) {
				item = data[i];
				if(updateIndex < updateLength && updates[updateIndex].oldValue === item) {
					var update = updates[updateIndex];
					publisher.update(i, update.oldValue, update.newValue);
					data[i] = update.newValue;
					updateIndex++;
				}
				// remove item
				if(deleteIndex < deleteLength && item === deletes[deleteIndex]) {
					publisher.remove(i, item);
					data.splice(i, 1);
					deleteIndex++;
					len--;
				}
				if(insertIndex < insertLength) {
					var insert = inserts[insertIndex],
						compareBefore = comparator(item, insert),
						compareAfter = compareBefore <= 0 && (i+1) < len ? comparator(insert, data[i+1]) : -1;
					if(compareBefore <= 0 && compareAfter < 0) {
						publisher.insert(i+1, insert);
						data.splice(i+1, 0, insert);
						insertIndex++;
						len++;
					}
				}
			}
		}

		publisher.commitChange();
	}
	function handleReSort() {
		var old = this._data, updates = this.updates;
		this._data = this.source.toArray().sort(this.comparator);
		updates.beginChange();
		for(var newData = this._data, i = 0, len = newData.length; i < len; i++) {
			updates.update(i, old[i], newData[i]);
		}
		updates.commitChange();
	}
	function SortedCollection(source, comparator, sortMode, context) {
		Collection.call(this);
		sortedCollectionInstaller(this);
		this.source = source;
		this.context = context;
		this.sortMode = sortMode || SortMode.STRICT;
		if(Observable.is(comparator)) {
			this.comparatorProperty.bind(comparator);
		} else {
			this.comparator = comparator;
		}
		this._data = this.source.toArray().sort(this.comparator);
		this.bindings = [
			this.source.on('change', handleSortSourceChanged.bind(this)),
			this.comparatorProperty.subscribe(handleReSort.bind(this))
		];
	}
	Class(SortedCollection).extends(Collection).def({
		get: function(index) {
			return this._data[index];
		},

		dispose: function() {
			this._bindings.forEach(function(binding) { binding.dispose() });
			this._bindings = null;
			this._data = null;
			Collection.prototype.dispose.call(this);
		},

		get length() {
			return this.source.length;
		},

		set length(value) { throw new Error("IllegalAccess: Length of a sorted collection isn't writable. Tried to set it to "+value); },

		toArray: function() {
			return this._data.slice();
		}
	});
	var sortedCollectionInstaller = ObservableProperty.install(SortedCollection, 'comparator');
	//endregion

	//region StreamCollection
	function handleStreamSourceChanged(event) {
		var publisher = this.updates;
		if(this._isMirror) {
			publisher.pipe(event);
		} else {
			var changes = event.enumerator();
			publisher.beginChange();
			while(changes.moveNext()) {
				var change = changes.current;
				if(change.index < this._length) {
					publisher.update(change.index, change.oldValue, change.newValue);
					if(change.isInsert) {
						this._length++;
					} else if(change.isDelete) {
						publisher.insert(this._length-1, this.get(this._length-1));
					}
				}
			}
			publisher.commitChange();
		}
	}

	function handleStreamTick() {
		var publisher = this.updates,
			source = this.source,
			sourceLength = source.length,
			length = this._length,
			chunkSize = this._chunkSize;

		if(length + chunkSize < sourceLength) {
			setTimeout(handleStreamTick.bind(this), this._delay);
		} else if(length === sourceLength) {
			this._isMirror = true;
			return;
		}

		publisher.beginChange();
		for(var i = length, len = Math.min(length+chunkSize, sourceLength); i < len; i++) {
			publisher.insert(i, source.get(i));
		}
		this._length = len;
		if(len === sourceLength) {
			this._isMirror = true;
		}
		publisher.commitChange();
	}

	function StreamCollection(source, chunkSize, delay) {
		Collection.call(this);

		var sourceLength = source.length;
		this.source = source;
		this._delay = delay || 1000;
		this._chunkSize = chunkSize || 50;
		this._length = Math.min(this._chunkSize, sourceLength);
		this._isMirror = this._length === sourceLength;
		this._bindings = this.source.on('change', handleStreamSourceChanged.bind(this));

		if(!this._isMirror) {
			setTimeout(handleStreamTick.bind(this), this._delay);
		}
	}
	Class(StreamCollection).extends(Collection).def({
		get length() {
			return this._isMirror ? this.source.length : this._length;
		},

		get: function(index) {
			return this.source.get(index);
		},

		toArray: function() {
			if(this._isMirror) {
				return this.source.toArray();
			}
			return this.source.toArray().slice(0, this._length);
		}
	});
	//endregion

	//region GroupCollection
	function groupFilter(key, item, index, source) {
		return this.keySelector.call(this.context, item, index, source) === key;
	}

	function handleGroupSourceChanged(event) {
		var changes = event.enumerator(),
			source = this.source,
			publisher = this.updates,
			keySelector = this.keySelector,
			context = this.context,
			keyMap = this._keyMap,
			keys = this._keys;
		publisher.beginChange();
		while(changes.moveNext()) {
			var change = changes.current;
			var key;
			if(change.isInsert || change.isUpdate) {
				key = keySelector.call(context, change.newValue, change.index, source);
				if(!keyMap[key]) {
					keyMap[key] = createGroupFilter.call(this, key);
					keys[keys.length] = key;
					publisher.insert(keys.length-1, key);
				}
			}
			if(change.isDelete || change.isUpdate) {
				key = keySelector.call(context, change.oldValue, change.index, source);
				var collection = keyMap[key];
				if(collection && collection.length === 0) {
					var index = keys.indexOf(key);
					keys.splice(index, 1);
					keyMap[key] = undefined;
					collection.dispose();
					publisher.remove(index, key);
				}
			}
		}
		publisher.commitChange();
	}

	function createGroupFilter(key) {
		return this.source.filter(groupFilter.bind(this, key));
	}

	function handleKeySelectorChanged() {
		var keyMap = this._keyMap,
			keys = this._keys,
			seenKeys = {},
			data = source.toArray(),
			selector = this.keySelector,
			context = this.context,
			publisher = this.updates;
		publisher.beginChange();
		// add new keys
		for(var i = 0, len = data.length; i < len; i++) {
			var key = selector.call(context, data[i], i, source);
			if(!keyMap[key]) {
				seenKeys[key] = true;
				keys[keys.length] = key;
				keyMap[key] = createGroupFilter.call(this, key);
				publisher.insert(keys.length-1, keyMap[key]);
			}
		}
		// test to see if the old and the new keys are any different
		var oldIndex = 0;
		for(i = 0, len = keys.length; i < len; i++, oldIndex++) {
			key = keys[i];
			if(!seenKeys[key]) {
				keys.splice(i, 1);
				len--;
				i--;
				publisher.remove(oldIndex, key);
			}
		}
		publisher.commitChange();
	}

	function GroupCollection(source, keySelector, context) {
		Collection.call(this);
		groupCollectionInstaller(this);
		this.source = source;
		this.context = context;
		if(Observable.is(keySelector)) {
			this.keySelectorProperty.bind(keySelector);
		} else {
			this.keySelector = keySelector;
		}
		// initial grouping
		var keyMap = {},
			keys = [],
			data = source.toArray(),
			selector = this.keySelector;
		for(var i = 0, len = data.length; i < len; i++) {
			var key = selector.call(context, data[i], i, source);
			if(!keyMap[key]) {
				keys[keys.length] = key;
				keyMap[key] = createGroupFilter.call(this, key);
			}
		}
		this._keyMap = keyMap;
		this._keys = keys;

		this.bindings = [
			this.source.on('change', handleGroupSourceChanged.bind(this)),
			this.keySelectorProperty.subscribe(handleKeySelectorChanged.bind(this))
		];
	}
	Class(GroupCollection).extends(Collection).def({
		keySelectorProperty: null,

		dispose: function() {
			this._bindings.forEach(function(binding) { binding.dispose() });
			this._bindings = null;
			for(var i = 0, len = this._keys.length; i < len; i++) {
				this._keyMap[this._keys[i]].dispose();
			}
			this._keyMap = null;
			this._keys = null;
			Collection.prototype.dispose.call(this);
		},

		get: function(index) {
			return this._keys[index];
		},

		getByKey: function(key) {
			return this._keyMap[_.isString(key) || _.isNumber(key) ? key : this.keySelector.call(this.context, key, -1, this.source)];
		},

		hasKey: function(key) {
			return !!this._keyMap[key];
		},

		get length() {
			return this._keys.length;
		},

		set length(value) {
			throw new Error("IllegalAccess: Can't modify length of a grouped collection. Tried to set it to "+value);
		},

		map: function(transform, context) {
			return new TransformedCollectionGroup(this, transform, context);
		},

		filter: function(matcher, context) {
			return new FilteredCollectionGroup(this, matcher, context);
		},

		sort: function(comparator, context, sortMode) {
			return new SortedCollectionGroup(this, comparator, sortMode, context);
		},

		asStream: function(chunkSize, delay) {
			return new StreamCollectionGroup(this, chunkSize, delay);
		}
	});
	var groupCollectionInstaller = ObservableProperty.install(GroupCollection, 'keySelector');

	var GroupTransforms = {
		hasKey: function(key) {
			return this.source.hasKey(key);
		},

		getByKey: function(key) {
			return this.source.getByKey(key);
		},

		map: function(transform, context) {
			return new TransformedCollectionGroup(this, transform, context);
		},

		filter: function(matcher, context) {
			return new FilteredCollectionGroup(this, matcher, context);
		},

		sort: function(comparator, context, sortMode) {
			return new SortedCollectionGroup(this, comparator, sortMode, context);
		},

		asStream: function(chunkSize, delay) {
			return new StreamCollectionGroup(this, chunkSize, delay);
		}
	};

	function TransformedCollectionGroup(source, transform, context) {
		TransformedCollection.call(this, source, transform, context);
	}
	Class(TransformedCollectionGroup).extends(TransformedCollection).mixin(GroupTransforms);
	TransformedCollectionGroup.prototype.filter = GroupTransforms.filter;
	TransformedCollectionGroup.prototype.sort = GroupTransforms.sort;
	TransformedCollectionGroup.prototype.map = GroupTransforms.map;
	TransformedCollectionGroup.prototype.stream = GroupTransforms.stream;

	function SortedCollectionGroup(source, comparator, context, sortMode) {
		SortedCollection.call(this, source, comparator, context, sortMode);
	}
	Class(SortedCollectionGroup).extends(SortedCollection).mixin(GroupTransforms);
	SortedCollectionGroup.prototype.filter = GroupTransforms.filter;
	SortedCollectionGroup.prototype.sort = GroupTransforms.sort;
	SortedCollectionGroup.prototype.map = GroupTransforms.map;
	SortedCollectionGroup.prototype.stream = GroupTransforms.stream;

	function FilteredCollectionGroup(source, matcher, context) {
		FilteredCollection.call(this, source, matcher, context);
	}
	Class(FilteredCollectionGroup).extends(FilteredCollection).mixin(GroupTransforms);
	FilteredCollectionGroup.prototype.filter = GroupTransforms.filter;
	FilteredCollectionGroup.prototype.sort = GroupTransforms.sort;
	FilteredCollectionGroup.prototype.map = GroupTransforms.map;
	FilteredCollectionGroup.prototype.stream = GroupTransforms.stream;

	function StreamCollectionGroup(source, chunkSize, delay) {
		StreamCollection.call(this, source, chunkSize, delay);
	}
	Class(StreamCollectionGroup).extends(StreamCollection).mixin(GroupTransforms);
	StreamCollectionGroup.prototype.filter = GroupTransforms.filter;
	StreamCollectionGroup.prototype.sort = GroupTransforms.sort;
	StreamCollectionGroup.prototype.map = GroupTransforms.map;
	StreamCollectionGroup.prototype.stream = GroupTransforms.stream;
	//endregion

	return Collection;
});