/**
 * The `Skin` belongs to a {@link module:jidejs/ui/Control} and defines its look and feel.
 *
 * It should listen to changes in supported properties and handle changes to the underlying DOM as well as creating
 * the initial DOM structure.
 *
 * @module jidejs/ui/Skin
 */
define('jidejs/ui/Skin', ['jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Window'], function(Class, _, Window) {
	var $bindings = 'jidejs/ui/Skin.bindings',
		tooltipHandler = 'jidejs/ui/Skin.tooltipHandler',
		contextMenuHandler = 'jidejs/ui/Skin.contextMenuHandler',
		TOOLTIP_SPACE = 20,
		BINDINGS = '$jidejs/ui/Skin.create#bindings',
		EVENT_BINDINGS = '$jidejs/ui/Skin.create#eventBindings';
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
		this[$bindings] = null;
		this[BINDINGS] = null;
		this[EVENT_BINDINGS] = null;
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
		updateRootElement: function() {},

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

		/**
		 * Sets up the bindings, property listeners and any required DOM structure.
		 * Must be invoked before the control is displayed.
		 */
		install: function() {
			this.updateRootElement();
			var c = this.component;
			var THIS = this;

			if(c.tooltip) {
				THIS[tooltipHandler] = [
					c.on('mouseover', function(e) {
						if(!c.automaticTooltipHandling) return;
						var tooltip = this.tooltip,
							size = this.tooltip.measure();
						var doc = document.documentElement, body = document.body;
						var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
						var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
						tooltip.show(c, Math.min(
							left+e.pageX+TOOLTIP_SPACE,
							(left+Window.width) - size.width
						), Math.min(
							top+e.pageY+TOOLTIP_SPACE,
							(top+Window.height) - size.height
						));
					}),
					c.on('mouseout', function(e) {
						if(!c.automaticTooltipHandling) return;
						this.tooltip.visible = false;
					}),
					c.on('mousemove', function(e) {
						if(!c.automaticTooltipHandling) return;
						var tooltip = this.tooltip,
							style = tooltip.element.style,
							size = this.tooltip.measure();
						var doc = document.documentElement, body = document.body;
						var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
						var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
						style.left = Math.min(
							e.pageX+TOOLTIP_SPACE,
							(left+Window.width) - size.width
						)+"px";
						style.top = Math.min(
							e.pageY+TOOLTIP_SPACE,
							(top+Window.height) - size.height
						)+"px";
					})
				];
			}

			this[$bindings] = [
				c.tooltipProperty.subscribe(function(event) {
					if(event.value) {
						if(!THIS[tooltipHandler]) {
							THIS[tooltipHandler] = [
								c.on('mouseover', function(e) {
									if(!c.automaticTooltipHandling) return;
									var tooltip = this.tooltip,
										size = this.tooltip.measure();
									var doc = document.documentElement, body = document.body;
									var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
									var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
									tooltip.show(c, Math.min(
										e.pageX+TOOLTIP_SPACE,
										(left+Window.width) - size.width
									), Math.min(
										e.pageY+TOOLTIP_SPACE,
										(Window.height+top) - size.height
									));
								}),
								c.on('mouseout', function(e) {
									if(!c.automaticTooltipHandling) return;
									this.tooltip.visible = false;
								}),
								c.on('mousemove', function(e) {
									if(!c.automaticTooltipHandling) return;
									var tooltip = this.tooltip,
										style = tooltip.element.style,
										size = this.tooltip.measure();
									var doc = document.documentElement, body = document.body;
									var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
									var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
									style.left = Math.min(
										e.pageX+TOOLTIP_SPACE,
										(left+Window.width) - size.width
									)+"px";
									style.top = Math.min(
										e.pageY+TOOLTIP_SPACE,
										(top+Window.height) - size.height
									)+"px";
								})
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
			];
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