/**
 * An ObservableProperty is the most basic implementation of a {@link module:jidejs/base/Property} and supports
 * change listeners as well as storing a single value.
 *
 * @extends module:jidejs/base/Property
 * @module jidejs/base/ObservableProperty
 */
define('jidejs/base/ObservableProperty', [
	'jidejs/base/Class', 'jidejs/base/Binding', 'jidejs/base/Util',
	'jidejs/base/PropertyListener', 'jidejs/base/Property', 'jidejs/base/EventEmitter',
	'jidejs/base/DependencyTracker'
], function(Class, Binding, _, PropertyListener, Property, EventEmitter, DependencyTracker) {
	"use strict";
	/**
	 * Creates a new observable property.
	 * @memberof module:jidejs/base/ObservableProperty
	 * @param {Object} context The object that this property belongs to.
	 * @param {String} name The name of the property.
	 * @param {*} initialValue (Optional) The initial value of the property.
	 * @param {function} converter (Optional) A converter function that should be used to convert values set to
	 * 							   this property.
	 * @constructor
	 * @alias module:jidejs/base/ObservableProperty
	 */
	function ObservableProperty(context, name, initialValue, converter, bubbles, cancelable) {
		if(!(this instanceof ObservableProperty)) {
			return new ObservableProperty(context, name, initialValue, converter);
		}
		Property.call(this, context, name);
		this._value = initialValue;
		this.converter = converter;
        this._bubbles = bubbles !== undefined ? bubbles : true;
        this._cancelable = cancelable !== undefined ? cancelable : true;
	}
	Class(ObservableProperty).extends(Property).def({
		/**
		 * Returns the current value of the property.
		 * @returns {*}
		 */
		'get': function() {
			DependencyTracker.read(this);
			return this._value;
		},

		/**
		 * Changes the value of the property.
		 *
		 * If a converter has been specified when creating this property, it will be run on the value before anything
		 * else happens.
		 *
		 * Notifies all listeners of the changed value.
		 *
		 * @param {*} value The new value of the property.
		 * @fires ObservableProperty#change
		 */
		'set': function(value) {
			var oldValue = this._value;
			if(this.converter) {
				value = this.converter.call(this._context, value);
			}
			if(oldValue !== value) { // only fire an event if the new value isn't the same as the old value
				this._value = value;
				this.notify({
                    value: value,
                    oldValue: oldValue,
                    source: this._context,
                    bubbles: this._bubbles,
                    cancelable: this._cancelable
                });
			}
		},

		/**
		 * Creates a bidirectional binding between this property and the given source property, meaning that if any one
		 * of them changes, the other will be modified accordingly.
		 * @param {module:jidejs/base/Property} source The other property.
		 * @param {{convertFrom:function, convertTo:function}} converter A converter used to convert between the
		 * 																 two property values.
		 * @returns {Binding} A disposable binding.
		 */
		bindBidirectional: function(source, converter) {
			return new Binding(source, this, Binding.BIDIRECTIONAL, converter);
		},

		/**
		 * Returns the value of this property after converting it to a string.
		 * @returns {*}
		 */
		toString: function() {
			return String(this.get());
		}
	});
	/**
	 * Useful helper function that creates a new observable property and an appropriate native property.
	 *
	 * @example
	 * function Person(name) {
	 * 	this.nameProperty = ObservableProperty.define(this, 'name', name);
	 * }
	 *
	 * var john = new Person('John Doe');
	 * console.log(john.name); // prints 'John Doe'
	 * john.name = 'Jane Doe'; // modifies the properties value and notifies all listeners
	 *
	 * @memberof module:jidejs/base/ObservableProperty
	 * @param {Object} self The object where the property should be defined on.
	 * @param {string} name The name of the property field for which get/set definitions should be generated
	 * @param {*} initialValue (Optional) The initial value of the property.
	 * @param {function} converter Modifies the property value before it is stored in the property.
	 * @returns {ObservableProperty}
	 */
	ObservableProperty.define = function(self, name, initialValue, converter, bubbles, cancelable) {
		var property = new ObservableProperty(self, name, initialValue, converter, bubbles, cancelable);
		Object.defineProperty(self, name, {
			get: function() {
				return property.get();
			},

			set: function(value) {
				property.set(value);
			}, enumerable: true, configurable: true
		});
		return property;
	};

	function createPropertyDescriptor(name) {
		return {
			get: function() {
				return this[name+'Property'].get();
			},

			set: function(value) {
				this[name+'Property'].set(value);
			},
			enumerable: true, configurable: true
		};
	}

	function createObservablePropertyDescriptor(instance, name, defaultValue, bubbles, cancelable) {
		return {
			value: new ObservableProperty(instance, name, defaultValue, undefined, bubbles, cancelable)
		};
	}

    function parsePropertyName(name) {
        var parts = name.split(':'),
            nameObj = {
                name: parts[0],
                'no-bubbling': false,
                'no-cancel': false
            };
        for(var i = 1, len = parts.length; i < len; i++) {
            nameObj[parts[i]] = true;
        }
        return nameObj;
    }

	ObservableProperty.install = function(proto) {
		if(_.isFunction(proto)) {
			proto = proto.prototype;
		}
		if(!proto.emit) {
			Class(proto).mixin(EventEmitter);
		}
		var descriptors = {}, values = {};
		var names = [];
		for(var i = 1, len = arguments.length; i < len; i++) {
			var name = parsePropertyName(arguments[i]);
			names[names.length] = name;
            name = name.name;
			var desc = _.getPropertyDescriptor(proto, name);
			if(desc !== null) {
				if(desc.value) {
					values[name] = desc.value;
				} else if(desc.get) {
					continue; // don't override predefined get/set methods
				}
			}
			descriptors[name] = createPropertyDescriptor(name);
		}
		Object.defineProperties(proto, descriptors);
		var installer = function(instance) {
			var descriptor = {};
			for(var i = 0, len = names.length; i < len; ++i) {
				var nameObj = names[i],
                    name = nameObj.name;
				descriptor[name+'Property'] = createObservablePropertyDescriptor(
                    instance, name, values[name],
                    !nameObj['no-bubbling'], !nameObj['no-cancel']
                );
			}
			Object.defineProperties(instance, descriptor);
		};
		installer.dispose = function(instance) {
			for(var i = 0, len = names.length; i < len; ++i) {
                var nameObj = names[i],
                    name = nameObj.name;
				instance[name+'Property'].dispose();
			}
		};
		return installer;
	};
	return ObservableProperty;
});