/**
 * An Observable is a value that can be changed and, when changed, notifies listeners that previously
 * subscribed to it.
 *
 * This module is an implementation used for local variables or parameters. If you would like to have observable properties
 * on an object, look at the {@link module:jidejs/base/ObservableProperty ObservableProperty}.
 *
 * @example
 * var x = Observable(2); // create an observable variable
 * var y = Observable.computed(function() { // and a computed variable that depends on x
 *	return x.get() * 2;
 * });
 * var z = Observable.computed(function() { // and a computed variable that depends on y
 * 	return y.get() * 2;
 * });
 * assertEquals(8, z.get()); // get initial value of z
 * x.set(4); // modify x
 * assertEquals(16, z.get()); // get new value of z
 *
 * @module jidejs/base/Observable
 */
define([
	'./Class', './Util', './EventEmitter', './Binding',
	'./DependencyTracker'
], function(Class, _, EventEmitter, Binding, DependencyTracker) {
    "use strict";

    function reducedProperty(args, fn) {
        var prop = Observable.computed(function() {
            return args.map(unpack).reduce(fn);
        });
        return prop;
    }
    
    var Bindings = /* @lends module:jidejs/base/Observable.prototype */ {
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
         * var motorControlLightColorProperty = myObservable
         * 		.when(car.isMotorRunningProperty)
         * 			.then('red')
         * 			.otherwise('blue');
         *
         * @memberof module:jidejs/base/Observable.prototype
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
                            
                            return Observable.computed(function() {
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
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|number} numbers
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        add: function(numbers) {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            return reducedProperty(args, function(a, b) {
                return a+b;
            });
        },

        /**
         * Returns a new Observable property whose value is the result of subtracting all given properties.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|number} numbers
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        subtract: function() {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            return reducedProperty(args, function(a, b) {
                return a-b;
            });
        },

        /**
         * Returns a new Observable property whose value is the result of the multiplication of all given properties.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|*} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        multiply: function() {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            return reducedProperty(args, function(a, b) {
                return a*b;
            });
        },

        /**
         * Returns a new Observable property whose value is the result of a logical `and` of all given properties.
         * As with Javascript in general, this means that if all values are truthy, the value of the new property
         * will be the value of the last given property.
         *
         * @example
         * var first = Observable(true), second = Observable(true), third = Observable({ msg: 'Hello World' });
         * var cond = Bindings.and(first, second, third);
         * console.log(cond.get().msg); // => 'Hello World'
         *
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|*} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        and: function() {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            return reducedProperty(args, function(a, b) {
                return a && b;
            });
        },

        /**
         * Returns a new property whose value is the result of a logical `or` of all given properties.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|*} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        or: function() {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            return reducedProperty(args, function(a, b) {
                return a || b;
            });
        },

        /**
         * Creates a {@link module:jidejs/base/Property} whose value is the item of the given
         * {@link module:jidejs/base/ObservableList} or {@link module:jidejs/base/ObservableMap} and updates whenever
         * the item stored at the given index is modified.
         *
         * @memberof module:jidejs/base/Observable.prototype
         * @param {jidejs/base/ObservableList|jidejs/base/ObservableMap} listOrMap The list or map where the item is stored
         * @param {number|string} index The index of the item in the list or map.
         * @returns {jidejs/base/Property}
         */
        valueAt: function(listOrMap, index) {
            
            var prop = Observable.computed(function() {
                return listOrMap.get(index);
            });
            var handler;
            if(listOrMap instanceof require('./Collection')) {
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
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|String} values
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        concat: function() {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            
            return Observable.computed(function() {
                return args.map(unpack).join('');
            });
        },

        /**
         * Returns a new property whose value is the result of applying `fn` to the value of `property`.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...jidejs/base/Property|*} property
         * @param {Function} fn The function that is applied to the value of `property`.
         * @returns {module:jidejs/base/DependencyProperty} The generated property
         */
        map: function(property, fn) {
            if(!fn) {
                fn = property;
                property = this;
            }
            
            return Observable.computed(function() {
                return fn(unpack(property));
            });
        },

        tag: function(tag, property) {
            property || (property = this);
            
            return Observable.computed(function() {
                return "<"+tag+">"+unpack(property)+"</"+tag+">";
            });
        },

        /**
         * Returns a new property whose value is the result of the division of all given properties.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {...module:jidejs/base/Observable|number} values
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        divide: function() {
            var args = _.asArray(arguments);
            if(Observable.is(this)) args.unshift(this);
            return reducedProperty(args, function(a, b) {
                return a/b;
            });
        },

        /**
         * Returns a new property whose value is `true`, if the value of `op1` is equal to `op2`; `false`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable|*} op1 The first Observable or value.
         * @param {module:jidejs/base/Observable|*} op2 The second Observable or value.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        equal: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return unpack(op1) === unpack(op2);
            });
        },

        /**
         * Returns a new property whose value is `true`, if the value of `op1` is not equal to `op2`; `false`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable|*} op1 The first Observable or value.
         * @param {module:jidejs/base/Observable|*} op2 The second Observable or value.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        notEqual: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return unpack(op1) !== unpack(op2);
            });
        },

        /**
         * Returns a new property whose value is `false`, if the value of the property
         * is `falsy` (i.e. `undefined`, `null`, `false`, ...); `true`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} prop The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        not: function(prop) {
            
            if(Observable.is(this)) { prop = this; }
            return Observable.computed(function() {
                return !prop.get();
            });
        },

        /**
         * Returns a new property whose value is the bitwise negation of the value of the given property.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} prop The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        negate: function(prop) {
            
            if(Observable.is(this)) { prop = this; }
            return Observable.computed(function() {
                return ~prop.get();
            });
        },

        convert: function(prop, converter) {
            
            if(Observable.is(this)) { prop = this; }
            if(Observable.is(converter)) {
                return Observable.computed(function() {
                    return unpack(converter)(unpack(prop));
                });
            }
            return Observable.computed(function() {
                return converter(unpack(prop));
            });
        },

        /**
         * Returns a property whose value is `true`, if `op1` is greater than `op2`; `false`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be larger.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be smaller.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        greaterThan: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return unpack(op1) > unpack(op2);
            })
        },

        /**
         * Returns a property whose value is `true`, if `op1` is greater than or equal to `op2`; `false`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be larger.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be smaller.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        greaterThanOrEqual: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return unpack(op1) >= unpack(op2);
            })
        },

        /**
         * Returns a property whose value is `true`, if `op1` is smaller than `op2`; `false`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be smaller.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be larger.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        lessThan: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return unpack(op1) < unpack(op2);
            })
        },

        /**
         * Returns a property whose value is `true`, if `op1` is smaller than or equal to `op2`; `false`, otherwise.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} op1 The property that is assumed to be smaller.
         * @param {module:jidejs/base/Observable} op2 The property that is assumed to be larger.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        lessThanOrEqual: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return unpack(op1) <= unpack(op2);
            })
        },

        /**
         * Returns a property whose value is the largest of the given properties.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable|number} op1 The property.
         * @param {module:jidejs/base/Observable|number} op2 The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        max: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
                return Math.max(unpack(op1), unpack(op2));
            });
        },

        /**
         * Returns a property whose value is the smallest of the given properties.
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} op1 The property.
         * @param {module:jidejs/base/Observable} op2 The property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        min: function(op1, op2) {
            if(Observable.is(this)) { op2 = op1; op1 = this; }
            return Observable.computed(function() {
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
         * @memberof module:jidejs/base/Observable.prototype
         * @param {module:jidejs/base/Observable} context The root of the path.
         * @param {...string} path The path to the destination property.
         * @returns {module:jidejs/base/Observable} The generated property.
         */
        select: function(context) {
            var path;
            if(Observable.is(this)) {
                context = this;
                path = _.asArray(arguments);
            } else {
                path = _.asArray(arguments).slice(1);
            }
            
            return Observable.computed({
                read: function() {
                    var value = context.get();
                    for(var i = 0, len = path.length; value != null && i < len; i++) {
                        value = value[path[i]];
                        if(Observable.is(value)) {
                            value = value.get();
                        }
                    }
                    return typeof value === 'undefined' ? null : value;
                },
                write: function(newValue) {
                    var value = context.get();
                    for(var i = 0, len = path.length; value != null && i < len; i++) {
                        value = value[path[i]];
                        if(i+1 < len && Observable.is(value)) {
                            value = value.get();
                        }
                    }
                    if(Observable.is(value) && value.set) {
                        value.set(newValue);
                    } else {
                        throw new Error('Cannot set value');
                    }
                }
            });
        }
    };
    
	/**
	 * Creates a new observable object. Can be invoked as a constructor or as a function.
	 * @memberof module:jidejs/base/Observable
	 * @param {*} value The initial value of the observable.
	 * @constructor
	 * @alias module:jidejs/base/Observable
	 */
	function Observable(value) {
		if(!(this instanceof Observable)) {
			return new Observable(value);
		}
		EventEmitter.call(this);
		this._value = value;
	}

	Class(Observable).mixin(EventEmitter, Bindings).def({
		/**
		 * Returns the current value of the Observable.
		 * @returns {*}
		 */
		get: function() {
			DependencyTracker.read(this);
			return this._value;
		},

		/**
		 * Sets the current value of the Observable to `value` and notifies listeners of the change.
		 * @param {*} value The new value.
		 * @fires #change
		 */
		set: function(value) {
			var oldValue = this._value;
			if(value !== oldValue) {
				this._value = value;
				this.notify({ value: value, oldValue: oldValue, source: this });
			}
		},

		/**
		 * Notifies listeners when the observable has changed.
		 */
		notify: function() {
			this.emit.apply(this, ['change'].concat(_.asArray(arguments)));
		},

		/**
		 * Adds a listener to the observable. It will be notified when the value of the observable has changed.
		 * @param {Function} listener The listener callback. Receives the new value and the old value as parameters.
		 * @returns {*}
		 */
		subscribe: function(listener) {
			return this.on('change', listener);
		},

		/**
		 * Removes a listener from the observable, it will no longer be notified when the value changes.
		 * @param listener
		 * @returns {*}
		 */
		unsubscribe: function(listener) {
			return this.removeListener(listener);
		},

		/**
		 * Binds this observable to the given _source_ observable, which means that the value of this observable
		 * is changed whenever the _source_ observables value changed.
		 *
		 * The value can be modified by providing a _converter_ function, which expects the original value of the
		 * _source_ property and converts it into an appropriate value for this property. The converter function will
		 * receive the actual value of the observable, not the observable itself.
		 *
		 * @example
		 * total.bind(netTotal, function(netTotal) {
		 * 	return netTotal * 1.19; // add VAT to price
		 * });
		 *
		 * @param {jidejs/base/Observable} source The source observable whose value should be copied to this observable
		 * @param {Function?} converter The converter function.
		 * @returns {Binding} The created binding between the two observables.
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
		 * Creates a binding from this observable to the _target_ observable, which means that the value of the _target_
		 * observable is updated whenever this observables value changes.
		 *
		 * The value can be modified by providing a _converter_ function, which expects the original value of the
		 * _source_ property and converts it into an appropriate value for this property. The converter function will
		 * receive the actual value of the property, not the property itself.
		 *
		 * @example
		 * netTotal.bind(total, function(netTotal) {
		 * 	return netTotal / 1.19; // remove VAT from total price
		 * });
		 *
		 * @param {jidejs/base/Observable} target The target observable whose value should be modified when this observable changes.
		 * @param {Function?} converter The converter function.
		 * @returns {Binding} The created binding between the two observables.
		 */
		bindToTarget: function(target, converter) {
			return new Binding(this, target, Binding.ONE_WAY, converter);
		}
	});

    Observable.Bindings = Bindings;

	function ComputedObservable(fn) {
		if(_.isFunction(fn)) {
			this.computeValue = fn;
			this.writeValue = null;
			this.lazy = true;
		} else {
			this.computeValue = fn.read;
			this.writeValue = fn.write;
			this.lazy = (typeof fn.lazy !== 'undefined') ? fn.lazy : true;
		}
		this._bindings = [];
		this._value = undefined;
	}
	Class(ComputedObservable).extends(Observable).def({
		set: function(value) {
			if(this.writeValue) {
				this._value = this.writeValue(value);
			} else {
				this.invalidate();
			}
		},

		get: function() {
            if(!this._bindings) return;
			if(this.invalid) {
				DependencyTracker.begin(this);
				this._value = this.computeValue();
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

        dispose: function() {
            if(!this._bindings) return;
            this._bindings.forEach(function(binding) { binding.dispose(); });
            this._bindings = null;
            EventEmitter.prototype.dispose.call(this);
        },

		invalid: true,

		invalidate: function() {
            if(!this._bindings) return;
			this.invalid = true;
			if(!this.lazy) {
				var oldValue = this._value;
				this.notify({ value: this.get(), oldValue: oldValue, source: this });
			} else {
				this.notify();
			}
		}
	});

	/**
	 * Creates a new computed observable.
	 *
	 * A computed observable whose value is dynamically computed when one of its dependencies changes.
	 * If no change occurs, it will return the previously calculated value.
	 *
	 * Besides the standard {@link module:jidejs/base/Observable} API, a computed observable also has an `invalidate` method
	 * that can be invoked to force its reevaluation.
	 *
	 * Computed observables don't send an updated value to their listeners since that'd require greedy computation. Instead,
	 * when a computed observable is invalidated, it will be reevaluted on the first read operation.
	 *
	 * @memberof module:jidejs/base/Observable
	 * @alias module:jidejs/base/Observable.computed
	 * @param {Function|Object} fn The function that calculates the value of the observable. Must return the new value.
	 * @returns {module:jidejs/base/Observable}
	 */
	Observable.computed = function(fn) {
		return new ComputedObservable(fn);
	};

	/**
	 * Returns `true`, if the given object implements the basic Observable contract; `false`, otherwise.
	 *
	 * An object is considered to be observable if it has certain properties that are used by `jide.js`.
	 *
	 * @memberof module:jidejs/base/Observable
	 * @param {Object} obj The possible Observable.
	 * @returns {boolean}
	 */
	Observable.is = function(obj) {
		return _.isObject(obj) && ('subscribe' in obj) && ('get' in obj) && ('notify' in obj) && ('bind' in obj);
	};

	/**
	 * Returns the value of the object, if it is an Observable, or the object itself, if it isn't.
	 * @param {*} obj The object that should be unboxed.
	 * @returns {*}
	 */
	var unpack = Observable.unbox = Observable.unwrap = function(obj) {
		return Observable.is(obj) ? obj.get() : obj;
	};

    /**
     * Returns a new (read-only) Observable whose value is modified when the given promise is resolved.
     *
     * @param {{then: Function}} promise The promise
     * @param {*?} initialValue The initial value of the Observable, defaults to `null`
     * @returns {module:jidejs/base/Observable}
     */
    Observable.fromPromise = function(promise, initialValue) {
        var value = arguments.length === 2 ? initialValue : null,
            observable = Observable.computed({
                lazy: false,
                read: function() {
                    return value;
                }
            });
        promise.then(function(result) {
            value = result;
            observable.invalidate();
        }, function(error) {
            value = error;
            observable.invalidate();
        });
        return observable;
    }

	return Observable;
});