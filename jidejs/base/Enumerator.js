/**
 * An Enumerator allows to enumerate over the items in a collection. It is most prominently used as the API to enumerate
 * over the changes in an {@link module:jidejs/base/Collection}.
 *
 * @module jidejs/base/Enumerator
 */
define('jidejs/base/Enumerator', [
	'jidejs/base/Class'
], function(Class) {
	"use strict";
	/**
	 * A general interface for enumerating a set of values.
	 *
	 * @memberof module:jidejs/base/Enumerator
	 * @constructor
	 * @alias module:jidejs/base/Enumerator
	 */
	function Enumerator() {
	}
	Class(Enumerator).def({
		/**
		 * Contains the current value of the enumeration. If accessed before {@link module:jidejs/base/Enumerator#moveNext}
		 * has been invoked, its value should be `null` or `undefined`.
		 * @property {*}
		 */
		current: null,
		/**
		 * Moves the enumeration to the next value, returns `true`, if there is such a value; `false`, otherwise.
		 * @returns {boolean} `true`, if there is a new value stored in `current`; `false`, otherwise.
		 */
		moveNext: function() {},
		peek: function() {}
	});
	Enumerator.Array = function(array) {
		this.array = array;
		this.index = -1;
	};
	Class(Enumerator.Array).extends(Enumerator).def({
		get current() {
			return this.array[this.index];
		},

		moveNext: function() {
			this.index++;
			return this.index < this.array.length;
		},

		peek: function() {
			return this.array[this.index+1];
		}
	});
	return Enumerator;
});