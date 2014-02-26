/**
 * An `AttachedProperty` is a property that belongs to a {@link module:jidejs/ui/Component} and can be used to configure
 * its children.
 *
 * @module jidejs/ui/AttachedProperty
 */
define(function() {
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
	 * @param {function} handler Invoked when the property changes on any of its registered components.
	 * @returns {Function} The property function. Provides methods to register, unregister and update components.
	 */
	var exports = function AttachedProperty(name, handler) {
		var property = function(component, value) {
			var attributes = component.attributes;
			if(arguments.length === 1) {
				return attributes.get(name);
			} else {
				attributes.set(name, value);
				return component;
			}
		};
		property.register = function(component) {
			if(handler) {
				component.attributes.on(name, handler);
			}
			return this;
		};
		property.unregister = function(component) {
			if(handler) {
				component.attributes.removeListener(name, handler);
			}
			return this;
		};
		property.update = function(component) {
			var value = component.attributes.get(name);
			handler(value, { value: value, owner: component, oldValue: undefined });
			return this;
		};
		return property;
	};
	return exports;
});