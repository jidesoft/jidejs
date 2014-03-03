/**
 * The Control is the base class for all controls provided by jide.js. A Control is a Component which is further refined
 * and has a {@link module:jidejs/ui/Skin}.
 *
 * @module jidejs/ui/Control
 */
define([
	'./../base/Class', './../base/ObservableProperty', './Component', './Skin', './../base/DOM',
	'./register'
], function(Class, Observable, Component, Skin, DOM, register) {
	function setSkin(event) {
		if(event.oldValue) event.oldValue.dispose();
		if(!event.value) return; // exit early if there is no new skin
		var skin = event.value;

		if(this.element && this.element.parentNode) {
			var element = this.element;
			element.parentNode.replaceChild(skin.element, element);
			DOM.removeData(element);
			DOM.getData(this.element).component = this;
			this.element = skin.element;
		} else {
			this.element = skin.element;
			DOM.getData(this.element).component = this;
		}
		skin.install();
		event.stopPropagation();
	}

	function parseChildren(component, element, config) {
		for(var i = 0, attribs = element.attributes, len = attribs.length; i < len; i++) {
			var attribute = attribs[i];
			config[attribute.nodeName] = attribute.nodeValue;
		}
		// copy children to a save place
		if(typeof component.children !== 'undefined') {
			var children = [];
			copyChildren(element, config, function(child) {
				children[children.length] = child;
                element.removeChild(child);
			});
			config.children = children;
		} else if(typeof component.contentProperty !== 'undefined') {
			var frag = document.createDocumentFragment();
			copyChildren(element, config, function(child) {
				frag.appendChild(child);
			});
			config.content = frag;
		} else {
			copyChildren(element, config, function(child) {
				element.removeChild(child);
			});
		}
	}

	function copyChildren(element, config, fallbackHandler) {
		while(element.firstChild) {
			var child = element.firstChild;
			if(child.tagName === 'JIDE-PROP') {
				config[child.propertyName] = child.propertyValue;
				element.removeChild(child);
			} else if(child.hasAttribute && child.hasAttribute('data-property')) {
				config[child.getAttribute('data-property')] = child;
				element.removeChild(child);
			} else if(child.tagName === 'TEMPLATE') {
				config.template = child;
				element.removeChild(child);
			} else {
				fallbackHandler(child);
			}
		}
	}

	/**
	 * Creates a new Control and configures it with the provided `config` object.
	 *
	 * The `config` object must contain a field named `skin` which must contain the initial {@link module:jidejs/ui/Skin}
	 * to be used for the control.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/Control
     * @extends module:jidejs/ui/Component
     * @param {object} config The configuration of the Control.
     * @param {jidejs/ui/Skin} config.skin The Skin of the control.
	 */
	var exports = function Control(config) {
		installer(this);
		if(config.element) parseChildren(this, config.element, config);
		var skin = config.skin || (new (this.constructor.Skin)(this, config.element));
		delete config.skin;
		this.element = skin.element;
		Component.call(this, skin.element);
		this.skin = skin;
		this.skinProperty.subscribe(setSkin, this);
		Component.applyConfiguration(this, config);
		skin.install();

		this.classList.add('jide-control');
	};
    var Control = exports;
	Class(Control).extends(Component).def( /** @lends module:jidejs/ui/Control# */ {
		/**
		 * The Skin of the control.
		 */
		skin: null,
		/**
		 * The Skin of the control.
		 */
		skinProperty:null,
		/**
		 * The tooltip that should be displayed when the user moves the mouse cursor over the control.
		 * @type module:jidejs/ui/control/Tooltip
		 */
		tooltip: null,
		/**
		 * The tooltip that should be displayed when the user moves the mouse cursor over the control.
		 * @type module:jidejs/base/ObservableProperty
		 */
		tooltipProperty: null,
		/**
		 * If `true`, then the tooltip will be handled automatically by the control.
		 * @type boolean
		 */
		automaticTooltipHandling: true,
		/**
		 * The context menu that should be displayed when the user right clicks or long taps the control.
		 * @type module:jidejs/ui/control/ContextMenu
		 */
		contextmenu: null,
		/**
		 * The context menu that should be displayed when the user right clicks or long taps the control.
		 * @type module:jidejs/base/ObservableProperty
		 */
		contextmenuProperty: null,

		/**
		 * Releases all resources held by this control.
		 */
		dispose: function() {
			this.skin = null;
			Component.prototype.dispose.call(this);
			installer.dispose(this);
		}
	});
	var installer = Observable.install(Control,
        'skin:no-bubbling:no-cancel', 'tooltip:no-bubbling:no-cancel', 'contextmenu:no-bubbling:no-cancel'
    );
    Control.Skin = Skin;

    function endsWith(string, searchString, position) {
        position = position || string.length;
        position = position - searchString.length;
        var lastIndex = string.lastIndexOf(searchString);
        return lastIndex !== -1 && lastIndex === position;
    }

    exports.create = function(name, def) {
        // prepare def and used variables
        var init = def.constructor,
            parent = def.$extends || Control,
            mixins = def.$with || [],
            proto = Object.create(parent.prototype),
            properties = [],
            skin = def.Skin || parent.Skin || Skin,
            installer;
        delete def.constructor;
        delete def.$extends;
        delete def.$with;
        delete def.Skin;

        // create constructor for new component
        function CustomControl(config) {
            if(installer) installer(this);
            if(init) init.apply(this, arguments);
            // initialize mixins
            for(var i = 0, len = mixins.length; i < len; i++) {
                mixins[i].call(this, config);
            }
            parent.call(this, config);
        }

        // merge in mixins
        for(var i = 0, len = mixins.length; i < len; i++) {
            var mixin = mixins[i];
            Object.getOwnPropertyNames(mixin).forEach(function(propertyName) {
                var descriptor = Object.getOwnPropertyDescriptor(mixin, propertyName);
                Object.defineProperty(proto, propertyName, descriptor);
            });
        }

        properties[0] = CustomControl;

        // copy properties from the definition to the prototype, add special recognition for ObservableProperty fields
        Object.getOwnPropertyNames(def).forEach(function(propertyName) {
            if(endsWith(propertyName, 'Property')) {
                properties[properties.length] = propertyName.substring(0, propertyName.length-8);
                proto[propertyName] = null;
            } else {
                var descriptor = Object.getOwnPropertyDescriptor(def, propertyName);
                Object.defineProperty(proto, propertyName, descriptor);
            }
        });
        // setup prototype chain
        proto.constructor = CustomControl;
        CustomControl.prototype = proto;
        CustomControl.Skin = skin;

        // and create installer
        var installer = properties.length === 0 ? null : Observable.install.apply(Observable, properties);

        return CustomControl;
    };

	register('jide-control', Control, Component, ['skin', 'tooltip', 'contextmenu'], []);

	return exports;
});