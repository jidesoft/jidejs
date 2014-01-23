define(['./../base/config', './../base/has'], function(config, has) {
	var exportedTags;
	if(!config.is('customElementsEnabled') || !has('customElements')) {
		var registry = [];
		exportedTags = function(tagName, Component, Parent, exportedProperties, forwardedMethods) {
			registry[registry.length] = [tagName, Component];
		};
//		exportedTags._replaceCustomElements = function(element) {
//			var children = element.querySelectorAll
//		};
//		return exportedTags;
	}
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
    if(!exportedTags) {
	    document.register('jide-prop', { prototype: jidePropertyElementPrototype });
    }

	return function(tagName, Component, Parent, exportedProperties, forwardedMethods) {
        if(exportedTags) return exportedTags(tagName, Component, Parent, exportedProperties, forwardedMethods);

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
			var config = { element: this };
			// create component
			this.component = new Component(config);
			// and make it visible
			this.component.classList.add('resolved');
		};
//		proto.attributeChangedCallback = function(attr, oldValue) {
//			if(this.component) this.component[attr] = this.getAttribute(attr);
//		};
		var elementConstructor = document.register(tagName, { prototype: proto });
		Component.createElement = function() {
			return new elementConstructor();
		};
		Component.customElementPrototype = proto;
	};
});