//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}],
	paths: {
		text: '../../../components/requirejs-text/text'
	}
});
//endregion
define('jidejs/register', ['jidejs/base/Dispatcher'], function(Dispatcher) {
	function exportProperty(proto, propName) {
		Object.defineProperty(proto, propName, {
			get: function() {
				return this.component[propName];
			}, set: function(value) {
				//this.component[propName] = value;
				this.setAttribute(propName, value);
			}, configurable: true
		});
		Object.defineProperty(proto, propName+'Property', {
			get: function() {
				return this.component[propName+'Property'];
			}, configurable: true
		});
	}

	function forwardMethod(proto, methodName) {
		proto[methodName] = function() {
			var component = this.component;
			return component[methodName].apply(component, arguments);
		};
	}

	var jidePropertyElementPrototype = Object.create(HTMLElement.prototype, {
		createdCallback : {
			value: function() {
				// export property name
				this.propertyName = this.attributes.getNamedItem('name').value;
				// export property value
				var valueAttribute = this.attributes.getNamedItem('value');
				if(valueAttribute) {
					this.propertyValue = valueAttribute.value;
				} else  {
					var frag = document.createDocumentFragment();
					while(this.firstChild) {
						frag.appendChild(this.firstChild);
					}
					if(frag.childNodes.length > 1) {
						this.propertyValue = frag;
					} else {
						var child = frag.firstChild;
						// handle text nodes
						if(child.nodeType === 3) {
							this.propertyValue = child.nodeValue;
						} else {
							this.propertyValue = child;
						}
					}
					//this.propertyValue = frag.childNodes.length > 1 ? frag : frag.firstChild;
				}
				// make ultra-sure that this component is not visible at all
				this.style.display = 'none';
			}
		}
	});
	document.register('jide-prop', { prototype: jidePropertyElementPrototype });

	return function(tagName, Component, Parent, exportedProperties, forwardedMethods) {
		var proto = Object.create(Parent && Parent.customElementPrototype || HTMLElement.prototype);
		Object.defineProperty(proto, 'element', {
			get: function() {
				return this;
			}, configurable: true
		});
		if(exportedProperties) {
			for(var i = 0; i < exportedProperties.length; i++) {
				exportProperty(proto, exportedProperties[i]);
			}
		}
		if(forwardedMethods) {
			for(var i = 0; i < forwardedMethods.length; i++) {
				forwardMethod(proto, forwardedMethods[i]);
			}
		}
		proto.createdCallback = function() {
			// create config from attributes

			var config = { element: this };
			for(var i = 0, attribs = this.attributes, len = attribs.length; i < len; i++) {
				var attribute = attribs[i];
				config[attribute.nodeName] = attribute.nodeValue;
			}
			// copy children to a save place
			if('children' in Component.prototype) {
				var children = [];
				while(this.firstElementChild) {
					var child = this.firstElementChild;
					if(child.tagName === 'JIDE-PROP') {
						config[child.propertyName] = child.propertyValue;
						this.removeChild(child);
					} else if(child.hasAttribute('data-property')) {
						config[child.getAttribute('data-property')] = child;
						this.removeChild(child);
					} else {
						children[children.length] = child;
					}
				}
				config.children = children;
			} else if('content' in Component.prototype) {
				var frag = document.createDocumentFragment();
				while(this.firstElementChild) {
					var child = this.firstElementChild;
					if(child.tagName === 'JIDE-PROP') {
						config[child.propertyName] = child.propertyValue;
						this.removeChild(child);
					} else if(child.hasAttribute('data-property')) {
						config[child.getAttribute('data-property')] = child;
						this.removeChild(child);
					} else {
						frag.appendChild(child);
					}
				}
				config.content = frag;
			} else {
				for(var i = 0; i < this.children.length; i++) {
					var child = this.children[i];
					if(child.tagName === 'JIDE-PROP') {
						config[child.propertyName] = child.propertyValue;
					} else if(child.hasAttribute('data-property')) {
						config[child.getAttribute('data-property')] = child;
						this.removeChild(child);
					}
				}
				this.innerHTML = '';
			}

			// create component
			this.component = new Component(config);
			// and make it visible
			this.component.classList.add('resolved');
		};
		proto.attributeChangedCallback = function(attr, oldValue) {
			if(this.component) this.component[attr] = this.getAttribute(attr);
		};
		var elementConstructor = document.register('jide-'+tagName, { prototype: proto });
		Component.createElement = function() {
			return new elementConstructor();
		};
		Component.customElementPrototype = proto;
	};
});

require([
	'jidejs/register',
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/Observable', 'jidejs/base/ObservableProperty',
	'jidejs/ui/Component', 'jidejs/ui/Control',
	'jidejs/ui/control/Labeled', 'jidejs/ui/control/Button',
	'jidejs/ui/control/TitledPane'
], function(
	register, Class, _, Observable, ObservableProperty,
	Component, Control,
	Labeled, Button,
	TitledPane
) {
	// make Button available through custom elements
	register('component', Component, null, [], ['on', 'emit', 'measure', 'dispose']);
	register('control', Control, Component, ['skin', 'tooltip', 'contextmenu'], []);
	register('labeled', Labeled, Control, ['graphic', 'text', 'graphicTextGap'], []);
	register('button', Button, Labeled);
	register('titledpane', TitledPane, Control, ['content', 'title', 'collapsible', 'expanded', 'animated'], []);

	var myButton = Button.createElement();
	myButton.text = 'Hello Patrick';
	myButton.on('action', function(event) {
		console.log(event);
		alert('Button clicked');
	});
	document.body.appendChild(myButton);

	document.addEventListener('WebComponentsReady', function() {
		var titledPane = document.querySelector('jide-titledpane');
		console.log(titledPane.title);
	});
});