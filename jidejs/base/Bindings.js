/**
 * This module contains commonly used calculated {@link module:jidejs/base/Property} bindings.
 *
 * It can be used to create conditional properties whose value changes when a boolean {@link module:jidejs/base/Property}
 * changes, or to retrieve the length of a list, the value of two combined number properties and so on.
 *
 * @module jidejs/base/Bindings
 * @requires module:jidejs/base/DependencyProperty
 */
define('jidejs/base/Bindings', [
	'jidejs/base/Util'
], function(_) {
	function unpack(value) {
		return isObservable(value)
			? value.get()
			: value;
	}

	function isObservable(p) {
		return _.isObject(p) && ('get' in p) && ('notify' in p) && ('bind' in p) && ('subscribe' in p);
	}

	function opProperty(op1, op2, fn) {
		var ob = require('jidejs/base/Observable');
		return ob.computed(fn);
	}

	function reducedProperty(args, fn) {
		var ob = require('jidejs/base/Observable');
		var prop = ob.computed(function() {
			return args.map(unpack).reduce(fn);
		});
		return prop;
	}

	return {
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
		 * var motorControlLightColorProperty = require('jidejs/base/Bindings')
		 * 		.when(car.isMotorRunningProperty)
		 * 			.then('red')
		 * 			.otherwise('blue');
		 *
		 * @param {jidejs/base/Observable} condition A property whose value is either truthy or falsy.
		 * @returns {{then: Function}} The conditional property builder.
		 */
		when: function(condition) {
			condition = condition || this;
			return {
				/**
				 * Specifies the value that should be used when the condition is truthy.
				 * @param {*} then The value or property that should be returned when the condition evaluates to true.
				 * @returns {{otherwise: Function}} The conditional property builder.
				 */
				then: function(then) {
					return {
						/**
						 * Specifies the value that should be used when the condition is falsy.
						 * @param {*} otherwise The value that should be used when the condition is falsy.
						 * @returns {Observable} The generated conditional property.
						 */
						otherwise: function(otherwise) {
							var ob = require('jidejs/base/Observable');
							return ob.computed(function() {
								return !!condition.get()
									? unpack(then)
									: unpack(otherwise);
							});
						}
					}
				}
			}
		},

		/**
		 * Expects a list of {@link module:jidejs/base/Property number properties} or numbers and returns
		 * a {@link module:jidejs/base/Property} that consists of their total sum.
		 *
		 * @param {...jidejs/base/Property|number} numbers
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		add: function(numbers) {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			return reducedProperty(args, function(a, b) {
				return a+b;
			});
		},

		/**
		 * Returns a new observable property whose value is the result of subtracting all given properties.
		 * @param {...jidejs/base/Property|number} numbers
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		subtract: function() {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			return reducedProperty(args, function(a, b) {
				return a-b;
			});
		},

		/**
		 * Returns a new observable property whose value is the result of the multiplication of all given properties.
		 * @param {...jidejs/base/Property|*} values
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		multiply: function() {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			return reducedProperty(args, function(a, b) {
				return a*b;
			});
		},

		/**
		 * Returns a new observable property whose value is the result of a logical `and` of all given properties.
		 * As with Javascript in general, this means that if all values are truthy, the value of the new property
		 * will be the value of the last given property.
		 *
		 * @example
		 * var first = Observable(true), second = Observable(true), third = Observable({ msg: 'Hello World' });
		 * var cond = Bindings.and(first, second, third);
		 * console.log(cond.get().msg); // => 'Hello World'
		 * @param {...jidejs/base/Property|*} values
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		and: function() {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			return reducedProperty(args, function(a, b) {
				return a && b;
			});
		},

		/**
		 * Returns a new property whose value is the result of a logical `or` of all given properties.
		 * @param {...jidejs/base/Property|*} values
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		or: function() {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			return reducedProperty(args, function(a, b) {
				return a || b;
			});
		},

		/**
		 * Creates a {@link module:jidejs/base/Property} whose value is the item of the given
		 * {@link module:jidejs/base/ObservableList} or {@link module:jidejs/base/ObservableMap} and updates whenever
		 * the item stored at the given index is modified.
		 *
		 * @param {jidejs/base/ObservableList|jidejs/base/ObservableMap} listOrMap The list or map where the item is stored
		 * @param {number|string} index The index of the item in the list or map.
		 * @returns {jidejs/base/Property}
		 */
		valueAt: function(listOrMap, index) {
			var ob = require('jidejs/base/Observable');
			var prop = ob.computed(function() {
				return listOrMap.get(index);
			});
			var handler;
			if(listOrMap instanceof require('jidejs/base/Collection')) {
				handler = listOrMap.on('change', function(evt) {
					var changes = evt.enumerator();
					while(changes.moveNext()) {
						var change = changes.current;
						if(change.isUpdate && change.index === index || change.index <= index) {
							prop.invalidate();
							break;
						}
					}
				});
			} else {
				handler = listOrMap.on(index, function() {
					prop.invalidate();
				});
			}
			var dispose = prop.dispose;
			prop.dispose = function() {
				handler.dispose();
				dispose.call(prop);
			};
			return prop;
		},

		/**
		 * Returns a new property whose value is the result of concatenating all given properties.
		 * This operation performs only string concatenations.
		 * @param {...jidejs/base/Property|String} values
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		concat: function() {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			var ob = require('jidejs/base/Observable');
			return ob.computed(function() {
				return args.map(unpack).join('');
			});
		},

		/**
		 * Returns a new property whose value is the result of applying `fn` to the value of `property`.
		 * @param {...jidejs/base/Property|*} property
		 * @param {Function} fn The function that is applied to the value of `property`.
		 * @returns {module:jidejs/base/DependencyProperty} The generated property
		 */
		map: function(property, fn) {
			if(!fn) {
				fn = property;
				property = this;
			}
			var ob = require('jidejs/base/Observable');
			return ob.computed(function() {
				return fn(unpack(property));
			});
		},

		tag: function(tag, property) {
			property || (property = this);
			var ob = require('jidejs/base/Observable');
			return ob.computed(function() {
				return "<"+tag+">"+unpack(property)+"</"+tag+">";
			});
		},

		/**
		 * Returns a new property whose value is the result of the division of all given properties.
		 * @param {...module:jidejs/base/Observable|number} values
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		divide: function() {
			var args = _.asArray(arguments);
			if(isObservable(this)) args.unshift(this);
			return reducedProperty(args, function(a, b) {
				return a/b;
			});
		},

		/**
		 * Returns a new property whose value is `true`, if the value of `op1` is equal to `op2`; `false`, otherwise.
		 * @param {module:jidejs/base/Observable|*} op1 The first observable or value.
		 * @param {module:jidejs/base/Observable|*} op2 The second observable or value.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		equal: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return unpack(op1) === unpack(op2);
			});
		},

		/**
		 * Returns a new property whose value is `true`, if the value of `op1` is not equal to `op2`; `false`, otherwise.
		 * @param {module:jidejs/base/Observable|*} op1 The first observable or value.
		 * @param {module:jidejs/base/Observable|*} op2 The second observable or value.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		notEqual: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return unpack(op1) !== unpack(op2);
			});
		},

		/**
		 * Returns a new property whose value is `false`, if the value of the property
		 * is `falsy` (i.e. `undefined`, `null`, `false`, ...); `true`, otherwise.
		 * @param {module:jidejs/base/Observable} prop The property.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		not: function(prop) {
			var ob = require('jidejs/base/Observable');
			if(isObservable(this)) { prop = this; }
			return ob.computed(function() {
				return !prop.get();
			});
		},

		/**
		 * Returns a new property whose value is the bitwise negation of the value of the given property.
		 * @param {module:jidejs/base/Observable} prop The property.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		negate: function(prop) {
			var ob = require('jidejs/base/Observable');
			if(isObservable(this)) { prop = this; }
			return ob.computed(function() {
				return ~prop.get();
			});
		},

		convert: function(prop, converter) {
			var ob = require('jidejs/base/Observable');
			if(isObservable(this)) { prop = this; }
			if(isObservable(converter)) {
				return ob.computed(function() {
					return unpack(converter)(unpack(prop));
				});
			}
			return ob.computed(function() {
				return converter(unpack(prop));
			});
		},

		/**
		 * Returns a property whose value is `true`, if `op1` is greater than `op2`; `false`, otherwise.
		 * @param {module:jidejs/base/Observable} op1 The property that is assumed to be larger.
		 * @param {module:jidejs/base/Observable} op2 The property that is assumed to be smaller.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		greaterThan: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return unpack(op1) > unpack(op2);
			})
		},

		/**
		 * Returns a property whose value is `true`, if `op1` is greater than or equal to `op2`; `false`, otherwise.
		 * @param {module:jidejs/base/Observable} op1 The property that is assumed to be larger.
		 * @param {module:jidejs/base/Observable} op2 The property that is assumed to be smaller.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		greaterThanOrEqual: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return unpack(op1) >= unpack(op2);
			})
		},

		/**
		 * Returns a property whose value is `true`, if `op1` is smaller than `op2`; `false`, otherwise.
		 * @param {module:jidejs/base/Observable} op1 The property that is assumed to be smaller.
		 * @param {module:jidejs/base/Observable} op2 The property that is assumed to be larger.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		lessThan: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return unpack(op1) < unpack(op2);
			})
		},

		/**
		 * Returns a property whose value is `true`, if `op1` is smaller than or equal to `op2`; `false`, otherwise.
		 * @param {module:jidejs/base/Observable} op1 The property that is assumed to be smaller.
		 * @param {module:jidejs/base/Observable} op2 The property that is assumed to be larger.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		lessThanOrEqual: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return unpack(op1) <= unpack(op2);
			})
		},

		/**
		 * Returns a property whose value is the largest of the given properties.
		 * @param {module:jidejs/base/Observable|number} op1 The property.
		 * @param {module:jidejs/base/Observable|number} op2 The property.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		max: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return Math.max(unpack(op1), unpack(op2));
			});
		},

		/**
		 * Returns a property whose value is the smallest of the given properties.
		 * @param {module:jidejs/base/Observable} op1 The property.
		 * @param {module:jidejs/base/Observable} op2 The property.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		min: function(op1, op2) {
			if(isObservable(this)) { op2 = op1; op1 = this; }
			return opProperty(op1, op2, function() {
				return Math.min(unpack(op1), unpack(op2));
			});
		},

		/**
		 * Returns a new property whose value is the result of selecting a path of properties.
		 *
		 * @example
		 * var firstName = app.select('listProperty', 'selectionModelProperty', 'selectedItemProperty', 'nameProperty', 'firstNameProperty');
		 * // is equivalent to
		 * firstName = Observable.computed(function() {
		 *   return app.list.selectionModel.selectedItem.name.firstName;
		 * });
		 *
		 * @param {module:jidejs/base/Observable} context The root of the path.
		 * @param {...string} path The path to the destination property.
		 * @returns {module:jidejs/base/Observable} The generated property.
		 */
		select: function(context) {
			var path;
			if(isObservable(this)) {
				context = this;
				path = _.asArray(arguments);
			} else {
				path = _.asArray(arguments).slice(1);
			}
			var ob = require('jidejs/base/Observable');
			return ob.computed({
				read: function() {
					var value = context.get();
					for(var i = 0, len = path.length; value != null && i < len; i++) {
						value = value[path[i]];
						if(isObservable(value)) {
							value = value.get();
						}
					}
					return typeof value === 'undefined' ? null : value;
				},
				write: function(newValue) {
					var value = context.get();
					for(var i = 0, len = path.length; value != null && i < len; i++) {
						value = value[path[i]];
						if(i+1 < len && isObservable(value)) {
							value = value.get();
						}
					}
					if(isObservable(value) && value.set) {
						value.set(newValue);
					} else {
						throw new Error('Cannot set value');
					}
				}
			});
		}
	};
});