/**
 * @module jidejs/base/ObservableMap
 */
define([
	'./Class', './EventEmitter'
], function(Class, EventEmitter) {
	/**
	 * A map or dictionary type that can be observed for changes.
	 *
	 * @memberof module:jidejs/base/ObservableMap
	 * @param {Object} owner The owner of this map.
	 * @constructor
	 * @alias module:jidejs/base/ObservableMap
	 */
	function ObservableMap(owner) {
		this.owner = owner;
		EventEmitter.call(this);
		this.data = {};
	}
	Class(ObservableMap).mixin(EventEmitter).def({
		/**
		 * Adds or updates the given key value pair.
		 *
		 * Fires a new *change* event. The listeners will receive three arguments:
		 *
		 * * The key that was changed
		 * * The value that was stored
		 * * An object, containing _value_, _oldValue_ and _owner_ properties.
		 *
		 * @param {string} key The key under which the value should be stored.
		 * @param {*} value The value stored under the key.
		 */
		set: function(key, value) {
			var oldValue = this.data['jidejs/'+key];
			this.data['jidejs/'+key] = value;
			this.emit('change', {
				key: key,
				value: value,
				oldValue: oldValue,
				source: this.source
			});
		},

		/**
		 * The value stored under the key.
		 *
		 * @param {string} key The key where the item is stored under.
		 * @returns {*}
		 */
		get: function(key) {
			return this.data['jidejs/'+key];
		},

		/**
		 * Returns _true_, if there is a value stored under the given key; _false_ otherwise.
		 * @param {string} key The key that should be looked up.
		 * @returns {boolean}
		 */
		has: function(key) {
			return this.data.hasOwnProperty('jidejs/'+key);
		},

		/**
		 * Removes the value under the given key.
		 * @param {string} key The key that should be removed.
		 */
		remove: function(key) {
			var oldValue = this.data['jidejs/'+key];
			delete this.data['jidejs/'+key];
			this.emit('change', {
				key: key,
				value: undefined,
				oldValue: oldValue,
				source: this.owner
			});
		},

		/**
		 * Frees all resources and makes them available for garbage collection.
		 */
		dispose: function() {
			EventEmitter.prototype.dispose.call(this);
			delete this.data;
			delete this.owner;
		}
	});
	return ObservableMap;
});