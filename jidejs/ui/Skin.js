/**
 * The `Skin` belongs to a {@link module:jidejs/ui/Control} and defines its look and feel.
 *
 * It should listen to changes in supported properties and handle changes to the underlying DOM as well as creating
 * the initial DOM structure.
 *
 * @module jidejs/ui/Skin
 */
define('jidejs/ui/Skin', [
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Window', 'jidejs/base/DOM', 'jidejs/base/has',
	'jidejs/ui/Template', 'jidejs/ui/bind'
], function(Class, _, Window, DOM, has, Template, bind) {
	var $bindings = 'jidejs/ui/Skin.bindings',
		tooltipHandler = 'jidejs/ui/Skin.tooltipHandler',
		contextMenuHandler = 'jidejs/ui/Skin.contextMenuHandler',
		TOOLTIP_SPACE = 10,
		BINDINGS = '$jidejs/ui/Skin.create#bindings',
		EVENT_BINDINGS = '$jidejs/ui/Skin.create#eventBindings',
		refPseudos = function(skin, template) {
			// parse template
			// 1: Get all pseudos and create a link to the skin
			var pseudos = template.querySelectorAll('[pseudo]');
			for(var i = 0, len = pseudos.length; i < len; i++) {
				var pseudo = pseudos[i],
					pseudoId = pseudo.getAttribute('pseudo');
				skin[pseudoId] = pseudo;
//				if(pseudo.hasChildNodes()) {
//					// does it have a template child?
//					var pseudoTemplate = pseudo.querySelector('template');
//					if(pseudoTemplate) {
//						skin.templates[pseudoId] = pseudoTemplate;
//					}
//				}
			}
		};
	/**
	 * Creates a new Skin for the given {@link module:jidejs/ui/Control}.
	 *
	 * The base implementation provided by this class handles tooltips and context menus so that subclasses
	 * don't have to implement it themself.
	 *
	 * Care must be taken that subclasses call both, the `dispose` and the `install` method of this class.
	 *
	 * @memberof module:jidejs/ui/Skin
	 * @param {module:jidejs/ui/Control} component The control to which the Skin belongs.
	 * @param {Element?} element The DOM element that is managed by this Skin. If not provided, an element will be created.
	 * @constructor
	 * @abstract
	 * @alias module:jidejs/ui/Skin
	 */
	function Skin(component, element) {
		this.component = component;
		this.element = element || this.createDefaultRootElement();
		this[$bindings] = [];
		this[BINDINGS] = null;
		this[EVENT_BINDINGS] = null;
	}

	function createEventListenerDisposable(element, eventNames, handlers) {
		return {
			dispose: function() {
				if(!element || !eventNames || !handlers) return;
				for(var i = 0, len = eventNames.length; i < len; i++) {
					var eventName = eventNames[i];
					element.removeListener(eventName, handlers[eventName], false);
				}
				element = null;
				eventNames = null;
				handlers = null;
			}
		};
	}

	Class(Skin).def({
		/**
		 * The element name of the default root element if none is provided.
		 * @protected
		 */
		defaultElement: 'div',

		/**
		 * Creates a new element to be used as the root element of the control if no such element is given by the user.
		 * @returns {Element}
		 * @protected
		 */
		createDefaultRootElement: function() {
			return document.createElement(this.defaultElement || 'div');
		},

		/**
		 * This method should create/update the given controls element to suit the needs of the control.
		 * It is invoked only once during the creation of the Skin for the control.
		 *
		 * If there is content within the root element, a concrete implementation should try to initialize the controls
		 * properties from the DOM.
		 *
		 * I.e., a button element with textual content in it should modify the buttons `text` property before modifying
		 * the DOM to be able to handle the `text` and `graphic` properties.
		 *
		 * @protected
		 */
		updateRootElement: function() {
			if(this.template) {
				var template = Template(this.component.template || this.template).content.cloneNode(true);
				refPseudos(this, template);
				this.managed(bind.to(template, this));
				if(has('shadowDOM')) {
					this.element.createShadowRoot().appendChild(template);
				} else {
					this.element.appendChild(template);
				}
			}
		},

		on: function(pseudoName, handlers) {
			if(arguments.length === 1) {
				this.managed(this.component.on(pseudoName));
			} else {
				if(this[pseudoName]) {
					var eventNames = Object.getOwnPropertyNames(handlers),
						element = this[pseudoName];
					if(element.on) {
						this.managed(element.on(handlers));
						return;
					}
					for(var i = 0, len = eventNames.length; i < len; i++) {
						var eventName = eventNames[i];
						element.addEventListener(eventName, handlers[eventName], false);
					}
					this.managed(createEventListenerDisposable(element, eventNames, handlers));
				}
			}
		},

		managed: function(disposable) {
			for(var i = 0, len = arguments.length; i < len; i++) {
				this[$bindings].push(arguments[i]);
			}
		},

		/**
		 * Releases all resources hold by by this Skin. Must be invoked when the Skin is no longer used.
		 */
		dispose: function() {
			this.component = null;
			this.element = null;
			var bindings = this[$bindings];
			for(var i = 0, len = bindings && bindings.length || 0; i < len; i++) {
				bindings[i].dispose();
			}
			this[$bindings] = null;
			if(this[BINDINGS]) this[BINDINGS].forEach(function(binding) {
				if(binding) binding.dispose();
			});
			if(this[EVENT_BINDINGS]) this[EVENT_BINDINGS].forEach(function(binding) {
				if(binding) binding.dispose();
			});
			this[BINDINGS] = null;
			this[EVENT_BINDINGS] = null;
		},

		updateTooltipPosition: function(pageX, pageY) {
			var tooltip = this.component.tooltip,
				size = tooltip.measure(),
				box = DOM.getBoundingBox(this.component.element);
			var doc = document.documentElement, body = document.body;
			var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
			var top = (doc && doc.scrollTop || body && body.scrollTop || 0);

			var canShowBelow = (box.bottom + size.height + TOOLTIP_SPACE) < ((top + Window.height));
			tooltip.show(this.component,
				left + pageX,
				canShowBelow
					? box.bottom + TOOLTIP_SPACE
					: box.top - TOOLTIP_SPACE - size.height);
		},

		/**
		 * Sets up the bindings, property listeners and any required DOM structure.
		 * Must be invoked before the control is displayed.
		 */
		install: function() {
			this.updateRootElement();
			var c = this.component;
			var THIS = this;

			var tooltipMouseOver = function(e) {
				if(!c.automaticTooltipHandling) return;
				THIS.updateTooltipPosition(e.pageX, e.pageY);
			};
			var tooltipMouseOut = function(e) {
				console.log(e);
				if(!c.automaticTooltipHandling || c.element.contains(e.relatedTarget)) return;
				this.tooltip.visible = false;
			};
			var tooltipMouseMove = function(e) {
				if(!c.automaticTooltipHandling) return;
				THIS.updateTooltipPosition(e.pageX, e.pageY);
			};

			if(c.tooltip) {
				THIS[tooltipHandler] = [
					c.on('mouseover', tooltipMouseOver),
					c.on('mouseout', tooltipMouseOut),
					c.on('mousemove', tooltipMouseMove)
				];
			}

			this.managed(
				c.tooltipProperty.subscribe(function(event) {
					if(event.value) {
						if(!THIS[tooltipHandler]) {
							THIS[tooltipHandler] = [
								c.on('mouseover', tooltipMouseOver),
								c.on('mouseout', tooltipMouseOut),
								c.on('mousemove', tooltipMouseMove)
							];
						}
					} else if(THIS[tooltipHandler]) {
						var handlers = THIS[tooltipHandler];
						for(var i = 0, len = handlers.length; i < len; i++) {
							handlers[i].dispose();
						}
						delete THIS[tooltipHandler];
					}
				}),
				c.contextmenuProperty.subscribe(function(event) {
					if(event.value) {
						if(!THIS[contextMenuHandler]) {
							THIS[contextMenuHandler] = c.on('change:contextmenu', function(e) {
								this.contextmenu.show(c, e.pageX, e.pageY);
								e.preventDefault();
								e.stopPropagation();
								return false;
							});
						}
					} else if(THIS[contextMenuHandler]) {
						THIS[contextMenuHandler].dispose();
						delete THIS[contextMenuHandler];
					}
				})
			);
			this[BINDINGS] = this.installBindings();
			this[EVENT_BINDINGS] = this.installListeners();
		},

		/**
		 * Registers all necessary property bindings and returns them as an array.
		 * @returns {{ dispose: function() {}}[]}
		 */
		installBindings: function() { return []; },

		/**
		 * Registers all necessary event handlers and returns their {@link module:jidejs/base/Subscription}s as an array.
		 * @returns {module:jidejs/base/Subscription[]}
		 */
		installListeners: function() { return []; },

		/**
		 * The control that is managed by this Skin.
		 */
		component: null,
		/**
		 * The element that the control should use.
		 */
		element: null
	});

	Skin.create = function(ParentSkin, def) {
		function Default(component, element) {
			ParentSkin.call(this, component, element);
		}
		Class(Default).extends(ParentSkin || Skin).def(def || {});
		return Default;
	};

	return Skin;
});