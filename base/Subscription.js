/**
 * A subscription is returned by the {@link module:jidejs/base/EventEmitter} and by other observables when
 * you listen to their events.
 *
 * It can be used to unsubscribe from the event or to configure how often the event listener should be invoked.
 *
 * Unless you specifically invoke {@link module:jidejs/base/Subscription#bind} with a different context, the event listener will
 * be invoked in the context of the event emiiter that it belongs to.
 *
 * @module jidejs/base/Subscription
 */
define(['./Class'], function(Class) {
	"use strict";
	/**
	 * Creates a new Subscription.
	 *
     * @constructor
     * @alias module:jidejs/base/Subscription
     *
	 * @param {module:jidejs/base/EventEmitter} emitter The event emitter that this subscription belongs to.
	 * @param {String} event The event name.
	 * @param {Function} listener The event listener.
	 * @param {boolean} once When `true`, the subscription will be disposed after the first invocation of the event listener.
	 */
	var exports = function Subscription(emitter, event, listener, once) {
		this.emitter = emitter;
		this.event = event;
		this.listener = listener;
		this.disposed = false;
		this.once = once || false;
		this.context = emitter;
	};
	Class(exports).def(/** @lends module:jidejs/base/Subscription# */{
		/**
		 * When invoked, the subscription will be disposed after the next invocation of the event listener.
		 * @returns {module:jidejs/base/Subscription}
		 */
		onlyOnce: function() {
			this.once = true;
			return this;
		},

		/**
		 * Changes the execution context for the event listener.
		 * @param context
		 * @returns {module:jidejs/base/Subscription}
		 */
		bind: function(context) {
			this.context = context;
			return this;
		},

		/**
		 * Releases all resources held by this subscription and removes if from the event emitter.
		 */
		dispose: function() {
			if(!this.disposed) {
				this.emitter.removeListener(this.event, this.listener);
				this.disposed = true;
			}
			this.emitter = null;
			this.event = null;
			this.listener = null;
			this.context = null;
		},

		notify: function(args) {
			if(this.disposed) return;
			this.listener.apply(this.context, args);
			if(this.once) this.dispose();
		}
	});
	return exports;
});