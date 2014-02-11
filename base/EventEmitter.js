/**
 * An EventEmitter allows to emit and listen to events.
 *
 * Every object that has at least one {@link module:jidejs/base/Property} must mixin the EventEmitter in order to support
 * sending change events. Every {@link module:jidejs/base/Observable} is also an EventEmitter and can be used as such.
 *
 * Other prominent uses of EventEmitter throughout a typical `jide.js` application include the
 * {@link module:jidejs/base/Collection}-API and every {@link module:jidejs/ui/Component}.
 *
 * However, its use is not limited to individual components. Instead, in medium and large applications, it can be beneficial
 * to use an EventEmitter as a central "EventBus" that allows loosly coupled modules to communicate with each other.
 *
 * @module jidejs/base/EventEmitter
 */
define([
	'./Class', './Util', './Disposer', './Subscription'
], function(Class, _, Disposer, Subscription) {
	"use strict";

	var $listeners = '_jidejs/base/EventEmitter$listeners';
	function ensureInitialized(emitter) {
		if(!($listeners in emitter)) {
			_.privateProperty(emitter, $listeners, {});
		}
	}

	/**
	 * When invoked with the **new** keyword, creates a new instance of EventEmitter.
	 *
	 * Note that it is not necessary to call the constructor when you want to mixin EventEmitter into another class.
	 * @memberof module:jidejs/base/EventEmitter
	 * @constructor
	 * @alias module:jidejs/base/EventEmitter
	 */
	function EventEmitter() {
		ensureInitialized(this);
	}
	Class(EventEmitter).def({
		/**
		 * Adds an event listener to the event specified as _name_.
		 *
		 * As an alternative to the simple signature of _on(name, handler)_ there is also an overloading which supports
		 * the addition of multiple event handlers at once by passing a single object instead of two parameters.
		 *
		 * When the object variant is used, the returned disposable object will remove _all_ event handlers upon disposal
		 * but it will not implement the {@link module:jidejs/base/Subscription} API.
		 *
		 * @example
		 * // basic
		 * person.on('hungry', hungryHandler);
		 * person.on('moneySpend', moneySpendHandler);
		 *
		 * // advanced
		 * person.on({
		 * 	hungry: hungryHandler,
		 * 	moneySpend: moneySpendHandler
		 * });
		 *
		 * @param {string} event The name of the event that the handler should react to.
		 * @param {function} listener The event handler that should be fired whenever the event occurs.
		 * @returns {module:jidejs/base/Subscription}|{{dispose:function}}
		 */
		on: function(event, listener) {
			ensureInitialized(this);
			if(arguments.length === 2) {
				var listeners = this[$listeners][event];
				if(!Array.isArray(listeners)) {
					listeners = [];
					this[$listeners][event] = listeners;
				}
				if(this[$listeners].newListener) this.emit('newListener', event, listener);
				var subscription = new Subscription(this, event, listener);
				listeners[listeners.length] = subscription;
				return subscription;
			} else {
				var events = Object.getOwnPropertyNames(event);
				var disposer = new Disposer();
				for(var i = 0, len = events.length; i < len; ++i) {
					var eventName = events[i];
					disposer.add(this.on(eventName, event[eventName]));
				}
				return disposer;
			}
		},

		/**
		 * Registers an event listener that is executed exactly once and removed immediately after its execution.
		 * @param {string} event The event name
		 * @param {Function} listener The event listener.
		 * @returns {module:jidejs/base/Subscription}
		 */
		once: function(event, listener) {
			var handler = this.on(event, listener);
			handler.once = true;
			return handler;
		},

		/**
		 * Removes all currently registered listeners from the given event.
		 * @param {String} event The event name.
		 */
		removeAllListeners: function(event) {
			ensureInitialized(this);
			var listeners = this[$listeners][event];
			if(Array.isArray(listeners)) {
				this[$listeners][event] = null;
				for(var i = 0, len = listeners.length; i < len; ++i) {
					var listener = listeners[i];
					listener.dispose();
					this.emit('removeListener', event, listener);
				}
			}
		},

		/**
		 * Removes an event handler from the event listeners.
		 * @param {string} event The event name.
		 * @param {function} listener The function that should no longer be executed when the event is dispatched.
		 * @returns {boolean}
		 */
		removeListener: function(event, listener) {
			ensureInitialized(this);
			var listeners = this[$listeners][event];
			if(Array.isArray(listeners)) {
				for(var i = 0, len = listeners.length; i < len; ++i) {
					if(listeners[i].listener === listener) {
						var subscription = listeners.splice(i, 1)[0];
						if(!subscription.disposed) {
							subscription.disposed = true;
							subscription.dispose();
						}
						this.emit('removeListener', event, listener);
						return true;
					}
				}
			}
			return false;
		},

		/**
		 * Returns all event listeners that are currently registered for the given event.
		 * @param {String} event The event name.
		 * @returns {Array<Function>}
		 */
		listeners: function(event) {
			ensureInitialized(this);
			var listeners = this[$listeners][event];
			if(Array.isArray(listeners)) {
				return listeners.map(function(subscription) {
					return subscription.listener;
				});
			} else {
				return [];
			}
		},

		/**
		 * Emits the specified event. Every argument passed to this method other than the event name will be provided
		 * to the event listeners that are registered to that event.
		 * After the event has been emitted, it will also emit the `all` event.
		 * @param {string} event The event name
		 * @param {...*} args The arguments
		 */
		emit: function(event, args) {
			ensureInitialized(this);
			var listeners = this[$listeners][event];
			if(Array.isArray(listeners)) {
				listeners = listeners.slice();
				var params = arguments.length === 2 ? [args] : _.asArray(arguments).slice(1);
				for(var i = 0, len = listeners.length; i < len; ++i) {
					listeners[i].notify(params);
				}
			}
			if(event !== 'all' && this[$listeners].all) {
				this.emit.apply(this, ['all'].concat(arguments));
			}
		},

		setMaxListeners: function(n) { /* not implemented yet */ },

		/**
		 * Removes all links to the listeners and disposes all properties that end with 'Property' (i.e. 'nameProperty')
		 * to make them and their listeners available for garbage collection.
		 */
		dispose: function() {
			var listeners = this[$listeners];
			if(listeners) {
				var events = Object.getOwnPropertyNames(listeners);
				for(var i = 0, len = events.length; i < len; ++i) {
					this.removeAllListeners(events[i]);
				}
			}
		}
	});
	EventEmitter.prototype.addEventListener = EventEmitter.prototype.on;
	/**
	 * Returns the number of listeners currently registered for the given event.
	 * @memberof module:jidejs/base/EventEmitter
	 * @param {module:jidejs/base/EventEmitter} emitter The EventEmitter
	 * @param {string} event The event name.
	 * @returns {number}
	 */
	EventEmitter.listenerCount = function(emitter, event) {
		ensureInitialized(emitter);
		var listeners = emitter[$listeners][event];
		return Array.isArray(listeners) ? listeners.length : 0;
	};

	return EventEmitter;
});