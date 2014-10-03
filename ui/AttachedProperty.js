/**
 * An `AttachedProperty` is a property that belongs to a {@link module:jidejs/ui/Component} and can be used to configure
 * its children.
 *
 * @module jidejs/ui/AttachedProperty
 */
define(['../base/Util', '../base/DOM'], function(_, DOM) {
	/**
	 * Creates a new function that can be used to set and get the value of the property from the
	 * {@link module:jidejs/ui/Component}.
	 *
	 * The `handler` callback is invoked whenever the value of the property on one of its registered components
	 * changes.
	 *
     * @function
     * @alias module:jidejs/ui/AttachedProperty
     *
	 * @param {string} name The name of the property. Must be unique across all available attached properties.
     * @param {string?} attrName (Optional) The name of the property as an attribute on an element
	 * @param {function} handler Invoked when the property changes on any of its registered components.
	 * @returns {Function} The property function. Provides methods to register, unregister and update components.
	 */
	var exports = function AttachedProperty(name, attrName, handler) {
        if(arguments.length === 2) {
            handler = attrName;
            attrName = name;
        }
		var property = function(component, value) {
            if(component.attributes) {
                // are we working with a component? Then store data in `attributes` map
                var attributes = component.attributes;
                if(arguments.length === 1) {
                    return attributes.get(name);
                } else {
                    attributes.set(name, value);
                    return component;
                }
            } else {
                if(attributes.length === 1) {
                    return (name in component) ? component[name] : component.getAttribute(attrName);
                } else {
                    var oldValue = (name in component) ? component[name] : component.getAttribute(attrName);
                    if(_.isString(value) || _.isInteger(value)) {
                        component.setAttribute(attrName, value);
                    } else if(_.isBoolean(value)) {
                        if(value) component.setAttribute(attrName, 'true');
                        else component.removeAttribute(attrName);
                    } else {
                        component[name] = value;
                    }
                    // dispatch native event
                    DOM.emit(component, 'change:'+name, {
                        bubbles: true, cancelable: true,
                        value: value, oldValue: oldValue
                    });
                    //var event = document.createEvent('Event');
                    //event.initEvent('change:'+name, /* bubbles */ true, /* cancelable */ true);
                    //event.source = component;
                    //event.value = value;
                    //event.oldValue = oldValue;
                    //component.dispatchEvent(event);
                }
            }
		};
		property.register = function(component) {
			if(handler) {
				//component.attributes.on(name, handler);
                component.addEventListener('change:'+name, handler, false);
			}
			return this;
		};
		property.unregister = function(component) {
			if(handler) {
				//component.attributes.removeListener(name, handler);
                component.removeEventListener('change:'+name, handler, false);
			}
			return this;
		};
		property.update = function(component) {
			var value = property(component);//component.attributes.get(name);
			handler({
                value: value,
                source: component, owner: component,
                oldValue: undefined,
                stopImmediatePropagation: function() {}
            });
			return this;
		};
		return property;
	};
	return exports;
});