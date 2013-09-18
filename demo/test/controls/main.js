// configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}]
});

require([
	'jidejs/base/Class',
	'jidejs/base/ObservableProperty',
	'jidejs/base/DOM',
	'jidejs/base/Util',
	'jidejs/ui/bind',
	'jidejs/ui/Control',
	'jidejs/ui/Skin',
	'jidejs/ui/Template'
], function(Class, ObservableProperty, DOM, _, bind, Control, Skin, Template) {
	"use strict";

	//region Utilities
	function getRootNode(frag) {
		var rootNode = frag.firstChild;
		while(rootNode && rootNode.nodeType !== 1) rootNode = rootNode.nextSibling;
		return rootNode;
	}

	function createFragmentFromNodeList(list) {
		var frag = document.createDocumentFragment();
		while(list.length) {
			frag.appendChild(list[0]);
		}
		return frag;
	}

	function injectTemplate(component, element, template, contentMappers) {
		var frag = template.clone().element;
		if(frag.nodeType === 11) {
			// Step 1: transform contents of "element" to properties of the component
			//  and remove children from the element
			if(element.childNodes.length > 0) {
				var propertyNames = Object.getOwnPropertyNames(contentMappers);
				for(var i = 0, len = propertyNames.length; i < len; i++) {
					var propertyName = propertyNames[i],
						selector = contentMappers[propertyName],
						propertyValue = selector !== '*' && element.querySelectorAll(selector) || null;
					if(!component[propertyName]) {
						if(selector === '*') {
							component[propertyName] = createFragmentFromNodeList(element.childNodes);
						} else if(propertyValue && propertyValue.length > 1) {
							if(propertyValue.length === 1) {
								propertyValue = propertyValue[0];
							} else {
								propertyValue = createFragmentFromNodeList(propertyValue);
							}
							component[propertyName] = propertyValue;
						}
					}
				}
				DOM.removeChildren(element);
			}

			// step 3: Transform known attributes to properties of the component
			attributes = element.attributes;
			for(i = 0, len = attributes.length; i < len; i++) {
				attrib = attributes[i];
				if((attrib.nodeName+'Property') in component) {
					component[attrib.nodeName] = attrib.nodeValue;
				}
			}

			// step 2: Merge attributes from the template root node with those of the element
			//  and copy its children to the element
			var rootNode = getRootNode(frag);
			if(rootNode) {
				var attributes = rootNode.attributes;
				for(i = 0, len = attributes.length; i < len; i++) {
					var attrib = attributes[i];
					if(element.hasAttribute(attrib.nodeName)) {
						if('class' === attrib.nodeName) {
							element.className = element.className + ' ' + attrib.nodeValue;
						}
						// ignore all other attributes where we don't know how to merge them
					} else {
						element.setAttribute(attrib.nodeName, attrib.nodeValue);
					}
				}
				while(rootNode.firstChild) element.appendChild(rootNode.firstChild);
			}
		} else {
			throw new Error('Expected the Template to render as a document fragment.');
		}
	}

	function registerCustomElement(name, Component, Prototype, forwardedProperties, forwardedMethods) {
		var protoDefinition = {
			readyCallback: {
				value: function(proto) {
					// create config from attributes
					var config = { element: this };
					for(var i = 0, attribs = this.attributes, len = attribs.length; i < len; i++) {
						var attribute = attribs[i];
						config[attribute.nodeName] = attribute.nodeValue;
					}
					// create component
					this.component = new Component(config);
				}
			},

			attributeChangedCallback: {
				value: function(attr, oldValue) {
					if(this.component && (attr+'Property') in this.component) this.component[attr] = this.getAttribute(attr);
				}
			}
		};

		if(forwardedProperties) forwardedProperties.forEach(function(name) {
			protoDefinition[name] = {
				get: function() {
					return this.component[name];
				},

				set: function(value) {
					this.component[name] = value;
				}
			};
			if((name+'Property') in Component.prototype) {
				protoDefinition[name+'Property'] = {
					get: function() {
						return this.component[name+'Property'];
					}
				}
			}
		});
		if(forwardedMethods) forwardedMethods.forEach(function(name) {
			protoDefinition[name] = {
				value: function() {
					return this.component[name].apply(this.component, arguments);
				}
			}
		});
		var elementProto = Object.create(
			// inherit from existing prototype
				(_.isFunction(Prototype) && Prototype.WebComponentPrototype)
				|| HTMLElement.prototype,
			// and extend with our own stuff
			protoDefinition
		);

		Component.WebComponentPrototype = elementProto;

		document.register(name, {
			'prototype': elementProto
		});
	}
	//endregion

	var ButtonTemplate = Template.fromString(
		'<button data-bind="content: content, css: { \'is-enabled\': enabled }, attr: { disabled: !enabled }"></button>'
	);
	function ButtonSkin(button, element, template) {
		Skin.call(this, button);
		template || (template = this.constructor.Template);
		if(_.isString(template)) {
			if(template.length > 1 && template[0] === '#') {
				template = Template.fromId(template.substring(1));
			} else {
				template = Template.fromString(template);
			}
		}
		this.injectedTemplate = element && template;
		this.element = element || getRootNode(template.clone().element);
	}
	Class(ButtonSkin).extends(Skin).def({
		install: function() {
			Skin.prototype.install.call(this);
			var button = this.component;
			if(this.injectedTemplate) {
				injectTemplate(button, this.element, this.injectedTemplate, {
					'content': '*'
				});
			}
			bind.to(this.element, button);
			button.on('click', function(event) {
				if(button.enabled) {
					button.emit('action');
				}
				event.preventDefault();
				event.stopImmediatePropagation();
			});
		}
	});
	ButtonSkin.Template = ButtonTemplate;

	function Button(config) {
		installer(this);
		config || (config = {});
		config.skin || (config.skin = new (this.constructor.Skin)(this, config.element, config.template));
		_.defaults(config, { enabled: true, content: '' });

		Control.call(this, config);
	}
	Class(Button).extends(Control);
	Button.Skin = ButtonSkin;
	var installer = ObservableProperty.install(Button, 'content', 'enabled');

	if(document.register) {
		registerCustomElement('jide-button', Button, Control,
			['content', 'enabled'], // properties
			['on'] // methods
		);
	}

	//region actual demo

	// add a new Button (create a fresh element)
	var myButton = new Button({
		content: 'Hello World',
		on: {
			action: function() {
				alert('Hello Universe!');
				this.enabled = false;
			}
		}
	});
	document.body.appendChild(myButton.element);

	// upgrade an existing button element to a Button control
	new Button({
		element: document.getElementById('importantButton'),
		on: {
			action: function() {
				this.content = 'You clicked an important button! Thanks!';
			}
		}
	});

	var customElementButton = document.getElementById('customButtonElement');
	customElementButton.on('action', function() {
		this.content = 'Yay!';
	});

	document.body.appendChild(new Button({
		content: 'Custom template',
		template: '<div class="jide-button jide-button-base jide-control" data-bind="css: { \'is-enabled\': enabled }"><span>&lt;</span><span data-bind="content: content"></span></div>',
		on: {
			action: function() {
				this.classList.toggle('important');
			}
		}
	}).element);
	//endregion
});