/**
 * The Dispatcher is the central place for delaying the execution of actions and serves
 * as a replacement for the native <code>setTimeout</code> and <code>requestAnimationFrame</code> functions.
 *
 * As opposed to the native <code>setTimeout</code> function, the Dispatcher will try to invoke as many delayed actions
 * in one go as possible unless *50ms* have been used. This allows to run multiple short-timed actions in one go,
 * thereby reducing the overhead on the browser.
 *
 * It does the same for <code>requestAnimationFrame</code> but with a limit of *16ms*.
 *
 * @module jidejs/base/Dispatcher
 */
define('jidejs/base/Dispatcher', ['jidejs/base/DOM'], function(DOM) {
	// simple "setTimeout" backing store
	var store = [], ticking = false;

	function dispatch() {
		var start = +new Date();

		do {
			var worker = store.shift();
			typeof worker !== 'undefined' && worker();
		} while(store.length > 0 && (+new Date() - start < 50));

		if(store.length > 0) {
			setTimeout(dispatch, 25);
			ticking = true;
		} else {
			ticking = false;
		}
	}

	// "animation" backing store
	var animStore = [], animTicking = false;
	function dispatchAnimation(time) {
		var start = +new Date();
		var store = animStore.concat();
		do {
			var worker = store.shift();
			animStore.shift();
			typeof worker !== 'undefined' && worker(time);
		} while(store.length > 0 && (+new Date() - start < 16));

		if(animStore.length > 0) {
			DOM.requestAnimationFrame(dispatchAnimation);
			animTicking = true;
		} else {
			animTicking = false;
		}
	}

	var concat = Array.prototype.concat;
	/**
	 * @alias module: jidejs/base/Dispatcher
	 */
	return {
		/**
		 * The given callback is invoked as soon as possible after the current script has been executed.
		 *
		 * In browsers which support it, it will use the `setImmediate` API. If that is not available, it'll fall back
		 * to the next best implementation, ultimately resorting to {@link module:jidejs/base/Dispatcher#invokeLater}.
		 *
		 * Note that it is very well possible that the browser will not have time to render changes before control is provided
		 * to the given callback. This method is therefore not usable for animations or similar actions.
		 *
		 * @param {Function} callback The callback that should be invoked as soon as possible.
		 */
		nextTick: function(callback) {
			if(window.setImmediate) {
				setImmediate(callback);
			} else {
				this.invokeLater(callback);
			}
		},

		/**
		 * Invokes an action at a later time, giving the browser time to re-render the screen, process events and
		 * similar.
		 * @param {Function} callback The callback that should be invoked later.
		 * @param {Object|null} scope The scope that the callback should be invoked in.
		 * @returns {{dispatched: dispatched, abort: Function}} An object that can be used to abort the invocation of the
		 * 														callback.
		 */
		invokeLater:function(callback, scope) {
			var dispatched = false;
			var handler = function() {
				callback.apply(scope, concat.call(arguments));
				dispatched = true;
			};
			store.push(handler);
			if(!ticking) {
				setTimeout(dispatch, 25);
			}
			return {
				get dispatched() {
					return dispatched;
				},

				abort: function() {
					delete store[store.indexOf(handler)];
				}
			};
		},

		/**
		 * Invokes an action in the next animation frame of the browser.
		 * @param {Function} callback The callback that should be invoked later.
		 * @returns {{abort: Function}} An object that can be used to abort the invocation of the callback.
		 */
		requestAnimationFrame: function(callback) {
			animStore.push(callback);
			if(!animTicking) {
				DOM.requestAnimationFrame(dispatchAnimation);
			}
			return {
				abort: function() {
					delete animStore[animStore.indexOf(callback)];
				}
			};
		}
	};
});