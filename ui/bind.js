/// @internal
/// @private
/// This API is not yet considered public. There might be substantial changes before it becomes public API.
define([
	'./../base/Observable', './../base/DOM', './../base/Util',
	'./util/ClassList', './util/js-object-literal-parse', './Component'
], function(Observable, DOM, _, ClassList, literalParse, Component) {
	"use strict";

    var _require;
    if(window.define && window.define.amd) {
        _require = function(dependency, callback) {
            if(controlAlias[dependency]) {
                callback(controlAlias[dependency]);
            } else {
                require([dependency], callback);
            }
        }
    } else {
        _require = function(dependency, callback) {
            if(controlAlias[dependency]) {
                callback(controlAlias[dependency]);
            } else {
                callback(require(dependency));
            }
        }
    }

	function bind(element, descriptor, context, component) {
		var oldValues = {};
		var state = 0; // 0 -> init, 1 -> update
		var controlsChildren = false;
        if(descriptor.is) {
            var controlId = descriptor.is(),
                controlInstance = component || null,
                disposable = {
                    controlsChildren: true,
                    dispose: function() {
                        controlInstance.dispose();
                        controlInstance = null;
                        element = null;
                        descriptor = null;
                        context = null;
                    }
                };
            delete descriptor.is;
            _require(controlId, function(Control) {
                var names = Object.getOwnPropertyNames(descriptor) || [],
                    config = {};
                for(var i = 0, len = names.length; i < len; i++) {
                    var name = names[i],
                        value = name === 'on' ? descriptor[name]() : Observable.computed(descriptor[name]);
                    config[name] = value;
                }
                if(!controlInstance) {
                    config['element'] = element;
                    controlInstance = new Control(config);
                } else {
                    Component.applyConfiguration(config);
                }
                controlInstance.emit('ComponentReady', {
                    source: element,
                    component: controlInstance
                });
            });
            return disposable;
        }
		var binding = Observable.computed({
			lazy: false,
			read: function() {
				var names = Object.getOwnPropertyNames(descriptor) || [];
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
							oldValues[name] = value;
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

    var controlAlias = {};
    bind.registerComponentAlias = function(alias, control) {
        controlAlias[alias] = control;
    };

	bind.attributeName = 'bind';
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
			var functionBody = 'with($context) { with($context.$item) { return { '+ bindAttribute+' }; } }';
			return bindingCache[functionBody] || (bindingCache[functionBody] = Function('$context', '$element', functionBody));
		}
	}

    function asBindingProvider(literal) {
        var bindAttribute = preprocessLiteral(literalParse(literal));
        var functionBody = 'with($context) { with($context.$item) { return { '+ bindAttribute+' }; } }';
        return bindingCache[functionBody] || (bindingCache[functionBody] = Function('$context', '$element', functionBody));
    }

	var createRandomShadowContentClass = (function() {
		var counter = 0;
		return function() {
			return 'jide-shadow-content-'+(counter++);
		};
	}());

	var defaultContext = {
		$parent: null,
		$item: {},
		$root: null
	};
	defaultContext.$root = defaultContext;

	function pushContext(parentContext, data) {
		parentContext || (parentContext = defaultContext);
		var context = Object.create(data);
		context.$parentContext = parentContext;
		context.$parent = parentContext.$item;
		context.$item = data;
		context.$root = parentContext.$root;
		return context;
	}

	function createDisposable(disposables) {
		return {
			dispose: function() {
				for(var i = 0, len = disposables.length; i < len; i++) {
					var disposable = disposables[i];
					if(disposable) disposable.dispose();
				}
			}
		};
	}

	bind.context = function(element) {
		while(element && !DOM.hasData(element)) element = element.parentNode;
		return DOM.getData(element).$bindContext;
	};

	function createContext(element, parent, data) {
		var context = _.isObject(data) ? Object.create(data) : {};
		context.$parent = parent;
		context.$item = data;
		context.$element = element;
		context.$rootElement = parent.$rootElement || parent.element;
		return context;
	}

	bind.to = function(element, component, data) {
		var context = createContext(element, component, data),
			boundElements = element.querySelectorAll('['+bind.attributeName+']'),
			disposables = [];
		DOM.getData(element).$bindContext = context;

		for(var i = 0, len = boundElements.length; i < len; i++) {
			var boundElement = boundElements[i],
				provider = getBindingProvider(boundElement);
            if(!DOM.hasData(boundElement) || !DOM.getData(boundElement).$bindContext) {
                DOM.getData(boundElement).$bindContext = context;
			    disposables[disposables.length] = bind(boundElement, provider(context, boundElement), context);
            }
		}
		return createDisposable(disposables);
	};

    bind.elementTo = function(element, component, data) {
        var context = createContext(element, component, data);
        DOM.getData(element).$bindContext = context;

        var provider = getBindingProvider(element);
        return bind(element, provider(context, element), context, component);
    };

    bind.elementToDescriptor = function(element, component, data, descriptor) {
        var context = createContext(element, component, data),
            provider = asBindingProvider(descriptor);
        DOM.getData(element).$bindContext = context;
        return bind(element, provider(context, element), context);
    };

	bind.handlers = {
		text: {
			update: function(element, value, oldValue, context) {
                if(value !== oldValue) {
				    DOM.setTextContent(element, value || '');
                }
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
			init: function(element, context) {
				if(element.createShadowRoot) {
					var contentClass = getBindData(element).contentClass = createRandomShadowContentClass();
					// add content element at insertion point
					var content = document.createElement('content');
					content.select = '.'+contentClass;
					element.appendChild(content);
				}
			},

			update: function(element, value, oldValue, context) {
				if(!value && !oldValue) return;
				if(element.createShadowRoot) {
					var bindData = getBindData(element),
						contentClass = bindData.contentClass,
						oldElement = bindData.element,
						rootElement = context.$rootElement;
					if(!oldElement) {
						if(_.isString(value)) {
							element = document.createElement('div');
							element.innerHTML = value;
						} else if(_.isElement(value)) {
							element = value;
						} else if(_.isElement(value.element)) {
							element = value.element;
						}
						if(element.classList) element.classList.add(contentClass);
						else element.className += ' '+contentClass;
						bindData.element = element;
						DOM.getData(element).$bindContext = context;
						rootElement.appendChild(element);
					} else {
						if(value != oldValue) {
							// need to update the content
							if(!value) {
								// remove old value
								DOM.getData(oldElement).$bindContext = null;
								rootElement.removeChild(oldElement);
								bindData.element = null;
							} else if(_.isString(value)) {
								// this is the only instance where we need to check the old values type
								if(_.isString(oldValue)) {
									// easy, just replace the old content with the new one
									oldElement.innerHTML = value;
								} else {
									// need to create a new container element
									element = document.createElement('div');
									element.innerHTML = value;
									if(element.classList) element.classList.add(contentClass);
									else element.className += ' '+contentClass;
									bindData.element = element;
									DOM.getData(element).$bindContext = context;
									DOM.getData(oldElement).$bindContext = null;
									rootElement.replaceChild(element, oldElement);
								}
							} else if(_.isElement(value)) {
								if(value.classList) value.classList.add(contentClass);
								else value.className += ' '+contentClass;
								bindData.element = value;
								DOM.getData(value).$bindContext = context;
								DOM.getData(oldElement).$bindContext = null;
								rootElement.replaceChild(value, oldElement);
							} else if(_.isElement(value.element)) {
								if(value.element.classList) value.element.classList.add(contentClass);
								else value.element.className += ' '+contentClass;
								bindData.element = value.element;
								DOM.getData(value.element).$bindContext = context;
								DOM.getData(oldElement).$bindContext = null;
								rootElement.replaceChild(value.element, oldElement);
							}
						}
					}
					return;
				}
				if(_.isString(value)) {
					// use text
                    if('innerHTML' in element) {
                        element.innerHTML = value;
                    } else {
                        DOM.setTextContent(element, value);
                    }
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

		foreach: {
			init: function(element, context) {
				var template = element.firstElementChild;

				// at this point, the element doesn't have any children left
				getBindData(element).template = template;
//				if(template) element.removeChild(template);
                element.innerHTML = '';

				return true; // controls children
			},

			update: function(element, value, oldValue, context) {
				var bindData = getBindData(element),
					template = bindData.template,
					disposables = bindData.disposables || (bindData.disposables = []),
                    useTemplate = template && template.content;
				var frag = document.createDocumentFragment();
				if(Array.isArray(value)) {
					for(var i = 0, len = value.length; i < len; i++) {
						var item = value[i],
							cloned = useTemplate
                                ? template.content.cloneNode(true)
                                : (item.element || item);
						if(useTemplate) disposables[i] = bind.to(cloned, context.$item, item);
						frag.appendChild(cloned);
					}
				} else if(value.on) {
					for(var i = 0, len = value.length; i < len; i++) {
						var item = value.get(i),
							cloned = useTemplate
                                ? template.content.cloneNode(true)
                                : (item.element || item);
                        if(useTemplate) disposables[i] = bind.to(cloned, context.$item, item);
						frag.appendChild(cloned);
					}
					value.on('change', function(event) {
						var changes = event.enumerator();
						while(changes.moveNext()) {
							var change = changes.current;
							if(change.isDelete) {
                                var templateSize = useTemplate ? template.content.childNodes.length : 1;
                                for(var len = templateSize; 0 < len; len--) {
                                    element.removeChild(element.childNodes[change.index * templateSize]);
                                }
								disposables.splice(change.index, 1).forEach(function(disposable) {
									if(disposable) disposable.dispose();
								});
							} else if(change.isInsert) {
								var cloned = useTemplate
                                        ? template.content.cloneNode(true)
                                        : (change.newValue.element || change.newValue),
                                    templateSize = useTemplate ? template.content.childNodes.length : 1;
								if(useTemplate) disposables.splice(change.index, 0, bind.to(cloned, context.$item, change.newValue));
								DOM.insertElementAt(element, cloned, change.index * templateSize);
							} else if(change.isUpdate) {
                                var cloned = useTemplate
                                    ? template.content.cloneNode(true)
                                    : (change.newValue.element || change.newValue);
                                if(useTemplate) {
                                    disposables[change.index].dispose();
                                    disposables[change.index] = bind.to(cloned, context.$item, change.newValue);
                                }
                                var templateSize = useTemplate ? template.content.childNodes.length - 1 : 0;
                                for(var len = templateSize; 0 < len; len--) {
                                    element.removeChild(element.childNodes[change.index * templateSize]);
                                }
								element.replaceChild(cloned, element.childNodes[change.index * templateSize]);
							}
						}
					});
				}
				element.appendChild(frag);
			}
		},

		on: {
			update: function(element, value, oldValue, context) {
				var bindData = getBindData(element),
					handlers = bindData.handlers || (bindData.handlers = []);
				for(var eventNames = Object.getOwnPropertyNames(value), i = 0, len = eventNames.length; i < len; i++) {
					var eventName = eventNames[i],
						handler = createEventHandler(element, eventName, value[eventName], context);
					element.addEventListener(eventName, handler, false);
					var oldHandler = handlers[i];
					if(oldHandler) {
						oldHandler.dispose();
					}
					handlers[i] = handler;
				}
			}
		}
	};

	function createEventHandler(element, eventName, handler, context) {
		var fn = function(event) {
			handler.call(context, context.$item, event);
		};
		fn.dispose = function() {
			if(element) element.removeEventListener(eventName, fn, false);
			element = null;
			eventName = null;
			handler = null;
			context = null;
		};
		return fn;
	};

	function getBindData(element) {
		var data = DOM.getData(element);
		return data._bind || (data._bind = {});
	}

	return bind;
});
