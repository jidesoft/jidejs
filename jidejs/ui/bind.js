/// @internal
/// @private
/// This API is not yet considered public. There might be substantial changes before it becomes public API.
define('jidejs/ui/bind', [
	'jidejs/base/Observable', 'jidejs/base/DOM', 'jidejs/base/Util',
	'jidejs/ui/util/ClassList', 'jidejs/ui/util/js-object-literal-parse'
], function(Observable, DOM, _, ClassList, literalParse) {
	"use strict";
	function bind(element, descriptor, context) {
		var oldValues = {};
		var state = 0; // 0 -> init, 1 -> update
		var controlsChildren = false;
		var binding = Observable.computed({
			lazy: false,
			read: function() {
				var names = Object.getOwnPropertyNames(descriptor) || {};
				for(var i = 0, len = names.length; i < len; i++) {
					var name = names[i],
						value = Observable.unwrap(descriptor[name]()),
						oldValue = oldValues[name];
					if(state === 0 || value !== oldValue) {
						if(bind.handlers.hasOwnProperty(name)) {
							if(state === 0 && bind.handlers[name].hasOwnProperty('init')) {
								controlsChildren = bind.handlers[name].init(element, context) || controlsChildren;
							}
							bind.handlers[name].update(element, value, oldValue, context);
						} else {
							console.log('Trying to use undefined binding handler '+name+' on element', element);
						}
					}
				}
				state = 1;
			}
		});
		binding.get(); // make it apply the bindings for the first time
		return {
			controlsChildren: controlsChildren,
			dispose: function() {
				binding.dispose();
				binding = null;
				element = null;
				oldValues = null;
				descriptor = null;
				context = null;
			}
		};
	}

	bind.attributeName = 'data-bind';
	var bindingCache = {};

	function hasBindingProvider(element) {
		return element.nodeType === 1 && element.hasAttribute(bind.attributeName);
	}

	function preprocessLiteral(descriptorArray) {
		return descriptorArray.map(function(descriptor) {
			return ["'", descriptor[0], "':function(){return ", descriptor[1], ';}'].join('');
		}).join(',');
	}

	function getBindingProvider(element) {
		if(hasBindingProvider(element)) {
			var bindAttribute = preprocessLiteral(literalParse(element.getAttribute(bind.attributeName)));
			var functionBody = 'with($context) { with($context.$data) { return { '+ bindAttribute+' }; } }';
			return bindingCache[functionBody] || (bindingCache[functionBody] = Function('$context', '$element', functionBody));
		}
	}

	bind.context = {
		$parent: null,
		$data: {},
		$root: null
	};
	bind.context.$root = bind.context;

	function pushContext(parentContext, data) {
		parentContext || (parentContext = bind.context);
		var context = Object.create(parentContext);
		context.$parentContext = parentContext;
		context.$parent = parentContext.$data;
		context.$data = data;
		return context;
	}

	bind.to = function(element, data, parentContext) {
		var context;

		if(hasBindingProvider(element)) {
			context = pushContext(parentContext, data);
			var provider = getBindingProvider(element);
			var result = bind(element, provider(context, data), context); // memory leak: no way to dispose memory
			if(result.controlsChildren) return;
		}
		// traverse tree
		for(var children = element.childNodes, i = 0, len = children.length; i < len; i++) {
			var child = children[i];
			if(child.nodeType === 1) {
				bind.to(child, data, context || parentContext);
			}
		}
	};

	bind.handlers = {
		text: {
			update: function(element, value, oldValue, context) {
				DOM.setTextContent(element, value);
			}
		},

		html: {
			update: function(element, value, oldValue, context) {
				if(_.isString(value)) {
					element.innerHTML = value;
				} else {
					DOM.removeChildren(element);
					if(value) {
						DOM.appendChild(value);
					}
				}
			}
		},

		css: {
			update: function(element, value, oldValue, context) {
				var component = DOM.hasData(element) && DOM.getData(element).component || null,
					target = component || (element.classList && element) || new ClassList(element),
					classes = Object.getOwnPropertyNames(value);
				classes.forEach(function(className) {
					if(value[className]) {
						target.classList.add(className);
					} else {
						target.classList.remove(className);
					}
				});
				if(oldValue) {
					Object.getOwnPropertyNames(oldValue).forEach(function(className) {
						if(!value.hasOwnProperty(className)) {
							target.classList.remove(className);
						}
					});
				}
			}
		},

		style: {
			update: function(element, value) {
				Object.getOwnPropertyNames(value).forEach(function(styleName) {
					element.style[styleName] = value[styleName] || '';
				});
			}
		},

		content: {
			update: function(element, value, oldValue, context) {
				if(_.isString(value)) {
					// use text
					DOM.setTextContent(element, value);
				} else if(!value) {
					DOM.removeChildren(element);
				} else if(_.isElement(value)) {
					DOM.removeChildren(element);
					element.appendChild(value);
				} else if(_.isElement(value.element)) { // assume we're working with a jide.js Component
					DOM.removeChildren(element);
					element.appendChild(value.element);
				}
			}
		},

		attr: {
			update: function(element, value, oldValue, context) {
				oldValue || (oldValue = {});

				var names = Object.getOwnPropertyNames(value);
				for(var i = 0, len = names.length; i < len; i++) {
					var name = names[i],
						attributeValue = Observable.unwrap(value[name]);
					if(attributeValue === false || attributeValue === null || attributeValue === undefined) {
						element.removeAttribute(name);
					} else {
						element.setAttribute(name, String(attributeValue));
					}
				}

				names = Object.getOwnPropertyNames(oldValue);
				for(i = 0, len = names.length; i < len; i++) {
					if(!value.hasOwnProperty(names[i])) {
						element.removeAttribute(names[i]);
					}
				}
			}
		},

		template: {
			init: function(element, context) {
				var bindData = getBindData(element);
				var Template = require('jidejs/ui/Template');
				if(!Template) {
					throw new Error('Expected jidejs/ui/Template to be ready before jidejs/ui/bind for "template" binding.');
				}
				var frag = document.createDocumentFragment();
				for(var children = element.childNodes; children.length > 0; frag.appendChild(children[0]));

				// at this point, the element doesn't have any children left
				bindData.template = Template.fromElement({ content: frag }); // "fake" a template element

				return true; // controls children
			},

			update: function(element, value, oldValue, context) {
				// a simple implementation for now, expect "value" to be an object with a "data" key
				if(!_.isObject(value)) throw new Error('Expected value of template binding to be an object');
				if(oldValue && value.data === oldValue.data) return; // nothing to update

				var data = value.data,
					template = getBindData(element).template.clone();
				DOM.removeChildren(element);
				if(value.as) {
					var newContext = pushContext(context, context.$data);
					newContext[value.as] = data;
					element.appendChild(template.render(context.$data, newContext));
				} else {
					element.appendChild(template.render(data, context));
				}
			}
		}
	};

	function getBindData(element) {
		var data = DOM.getData(element);
		return data._bind || (data._bind = {});
	}

	return bind;
});
