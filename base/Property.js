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
	'./Class', './Binding', './Bindings',
	'./Util'
], function(Class, Binding, Bindings, _) {
	"use strict";
	function args(self, args) {
		args = _.asArray(args);
		args.unshift(self);
		return args;
	}

	/**
	 * Creates a new property.
	 *
	 * @memberof module:jidejs/base/Property
	 * @param {Object} context The object that this property belongs to.
	 * @param {String} name The name of the property
	 * @class
	 * @constructor
	 * @alias module:jidejs/base/Property
	 * @abstract
	 */
	function Property(context, name) {
		this._context = context;
		this._name = name;
	}
	Class(Property).def({

		/**
		 * Returns the current value of the property.
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

		notify: function() {
			this._context.emit.apply(this._context, ['change:'+this._name].concat(_.asArray(arguments)));
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
		 * @param {jidejs/base/Property} source The source property whose value should be copied to this property
		 * @param {Function?} converter The converter function.
		 * @returns {Binding} The created binding between the two properties.
		 */
		bind: function(source, converter) {
			return new Binding(source, this, Binding.ONE_WAY, converter);
		},

		/**
		 * Creates a bidirectional binding between this property and another property. A bidirectional binding will
		 * update the other property whenever any of the two properties changes.
		 * @param {module:jidejs/base/Property} source The other property.
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
		 * @param {jidejs/base/Property} target The target property whose value should be modified when this property changes.
		 * @param {Function?} converter The converter function.
		 * @returns {Binding} The created binding between the two properties.
		 */
		bindToTarget: function(target, converter) {
			return new Binding(this, target, Binding.ONE_WAY, converter);
		},

		//region Fluent API for Bindings
		/**
		 * This type of binding can be used to create a property whose value changes when the bound property
		 * takes a truthy or falsy value.
		 *
		 * A _truthy_ value is anything that can be coerced into the boolean _true_ value, i.e. strings, objects, functions and
		 * the boolean value _true_.
		 *
		 * A _falsy_ value is anything that can be coerced into the boolean _false_ value, i.e. _undefined_, _null_ and
		 * the boolean value _false_.
		 *
		 * The return value of this method is a builder that helps with the process of creating such a conditional binding.
		 * The first return value provides an object with a _then_ method that expects the value of the property that
		 * should be used if the condition is truthy and returns an object with an _otherwise_ method that expects the
		 * value that should be used if the condition is falsy and returns the created conditional property.
		 *
		 * If the _then_ or _otherwise_ values are {@link jidejs/base/Property properties} then their current value will
		 * be extracted (using its _get_ method) and used as the value of the conditional property.
		 *
		 * @example
		 * var motorControlLightColorProperty = require('./Bindings')
		 * 	.when(car.isMotorRunningProperty)
		 * 		.then('red')
		 * 		.otherwise('blue');
		 *
		 * @returns {{then: Function}} The conditional property builder.
		 */
		when: function() {
			return Bindings.when(this);
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property number properties} or numbers and returns
		 * a {@link jidejs/base/Property} that consists of their total sum.
		 * @returns {jidejs/base/Property}
		 */
		add: function() {
			return Bindings.add.apply(Bindings, args(this, arguments));
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property number properties} or numbers and returns
		 * a {@link jidejs/base/Property} that consists of their total difference.
		 * @returns {jidejs/base/Property}
		 */
		subtract: function() {
			return Bindings.subtract.apply(Bindings, args(this, arguments));
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property number properties} or numbers and returns
		 * a {@link jidejs/base/Property} that consists of their total product.
		 * @returns {jidejs/base/Property}
		 */
		multiply: function() {
			return Bindings.multiply.apply(Bindings, args(this, arguments));
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property number properties} or numbers and returns
		 * a {@link jidejs/base/Property} that is the result of dividing them.
		 * @returns {jidejs/base/Property}
		 */
		divide: function() {
			return Bindings.divide.apply(Bindings, args(this, arguments));
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property boolean properties} and returns a property that
		 * contains the value _true_, if all of those properties evaluate to _true_ and _false_ otherwise.
		 * @returns {jidejs/base/Property}
		 */
		and: function() {
			return Bindings.and.apply(Bindings, args(this, arguments));
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property boolean properties} and returns a property that
		 * contains the value _true_, if any of those properties evaluate to _true_ and _false_ otherwise.
		 *
		 * @returns {jidejs/base/Property}
		 */
		or: function() {
			return Bindings.or.apply(Bindings, args(this, arguments));
		},

		/**
		 * Expects a variable list of {@link jidejs/base/Property properties} or strings and returns a property that
		 * contains the concatenated value of all of them.
		 *
		 * The parameters are converted into strings before the concatenation and the generated property will also contain
		 * a string.
		 *
		 * @returns {jidejs/base/Property}
		 */
		concat: function() {
			return Bindings.concat.apply(Bindings, args(this, arguments));
		},

		/**
		 * Creates a boolean property whose value is _true_, if both properties are equal to each other; _false_ otherwise.
		 * @param {jidejs/base/Property} other The property compared with this one.
		 * @returns {jidejs/base/Property}
		 */
		equal: function(other) {
			return Bindings.equal(this, other);
		},

		/**
		 * Creates a boolean property whose value is _true_, if the properties are not equal to each other; _false_ otherwise.
		 * @param {jidejs/base/Property} other The property compared with this one.
		 * @returns {jidejs/base/Property}
		 */
		notEqual: function(other) {
			return Bindings.notEqual(this, other);
		},

		/**
		 * Creates a boolean property whose value is _true_, if the value of this property is _false_ and _true_, otherwise.
		 * @returns {jidejs/base/Property}
		 */
		not: function() {
			return Bindings.not(this);
		},

		/**
		 * Creates a property whose value is the bitwise negation of the value of this property.
		 * This property must be an integer property.
		 * @returns {module:jidejs/base/Property}
		 */
		negate: function() {
			return Bindings.negate(this);
		},

		/**
		 * Creates a boolean property whose value is _true_, if the value of this property is greater than
		 * the value of the other property, and _false_ otherwise.
		 * @param {jidejs/base/Property} other The other property.
		 * @returns {jidejs/base/Property}
		 */
		greaterThan: function(other) {
			return Bindings.greaterThan(this, other);
		},

		/**
		 * Creates a boolean property whose value is _true_, if the value of this property is greater than or equal to
		 * the value of the other property, and _false_ otherwise.
		 * @param {jidejs/base/Property} other The other property.
		 * @returns {jidejs/base/Property}
		 */
		greaterThanOrEqual: function(other) {
			return Bindings.greaterThanOrEqual(this, other);
		},

		/**
		 * Creates a boolean property whose value is _true_, if the value of this property is less than
		 * the value of the other property, and _false_ otherwise.
		 * @param {jidejs/base/Property} other The other property.
		 * @returns {jidejs/base/Property}
		 */
		lessThan: function(other) {
			return Bindings.lessThan(this, other);
		},

		/**
		 * Creates a boolean property whose value is _true_, if the value of this property is less than or equal to
		 * the value of the other property, and _false_ otherwise.
		 * @param {jidejs/base/Property} other The other property.
		 * @returns {jidejs/base/Property}
		 */
		lessThanOrEqual: function(other) {
			return Bindings.lessThanOrEqual(this, other);
		},

		/**
		 * Creates a number property whose value is the maximum of this property or the other property.
		 * @param {jidejs/base/Property} other The other property.
		 * @returns {jidejs/base/Property}
		 */
		max: function(other) {
			return Bindings.max(this, other);
		},

		/**
		 * Creates a number property whose value is the minimum of this property or the other property.
		 * @param {jidejs/base/Property} other The other property.
		 * @returns {jidejs/base/Property}
		 */
		min: function(other) {
			return Bindings.min(this, other);
		},

		/**
		 * Creates a new property whose value is converted from this properties value.
		 * @param {function} converter The converter function, receives the value of this property as its argument and
		 * 			returns the converted value.
		 * @returns {*}
		 */
		convert: function(converter) {
			return Bindings.convert(this, converter);
		},

		/**
		 * Creates a property whose value is calculated by following the given path. It automatically updates whenever
		 * a property down the path is changed.
		 *
		 * The path may consist of properties or normal fields. The automatic update only handles changes in properties,
		 * however.
		 *
		 * @example
		 * var parentStreetNameProperty = myModel.personProperty.select(
		 * 	'parentProperty', 'adressProperty', 'streetProperty', 'nameProperty');
		 * // same as: myModel.personProperty.parentProperty.adressProperty.streetProperty.nameProperty.get();
		 * // but updates whenever any of the named properties changes.
		 *
		 *
		 * @param {...string} path
		 * @returns {jidejs/base/Property}
		 */
		select: function(path) {
			return Bindings.select.apply(Bindings, args(this, arguments));
		}
		//endregion
	});
	return Property;
});