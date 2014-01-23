/**
 * The KeyMap is used to manage handling keyboard input on focused components.
 *
 * It takes care of cross browser compatibility and allows the define key combinations such as
 * `shift Spacebar` or `control char:a`.
 *
 * @module jidejs/ui/input/KeyMap
 */
define(['./../../base/Class', './KeyCombination'], function(Class, KeyCombination) {
	"use strict";
	var table = {
		32: 'Spacebar',
		13: 'Enter',
		9: 'Tab',
		27: 'Esc',
		8: 'Backspace',
		49: '1',
		50: '2',
		51: '3',
		52: '4',
		53: '5',
		54: '6',
		55: '7',
		56: '8',
		57: '9',
		48: '0',
		37: 'Left',
		38: 'Up',
		39: 'Right',
		40: 'Down',
		44: 'PrintScreen',
		45: 'Insert',
		46: 'Del',
		47: 'Help',
		36: 'Home',
		35: 'End',
		33: 'PageUp',
		34: 'PageDown',
		0x10: 'Shift',
		0x11: 'Control',
		0x12: 'Alt',
		0x13: 'Pause',
		0x6D: 'Subtract',
		0x6B: 'Add',
		0x6F: 'Divide'
	};
	var symbolKeys = {
		186: ';',
		187: '=',
		188: ',',
		189: '-',
		190: '.',
		191: '/',
		192: '`',
		219: '[',
		220: '\\',
		221: ']',
		222: "'"
	};
	for(var i = 112; i < 123; i++) table[i] = 'F'+(i-111);

	function eventToString(e) {
		return (e.altKey ? 'alt+' : '')
			+ (e.shiftKey ? 'shift+' : '')
			+ (e.ctrlKey ? 'ctrl+' : '')
			+ (e.metaKey ? 'meta+' : '')
			+ (e.key || e.char);
	}

	/**
	 * Creates a new KeyMap.
	 *
	 * @memberof module:jidejs/ui/input/KeyMap
	 * @param {object} context The owner of the KeyMap, i.e. the component it belongs to.
	 * @constructor
	 * @alias module:jidejs/ui/input/KeyMap
	 */
	function KeyMap(context) {
		this.key = null;
		this.context = context || null;
		this.event = null;
		this.combinations = {};
	}
	Class(KeyMap).def({
		/**
		 * Releases all resources held by this instance.
		 */
		dispose: function() {
			delete this.context;
			delete this.combinations;
		},
		onKeyDown: function(e) {
			this.event = e;
			if(e.key) {
				this.key = e.key;
				this.char = e.char;
				return this._handleEvent(e);
			} else {
				this.key = table[e.keyCode || e.which];
				this.char = '';
				if(this.key) {
					return this._handleEvent(e);
				}
			}
		},
		onKeyPress: function(e) {
			if(!this.event) return;
			if(e.which == null || e.which != 0 && e.charCode != 0) {
				if(e.keyCode != 32 && e.keyCode != 13 && e.keyCode != 9 && e.keyCode != 27 && e.keyCode != 8) {
					this.event = e;
					this.char = symbolKeys[e.keyCode] || String.fromCharCode(e.keyCode);
				} else {
					this.char = String.fromCharCode(e.keyCode);
				}
			}
			// at this point we're able to handle the event
			return this._handleEvent(e);
		},
		onKeyUp: function(e) {
			if(!this.event) return;
			return this._handleEvent(e);
		},

		_handleEvent: function(e) {
			var event = {
				ctrlKey: this.event.ctrlKey,
				shiftKey: this.event.shiftKey,
				altKey: this.event.altKey,
				metaKey: this.event.metaKey
			};
			event.char = this.char || '';
			if(this.key) {
				event.key = this.key;
			}
			var keys = this.combinations;
			event.handled = false;
			var hash = eventToString(event);
			var handler = this.combinations[hash];
			if(typeof handler !== 'undefined') {
				if(handler[0].match(event)) {
					event.handled = true;
					event.stopPropagation = function() {
						e.stopPropagation();
						this.handled = true;
					};
					event.preventDefault = function() {
						e.preventDefault();
						this.handled = true;
					};
					handler[1].call(this.context, event);
					if(event.handled) {
						e.stopPropagation();
						e.preventDefault();
					}
				}
			}
			// clean up
			this.event = null;
			this.char = null;
			return !event.handled;
		},

		/**
		 * Registers a new event handler for the given key combination.
		 * @param {string} combination The key combination that should trigger the event.
		 * @param {function} handler The event handler.
		 * @returns {{dispose: Function}}
		 */
		on: function(combination, handler) {
			var THIS = this;
			if(arguments.length === 1) {
				var map = combination, observers = [];
				Object.getOwnPropertyNames(map).forEach(function(combination) {
					observers.push(THIS.on(combination, map[combination]));
				});
				return {
					dispose: function() {
						for(var i = 0, len = observers.length; i < len; i++) {
							observers[i].dispose();
						}
						observers = [];
						return;
					}
				};
			}
			if(!(combination instanceof KeyCombination)) {
				combination = new KeyCombination(combination);
			}
			var hash = combination.toString();
			var handlers = this.combinations[hash];
			if(typeof handlers === 'undefined') {
				handlers = this.combinations[hash] = [combination, handler];
			} else {
				handlers.push(handler);
			}
			return {
				dispose: function() {
					var handlers = THIS.combinations[hash];
					if(handlers.length === 2 && handlers[1] === handler) {
						delete THIS.combinations[hash];
					} else {
						var index = handlers.indexOf(handler);
						if(index > 0) {
							handlers.splice(index, 1);
						}
					}
				}
			};
		}
	});
	return KeyMap;
});