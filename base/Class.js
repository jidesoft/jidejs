/**
 * Overview
 * ========
 *
 * This module helps to reduce the amount of boilerplate required to create class like structure
 * using constructor functions and prototypes.
 *
 * jide.js does not require the use of advanced class frameworks or specific object structures. However,
 * it does have a particular preference for prototype based, classical, inheritance that is used throughout
 * the toolkit. This module helps with the creation of these classes.
 *
 * For users of the toolkit, it is not required to use this module.
 *
 * The module `jidejs/base/Class` is a simple function which returns an object that can be used
 * to configure the prototype chain of the constructor function.
 *
 * Usage
 * =====
 *
 * To create a class, it is necessary to define its constructor function first. Afterwards its prototype
 * can be specified using standard Javascript syntax or using the `jidejs/base/Class` module
 * for easier usage.
 *
 * @example
 * define(['./Class'], function(Class) {
 *    // define the constructor function as usual
 *    function Person(name, age) {
 *        this.name = name;
 *        this.age = age;
 *    }
 *    // now use the jidejs/base/Class module to modify the prototype
 *    Class(Person).def({
 *        toString: function() {
 *            return "Hello, I'm "+this.name+" and I'm "+this.age+" years old.";
 *        }
 *    });
 *    // use the class like normal:
 *    var joe = new Person('Joe', 42);
 *    console.log(joe.toString());
 *
 *    // create a class that extends from the Person class
 *    function Employee(name, age, department) {
 *        // use the standard parent constructor invocation
 *        // jidejs/base/Class doesn't provide any
 *        Person.call(this, name, age);
 *    }
 * });
 * @module jidejs/base/Class
 */
define(['./Util'], function(_) {
	/**
     * Creates a new {@link ClassType} that can be used to configure the prototype of the given <code>constructor</code>.
     *
     * @constructor
	 * @alias module:jidejs/base/Class
     * @param {Function} target
     * @returns {{mixin: Function, def: Function, extends: Function}}
	 */
	var exports = function Class(target) {
		if(arguments.length > 1) {
			var constructor = target,
				parent, mixins, def, statics;
			for(var i = 1, len = arguments.length; i < len; i++) {
				var tmp = arguments[i];
				if(!parent && _.isFunction(tmp)) {
					parent = tmp;
				} else if(!mixins && Array.isArray(tmp)) {
					mixins = tmp;
				} else if(!def && _.isObject(tmp)) {
					def = tmp;
				} else if(!statics && _.isObject(tmp)) {
					statics = tmp;
				}
			}
			var c = Class(constructor);
			if(parent) c.extends(parent);
			if(mixins) {
				for(i = 0, len = mixins.length; i < len; i++) {
					c.mixin(mixins[i]);
				}
			}
			if(def) {
				c.def(def);
			}
			if(statics) {
				Object.getOwnPropertyNames(statics).forEach(function(name) {
					constructor[name] = statics[name];
				});
			}
			return constructor;
		}
		/**
		 * @alias ClassType
		 */
		return {
			/**
			 * Copies all properties of the given <code>mixin</code> objects to the prototype
			 * of the constructor function.
			 * @param {Object} mixin The object from which the properties should be copied.
			 * @returns {module:jidejs/base/Class}
			 */
			mixin: function(mixin) {
				var copyTarget = target;
				if(_.isFunction(copyTarget)) {
					copyTarget = target.prototype;
				}
				for(var i = 0, len = arguments.length; i < len; i++) {
					mixin = arguments[i];
					if(_.isFunction(mixin)) {
						mixin = mixin.prototype;
					}
					Object.getOwnPropertyNames(mixin).forEach(function(name) {
						if(!(name in copyTarget)) {
							var desc = Object.getOwnPropertyDescriptor(mixin, name);
							Object.defineProperty(copyTarget, name, desc);
						}
					});
				}
				return this;
			},

			/**
			 * Clones all methods, properties and members from the <code>prototypeDefinition</code>
			 * into the prototype of the constructor function.
			 *
			 * This method should be the invoked last since the other configuration methods might
			 * override any previous changes performed with this method.
			 *
			 * @param {Object} def The object from which the properties should be copied.
			 * @returns {module:jidejs/base/Class}
			 */
			def: function(def) {
				var copyTarget = target;
				if(_.isFunction(copyTarget)) {
					copyTarget = target.prototype;
				}
				Object.getOwnPropertyNames(def).forEach(function(name) {
					var desc = Object.getOwnPropertyDescriptor(def, name);
					desc.configurable = true;
					Object.defineProperty(copyTarget, name, desc);
				});
				return this;
			},

			/**
			 * <p>Resets the prototype of the constructor to the given <code>parentClass</code>,
			 * establishing an inheritance relationship between the two.</p>
			 * <p class="important">Since this method changes the prototype of the constructor function,
			 * it must be called before any other method is invoked. Otherwise it would override any
			 * other previously made changes.</p>
			 * @param {Object} base The parent class.
			 * @returns {jidejs/base/Class}
			 */
			extends: function(base) {
				target.prototype = Object.create(
					_.isFunction(base)
						? base.prototype
						: base
				);
				target.prototype.constructor = target;
				return this;
			}
		};
	};

	/**
	 * A static method that can be used to copy properties between objects.
	 * @param {Object} target The target object.
	 * @param {Object} mixin A number of object whose properties should be copied to target.
	 * @returns {Object} Returns the original object.
	 */
	exports.mixin = function(target, mixin) {
		var copyTarget = target;
		if(_.isFunction(target)) {
			copyTarget = target.prototype;
		}
		for(var i = 1, len = arguments.length; i < len; i++) {
			mixin = arguments[i];
			if(_.isFunction(mixin)) {
				mixin = mixin.prototype;
			}
			Object.getOwnPropertyNames(mixin).forEach(function(name) {
				if(!(name in copyTarget)) {
					var desc = Object.getOwnPropertyDescriptor(mixin, name);
					Object.defineProperty(copyTarget, name, desc);
				}
			});
		}
		return target;
	};

	return exports;
});