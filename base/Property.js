/**
 * The abstract base class of all properties.
 *
 * A property is a value of an object that can be observed for changes.
 *
 * In order to prevent memory leaks, it is imperative that objects with properties are explicitly disposed of.
 * Such a dispose method must call the _dispose_ method of all of its properties to make sure
 * that all listeners of properties are released and no cyclic dependencies between closures used to create such
 * listeners and the property still exists.
 *
 * A property is similar to an {@link module:jidejs/base/Observable} and can be used wherever an observable is requested,
 * but it requires to be created with a `context` object to whom it belongs.
 * Properties dispatch their changes as an event using their `context` which must therefore mixin the
 * {@link module:jidejs/base/EventEmitter}.
 *
 * You can subscribe to the change event of an property either directly, using {@link #subscribe} or by subscribing
 * to the `context` of the property. The name of the change event in this case will be `change:**event**`, where **event**
 * is the name of the property.
 *
 * @module jidejs/base/Property
 */
define([
	'./Class', './Binding', './Observable',
	'./Util'
], function(Class, Binding, Observable, _) {
	"use strict";
	function args(self, args) {
		args = _.asArray(args);
		args.unshift(self);
		return args;
	}

	/**
	 * Creates a new property.
	 *
	 * @constructor
	 * @alias module:jidejs/base/Property
	 * @abstract
     * @extends module:jidejs/base/Observable
     *
     * @param {Object} context The object that this property belongs to.
     * @param {String} name The name of the property
	 */
	var exports = function Property(context, name) {
		this._context = context;
		this._name = name;
	};
    var Property = exports;
	Class(Property).extends(Observable).def(/** @lends module:jidejs/base/Property# */{
		/**
		 * Returns the current value of the property.
         * @abstract
		 */
		'get': function() {
			throw new Error('Method "get" is abstract and must be overridden by subclass.');
		},

		/**
		 * Adds a listener to the property that is notified of any change in its value.
		 * @param {Function} handler The function that should be executed when the properties value changes.
		 * @returns {module:jidejs/base/PropertyListener} The property listener instance that can be used to remove the
		 * 												listener from the property when it is no longer used.
		 */
		subscribe: function(handler) {
			return this._context.on('change:'+this._name, handler);
		},

		/**
		 * Removes a listener from the property.
		 * @param {Function} handler The function that should no longer be executed when the properties value changes.
		 */
		unsubscribe: function(handler) {
			this._context.removeListener('change:'+this._name, handler);
		},

		notify: function(event) {
            switch(arguments.length) {
                case 0:
                    this._context.emit('change:'+this._name);
                    break;
                case 1:
                    this._context.emit('change:'+this._name, event);
                    break;
                default:
                    this._context.emit.apply(this._context, ['change:'+this._name].concat(_.asArray(arguments)));
                    break;
            }
		},

		dispose: function() {
			if(!this._context) return;
			this._context.removeAllListeners('change:'+this._name);
			this._context = null;
		},

		/**
		 * Binds this property to the given _source_ property, which means that the value of this property
		 * is changed whenever the _source_ properties value changed.
		 *
		 * The value can be modified by providing a _converter_ function, which expects the original value of the
		 * _source_ property and converts it into an appropriate value for this property. The converter function will
		 * receive the actual value of the property, not the property itself.
		 *
		 * @example
		 * invoice.totalProperty.bind(invoice.netTotalProperty, function(netTotal) {
		 * 	return netTotal * 1.19; // add VAT to price
		 * });
		 *
		 * @param {module:jidejs/base/Observable} source The source property whose value should be copied to this property
		 * @param {Function?} converter The converter function.
		 * @returns {Binding} The created binding between the two properties.
		 */
		bind: function(source, converter) {
			return new Binding(source, this, Binding.ONE_WAY, converter);
		},

		/**
		 * Creates a bidirectional binding between this property and another property. A bidirectional binding will
		 * update the other property whenever any of the two properties changes.
		 * @param {module:jidejs/base/Observable} source The other property.
		 * @param {Object} converter The converter used to transform the values between the two properties.
		 * @param {Function} converter.convertFrom The converter function used to transform from the `target` to this property.
		 * @param {Function} converter.convertTo The converter function used to transform from this property to the `target` property.
		 * @returns {Binding}
		 */
		bindBidirectional: function(source, converter) {
			return new Binding(source, this, Binding.BIDIRECTIONAL, converter);
		},

		/**
		 * Creates a binding from this property to the _target_ property, which means that the value of the _target_
		 * property is updated whenever this properties value changes.
		 *
		 * The value can be modified by providing a _converter_ function, which expects the original value of the
		 * _source_ property and converts it into an appropriate value for this property. The converter function will
		 * receive the actual value of the property, not the property itself.
		 *
		 * @example
		 * invoice.netTotalProperty.bind(invoice.totalProperty, function(netTotal) {
		 * 	return netTotal / 1.19; // remove VAT from total price
		 * });
		 *
		 * @param {jidejs/base/Observable} target The target property whose value should be modified when this property changes.
		 * @param {Function?} converter The converter function.
		 * @returns {Binding} The created binding between the two properties.
		 */
		bindToTarget: function(target, converter) {
			return new Binding(this, target, Binding.ONE_WAY, converter);
		}
	});
	return exports;
});