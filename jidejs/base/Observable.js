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
define('jidejs/base/Observable', [
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/EventEmitter', 'jidejs/base/Binding',
	'jidejs/base/DependencyTracker', 'jidejs/base/Bindings'
], function(Class, _, EventEmitter, Binding, DependencyTracker, Bindings) {
	"use strict";
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
	Observable.unbox = Observable.unwrap = function(obj) {
		return Observable.is(obj) ? obj.get() : obj;
	};

	return Observable;
});