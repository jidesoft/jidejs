/**
 * This type of {@link jidejs/base/Property} allows to calculate its value based on multiple other properties that are
 * observed for changes.
 *
 * @module jidejs/base/DependencyProperty
 */
define([
	'./Class', './PropertyListener', './Binding',
	'./Property', './Util', './DependencyTracker'
], function(Class, PropertyListener, Binding, Property, _, DependencyTracker) {
	/**
	 * A DependencyProperty is a read-only property whose value is generated from a list of
	 * dependencies.
	 *
	 * The _computeValue_ function will receive the values all bound properties in order of binding as its parameters.
	 *
     * @constructor
     * @alias module:jidejs/base/DependencyProperty
     * @extends module:jidejs/base/Property
     *
	 * @param {Object} context The object that is used as the context (i.e. "this")
	 * 									  of the {@link computeValue} function.
	 * @param {String} name The name of the property.
	 * @param {Function|Object} computeValue The function used to calculate the value of this property or an object that
	 * 				defines the read and write operations.
	 * @param {Function} computeValue.read The function used to calculate the value.
	 * @param {Function} computeValue.write A function that updates the otherwise read values when the value of this property is set.
	 */
	var exports = function DependencyProperty(context, name, computeValue) {
		if(!(this instanceof DependencyProperty)) {
			return new DependencyProperty(context, name, computeValue);
		}
		Property.call(this, context, name);
		this._value = null;
		this._bindings = [];
		if(computeValue) {
			if(_.isObject(computeValue)) {
				this.computeValue = computeValue.read;
				this.set = computeValue.write;
			} else {
				this.computeValue = computeValue;
			}
		}
	};

	Class(DependencyProperty).extends(Property).def(/** @lends module:jidejs/base/DependencyProperty# */{
        get writable() { return this.set !== null; },

		_bindings: null,
		/**
		 * A flag that signals whether the value of this property is currently invalid and needs to be recalculated.
		 * @readonly
		 */
		invalid: true,

		/**
		 * Must be overriden if you want to be able to set the value of a DependencyProperty.
		 * Should update the dependencies so that recalculating them will yield the same value as is provided.
		 *
		 * @function
		 * @param {*} value The new value
		 */
		'set': null,

		/**
		 * Invoking this method will either return the previously calculated value of the property or recalculates it
		 * if it is currently marked as invalid.
		 * @returns {*} The calculated result of the property.
		 */
		'get': function() {
			if(this.invalid && this.computeValue) {
				DependencyTracker.begin(this);
				this._value = this.computeValue.apply(this._context || this);
				var deps = DependencyTracker.end(this);
				this._bindings.forEach(function(binding) { binding.dispose(); });
				this._bindings = [];
				var invalidate = this.invalidate.bind(this);
				for(var i = 0, len = deps.length; i < len; ++i) {
					this._bindings.push(deps[i].subscribe(invalidate));
				}
				this.invalid = false;
			} else {
                DependencyTracker.read(this);
            }
			return this._value;
		},

		/**
		 * Calculates the value of the property. This method should be overridden by users of this class.
		 * The default implementation will return _null_.
		 * @returns {*}
		 */
		computeValue: function() {
			return null;
		},

		/**
		 * Invalidates the current value of the property and notifies all of its listeners that its value has changed.
		 *
		 * *Note*: The listeners are notified even if the actual value is not changed. This is required as the
		 * recalculation happens lazily upon first request of the value.
		 */
		invalidate: function() {
			this.invalid = true;
			this.notify();
		},

		/**
		 * Releases all resources stored in the object, preparing it for garbage collection.
		 */
		dispose: function() {
			this.computeValue = null;
			this._bindings.forEach(function(binding) { binding.dispose(); });
			this._bindings = null;
		}
	});

	return exports;
});