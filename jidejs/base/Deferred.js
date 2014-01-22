/**
 * This class allows a simpler, promise based, approach to asynchronous return values and serves
 * as an alternative to callback parameters.
 *
 * The use of a Deferred object allows a request to be resolved asynchronously and prevents the otherwise required
 * deep nesting that callback methods would force on the users of the API.
 *
 * Each Deferred has exactly one {@link Promise} which should be returned as the result of the action whose actual
 * result is resolved later.
 *
 * @module jidejs/base/Deferred
 */
define('jidejs/base/Deferred', [
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Dispatcher'
], function(Class, _, Dispatcher) {
	"use strict";

	//region Promise private API implementation
	function isPromise(x) {
		return x && _.isFunction(x.then);
	}

	var State = {
		Pending: 0,
		Fulfilled: 1,
		Rejected: 2
	};

	function Handler(onFulfilled, onRejected, promise) {
		this.onFulfilled = onFulfilled;
		this.onRejected = onRejected;
		this.promise = promise;
	}
	Handler.prototype.invoke = function(promise) {
		var result, fn;
		try {
			if(promise._state === State.Fulfilled && this.onFulfilled) {
				result = this.onFulfilled.call(null, promise._value);
				fn = fulfill;
			} else if(promise._state === State.Rejected && this.onRejected) {
				result = this.onRejected.call(null, promise._value);
				fn = fulfill;
			} else if(promise._state === State.Fulfilled && !this.onFulfilled) {
				result = promise._value;
				fn = fulfill;
			} else if(promise._state === State.Rejected && !this.onRejected) {
				result = promise._value;
				fn = reject;
			}
			if(isPromise(result)) {
				result.then(
					fulfill.bind(this.promise),
					reject.bind(this.promise));
			} else {
				fn(this.promise, result);
			}
		} catch(e) {
			reject(this.promise, e);
		}
	};

	function notify() {
		var handlers = this._handlers;
		for(var i = 0, len = handlers.length; i < len; i++) {
			handlers[i].invoke(this);
		}
		this._handlers.length = 0;
	}

	function fulfill(promise, value) {
		if(promise._state !== State.Pending) {
			throw new Error('Trying to fulfill a Promise that is not pending.');
		}
		promise._value = value;
		promise._state = State.Fulfilled;
        Dispatcher.nextTick(notify.bind(promise));
	}

	function reject(promise, value) {
		if(promise._state !== State.Pending) {
			throw new Error('Trying to reject a Promise that is not pending.');
		}
		promise._value = value;
		promise._state = State.Rejected;
        Dispatcher.nextTick(notify.bind(promise));
	}
	//endregion

	/**
	 * A Promise represents an asynchronously resolved value.
	 *
	 * It is said to be `fulfilled` when the resolution was successful and to be `rejected` when
	 * some error happened during the resolution and the promise could not be fulfilled.
	 *
	 * Promises can't be created, fulfilled or rejected directly. It is managed by a {@link module:jidejs/base/Deferred}
	 * which provides means to fulfill and reject the promise it manages.
	 *
	 * @memberof module:jidejs/base/Deferred
	 * @class
	 * @alias module:jidejs/base/Deferred.Promise
	 */
	function Promise() {
		this._state = State.Pending;
		this._value = undefined;
		this._handlers = [];
	}
	Class(Promise).def({
		/**
		 * The `onFulfilled` callback is invoked when this promise is fulfilled.
		 * The `onRejected` callback is invoked when this promise is rejected.
		 *
		 * Neither are called before this method returns in order to guarantee a
		 *
		 * @memberof module:jidejs/base/Deferred.Promise#
		 * @param {Function?} onFulfilled
		 * @param {Function?} onRejected
		 * @returns {Promise} A new promise that is fulfilled or rejected based on the return value of the given
		 * 		handlers and this promise.
		 */
		then: function(onFulfilled, onRejected) {
			var returnPromise = new Promise();
			this._handlers.push(new Handler(
				_.isFunction(onFulfilled) ? onFulfilled : undefined,
				_.isFunction(onRejected) ? onRejected : undefined,
				returnPromise));
			if(this._state !== State.Pending) {
				Dispatcher.nextTick(notify.bind(this));
			}
			return returnPromise;
		}
	});

	/**
	 * Creates a new Deferred.
	 *
	 * When working with Deferred, the actual Deferred instance should be kept private. Only its
	 * {@link module:jidejs/base/Deferred#promise} should be passed to the client.
	 *
	 * @memberof module:jidejs/base/Deferred
	 * @constructor
	 * @alias module:jidejs/base/Deferred
	 */
	function Deferred(value) {
		if(!(this instanceof Deferred)) return new Deferred(value);

		this.promise = new Promise();
		if(value) this.fulfill(value);
	}
	Class(Deferred).def({
		/**
		 * Fulfills the promise with the given value.
		 * @param {*} value The value of the promise.
		 */
		fulfill: function(value) {
			fulfill(this.promise, value);
		},

		/**
		 * Rejects the promise with the given reason.
		 * @param {*} reason The reason why the promise was rejected.
		 */
		reject: function(reason) {
			reject(this.promise, reason);
		}

		/**
		 * The Promise that belongs to this Deferred.
		 *
         * @memberof module:jidejs/base/Deferred.prototype
		 * @property {module:jidejs/base/Deferred.Promise} promise
		 */
	});

	return Deferred;
});