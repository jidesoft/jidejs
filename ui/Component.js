/**
 * The Component is the base for all of jide.js components, including controls such as the
 * {@link module:jidejs/ui/control/Button} and layout pane such as {@link module:jidejs/ui/layout/BorderPane}.
 *
 * @module jidejs/ui/Component
 */
define([
	'./../base/Class', './../base/ObservableProperty', './../base/EventEmitter', './util/ClassList',
	'./geom/Insets', './../base/DOM', './../base/Util', './input/KeyMap', './../base/has',
	'./Style', './../base/ObservableMap', './../base/Observable', './register'
], function(Class, Observable, EventEmitter, ClassList, Insets, DOM, _, KeyMap, has, Style, ObservableMap, Var, register) {
	//region Utilities
	function setBackground(event) {
		this.style.set('background', event.value).update();
		event.stopPropagation();
		return event.value;
	}

	function setBounds(event) {
		var bounds = event.value;
		this.style.set('left', bounds.x+'px')
			.set('top', bounds.y+'px')
			.set('width', bounds.width+'px')
			.set('height', bounds.height+'px')
			.update();
		event.stopPropagation();
		return bounds;
	}

	function setMargin(event) {
		var margin = event.value;
		var value = margin.toString();
		if(value !== '0px 0px 0px 0px') {
			this.style.set('margin', value).update();
		}
		event.stopPropagation();
		return margin;
	}

	function setBorder(event) {
		var border = event.value;
		this.style.set('border', border);
		event.stopPropagation();
		return border;
	}

	function setId(event) {
		var id = event.value;
		this.element.id = id;
		event.stopPropagation();
		return id;
	}

	function domEventHandler(name, component) {
		return function(e) {
			EventEmitter.prototype.emit.call(component, name, e);
		};
	}

	var eventAlias = {
		// check what name we need to use for the mouse wheel event
		'wheel': !('onwheel' in document.createElement('div')) ? document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll' : 'wheel'
	};

	//endregion

	/**
	 * Creates a new component.
	 *
	 * @memberof module:jidejs/ui/Component
	 * @param {Element} element The HTML DOM Element that is managed by this component.
	 * @constructor
	 * @alias module:jidejs/ui/Component
	 */
	function Component(element) {
		this.element = element;
		DOM.getData(this.element).component = this;
		installer(this);
		this.widthProperty.subscribe(function(event) {
			var width = event.value;
			this.style.set('width', _.isNumber(width) ? width+'px' : width).update();
			event.stopPropagation();
		}, this);
		this.heightProperty.subscribe(function(event) {
			var height = event.value;
			this.style.set('height', _.isNumber(height) ? height+'px' : height).update();
			event.stopPropagation();
		}, this);
		this.idProperty.subscribe(setId.bind(this));
		this.backgroundProperty.subscribe(setBackground.bind(this));
		this.boundsProperty.subscribe(setBounds.bind(this));
		this.marginProperty.subscribe(setMargin.bind(this));
		this.borderProperty.subscribe(setBorder.bind(this));
		this.classList = new ClassList(element);
		this.style = new Style(element);
		this.attributes = new ObservableMap(this);
		this.margin = new Insets(0);
		this.classList.add('jide-component');
		this.on('focus', function() {
			this.focused = true;
		});
		this.on('blur', function() {
			this.focused = false;
		});
	}

	Class(Component).mixin(EventEmitter).def({
		/**
		 * The HTML DOM Element managed by this component.
		 * @type Element
		 */
		element: null,
		/**
		 * The background color of the component as a CSS definition.
		 * @type string
		 */
		background: '',
		/**
		 * The background color property.
		 * @type module:jidejs/base/ObservableProperty
		 */
		backgroundProperty: null,
		bounds: null,
		boundsProperty: null,
		/**
		 * `true`, if the component currently has the focus; `false` otherwise.
		 * @type boolean
		 * @readonly
		 */
		focused: false,
		/**
		 * `true`, if the component currently has the focus; `false` otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 * @readonly
		 */
		focusedProperty: null,
		/**
		 * The list of CSS classes that apply to this component.
		 * @type module:jidejs/ui/util/ClassList
		 */
		classList: null,
		/**
		 * The style of the component.
		 * @type module:jidejs/ui/Style
		 */
		style: null,
		/**
		 * The ID property of the component. Can be used for CSS styling.
		 * @string
		 */
		id: null,
		/**
		 * The ID property of the component. Can be used for CSS Styling.
		 * @type module:jidejs/base/ObservableProperty
		 */
		idProperty: null,
		margin: null,
		marginProperty: null,
		border: null,
		borderProperty: null,

		/**
		 * Sets the size of the component.
		 * @param {object} value The size object.
		 * @param {number} value.width The width of the object.
		 * @param {number} value.height The height of the object.
		 */
		set size(value) {
			this.style.set('width', value.width+'px')
				.set('height', value.height+'px')
				.update();
			this.width = value.width;
			this.height = value.height;
		},

		/**
		 * The `tabIndex` defines the offset of the component in the focus order when the user changes
		 * the focus by using the `tab` key.
		 *
		 * A value of `-1` doesn't allow the user to focus the component using the `tab` key but allows the component to
		 * still receive focus from clicking or from API interaction.
		 *
		 * @param {number} value The offset of the component in the focus order.
		 */
		set tabIndex(value) {
			this.element.tabIndex = value;
		},

		get tabIndex() {
			return this.element.tabIndex;
		},

		/**
		 * Forces the component to request the focus.
		 */
		focus: function() {
			this.element.focus();
		},

		/**
		 * Forces the component to release the focus if it has it currently.
		 */
		blur: function() {
			this.element.blur();
		},

		/**
		 * The {@link module:jidejs/ui/input/KeyMap} is used to add handling for keyboard events to the component
		 * when it has focus.
		 * @returns {module:jidejs/ui/input/KeyMap}
		 */
		get keyMap() {
			if(!this._keyMap) {
				var map = this._keyMap = new KeyMap(this);
				var e = this.element;
				e.addEventListener('keydown', map.onKeyDown.bind(map), false);
				e.addEventListener('keypress', map.onKeyPress.bind(map), false);
				e.addEventListener('keyup', map.onKeyUp.bind(map), false);
				return map;
			}
			return this._keyMap;
		},

		/**
		 * Registers a handler for the given event to the component. Can be used to listen to any native HTML events,
		 * like `click` or `mouseout`.
		 * @param {string} name The name of the event
		 * @param {function} handler The event handler
		 * @returns {{dispose:function}} An Disposable that can be used to remove the handler from the event.
		 */
		on: function(name, handler) {
			if(name === 'key') {
				return this.keyMap.on(handler);
			}
			if(!handler && name.key) {
				this.keyMap.on(name.key);
				delete name.key;
			}
			var observer = arguments.length === 2
				? EventEmitter.prototype.on.call(this, name, handler)
				: EventEmitter.prototype.on.call(this, name);
			var names;
			if(arguments.length == 2) {
				names = [name];
			} else {
				names = Object.getOwnPropertyNames(name);
			}

			for(var i = 0, len = names.length; i < len; i++) {
				name = names[i];
				name = eventAlias[name] || name;
				var data = DOM.getData(this.element);
				if(!data.domHandler) data.domHandler = {};
				if(!data.domHandler[name]) {
					var domHandler = data.domHandler[name] = domEventHandler(name, this);
					this.element.addEventListener(name, domHandler, false);
				}
			}
			return observer;
		},

		emit: function(name, eventData) {
			if(!this.element || arguments.length > 2) {
				EventEmitter.prototype.emit.apply(this, arguments);
			} else {
                if(eventData && ('bubbles' in eventData) && !eventData.bubbles) {
                    if(EventEmitter.listenerCount(this, name) === 0) return;
                    EventEmitter.prototype.emit.call(this, name, eventData);
                    return;
                }
				var event = document.createEvent('Event'),
                    data = eventData || {};
				event.initEvent(name, 'bubbles' in data ? data.bubbles : true, 'cancelable' in data ? data.cancelable : true);
				delete data.bubbles;
				delete data.cancelable;
				event.source = this;
				for (var z in data) event[z] = data[z];
				this.element.dispatchEvent(event);
			}
		},

		/**
		 * Removes the given `handler` from the event.
		 * @param {string} name The name of the event.
		 * @param {function} handler The event handler function.
		 */
		removeEventListener: function(name, handler) {
			EventEmitter.prototype.removeEventListener.call(this, name, handler);
			if(EventEmitter.listenerCount(this, name) == 0) {
				var data = DOM.getData(this.element);
				if(data.domHandler && data.domHandler[name]) {
					var domHandler = data.domHandler[name];
					delete data.domHandler[name];
					this.element.removeEventListener(name, domHandler, false);
				}
			}
		},

		/**
		 * Calculates the size of the component regardless of its current visibility.
		 * @returns {{width:number, height:number}}
		 */
		measure: function() {
			return DOM.measure(this.element);
		},

		/**
		 * This method must be called whenever a component is permanently removed
		 * from the component tree.
		 *
		 * If the component still has a parent component, it will try to remove the component
		 * from its parent.
		 *
		 * The HTML element used to represent this component is also removed from the DOM.
		 *
		 * Once this method has been called, the component is left in a state in which it can't be used
		 * anymore. <strong>Do not call any method after invoking {@link #dispose}.</strong>
		 */
		dispose: function() {
			if(this._keyMap) {
				this._keyMap.dispose();
				delete this._keyMap;
			}
			var e = this.element;
			if(e) {
				var data = DOM.getData(e);
				// remove dom handlers
				if(data && data.domHandler) {
					var handlers = data.domHandler;
					var names = Object.getOwnPropertyNames(handlers);
					for(var i = 0, len = names.length; i < len; i++) {
						var name = names[i];
						e.removeEventListener(name, handlers[name], false);
					}
				}
			}
			// dispose of all observable properties
			EventEmitter.prototype.dispose.call(this);
			installer.dispose(this);
			// remove custom properties
			if(this.attributes && this.attributes.dispose) {
				this.attributes.dispose();
				this.attributes = null;
			}
			// remove element/component from parents
			if(this.parent) {
				var parent = this.parent;
				if(parent.removeChild) {
					parent.removeChild(this);
				} else if(parent.children && parent.children.remove) {
					parent.children.remove(this);
				}
				// remove link to parent
				delete this.parent;
			}
			// in case the element still has a parent node
			if(e) {
				if(e.parentNode) {
					e.parentNode.removeChild(e);
				}
				// remove data (link to component from the element)
				DOM.removeData(e);
			}
			// remove link from component to element
			delete this.element;
		}
	});
	var installer = Observable.install(Component, 'background', 'id', 'focused', 'bounds', 'margin', 'border', 'width', 'height');

	/**
	 * Retrieves the component that belongs to the DOM Element.
	 * @memberof module:jidejs/ui/Component
	 * @param {Element} e The HTML DOM Element.
	 * @returns {module:jidejs/ui/Component}
	 */
	Component.fromElement = function(e) {
		return DOM.getData(e).component;
	};

	/**
	 * Finds the component that the element that triggered the event belongs to.
	 * @memberof module:jidejs/ui/Component
	 * @param {Event} e The native browser Event.
	 * @param {Element} searchEnd The element at which the search should stop.
	 * @returns {module:jidejs/ui/Component} The component that triggered the event or `null`, if no component could be found.
	 */
	Component.fromEvent = function(e, searchEnd) {
		var element = e.target,
			component = null;
		while((!DOM.hasData(element) || !(component = Component.fromElement(element))) && element != searchEnd) {
			element = element.parentNode;
		}
		return component || null;
	};

	/**
	 * Applies the given configuration to the `target` component.
	 *
	 * There are some special names that allow you to apply a more specific configuration.
	 * It can also be used to override methods and properties of the component.
	 *
	 * @example
	 * Component.applyConfiguration(myComponent, {
	 * 	on: { // directly add event handlers
	 * 		click: myClickHandler,
	 * 		keyMap: { // add key event handlers
	 * 			'enter': myEnterHandler
	 * 		}
	 * 	},
	 * 	classList: ['my-special-class'], // specify classes that should be added to the class list of the component
	 * 	style: { // add style properties to the component
	 * 		border: '1px solid red'
	 * 	},
	 * 	'BorderPane.region': 'center' // set an attached property
	 * });
	 *
	 * @param {module:jidejs/ui/Component} target The component that should be configured.
	 * @param {object} source The configuration object.
	 */
	Component.applyConfiguration = function(target, source) {
		if(typeof source === 'undefined' || source === null) return;
		Object.getOwnPropertyNames(source).forEach(function(name) {
			if(name === 'on') {
				target.on(source.on);
			} else if(name === 'children') {
				if(target.children) {
					target.children.addAll(source.children);
				}
				if(target.add) {
					target.add.apply(target, source.children);
				}
			} else if(name === 'classList') {
				var classList = target.classList;
				var classes = source.classList;
				for(var i = 0; i < classes.length; i++) {
					var clazz = classes[i];
					classList.add(clazz);
				}
			} else if(name === 'style') {
				var styles = source.style;
				var style = target.style;
				for(var propName in styles) {
					if(styles.hasOwnProperty(propName)) {
						style.set(propName, styles[propName]);
					}
				}
				style.update();
			} else if(name !== 'element') {
				if(name.match(/^(?:(?:Border|Anchor|Grid|Stack|Tile)Pane|[HV]Box)\./)) {
					target.attributes.set('jidejs/ui/layout/'+name, source[name]);
				} else if(name.match(/^on/)) {
					target.on(name.substr(2), source[name]);
				} else {
					var desc = Object.getOwnPropertyDescriptor(source, name);
					if(desc.get || desc.set) {
						Object.defineProperty(target, name, desc);
					} else if(Var.is(source[name]) && (name+'Property') in target) {
                        if(source[name].writable) {
                            target[name+'Property'].bindBidirectional(source[name]);
                        } else {
						    target[name+'Property'].bind(source[name]);
                        }
					} else {
						target[name] = Var.unwrap(source[name]);
					}
				}
			}
		});
	};

	register('jide-component', Component, null, [], ['on', 'emit', 'measure', 'dispose']);

	return Component;
});