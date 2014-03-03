/// @internal
/// @private
/// This API is not yet considered public. There might be substantial changes before it becomes public API.
define([
	'./../base/Observable', './../base/DOM', './../base/Util', './../base/Dispatcher',
	'./util/ClassList', './util/js-object-literal-parse', './Component',
    './bind/content', './bind/foreach', './bind/style'
], function(
    Observable, DOM, _, Dispatcher, ClassList, literalParse, Component,
    contentBindings, foreachBindings, styleBindings
) {
	"use strict";

    foreachBindings = foreachBindings(bind);

    var _require, toString = Object.prototype.toString;
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

    function upgradeElement(element, descriptor, context, component) {
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
                Component.applyConfiguration(controlInstance, config);
            }
            controlInstance.emit('ComponentReady', {
                source: element,
                component: controlInstance
            });
        });
        return disposable;
    }

    function updateBindings(element, context, isInit, updates, oldValues) {
        for(var i = 0, len = updates.length; i < len; i++) {
            var update = updates[i],
                name = update[0],
                value = update[1],
                oldValue = oldValues[name];
            if(isInit || value !== oldValue) {
                if(bind.handlers.hasOwnProperty(name)) {
                    if(isInit && bind.handlers[name].hasOwnProperty('init')) {
                        bind.handlers[name].init(element, context);
                    }
                    bind.handlers[name].update(element, value, oldValue, context);
                    oldValues[name] = value;
                } else {
                    console.log('Trying to use undefined binding handler '+name+' on element', element);
                }
            }
        }
    }

	function bind(element, descriptor, context, component) {
		var oldValues = {},
		    controlsChildren = false,
            updateTicking = false;
        if(descriptor.is) {
            return upgradeElement(element, descriptor, context, component);
        }
        var binding = Observable.computed({
            read: function() {
                var names = Object.getOwnPropertyNames(descriptor) || [];
                var result = [];
                for(var i = 0, len = names.length; i < len; i++) {
                    var name = names[i],
                        value = descriptor[name]();
                    if(value && toString.call(value) === '[object Object]'
                        && ('get' in value) && ('subscribe' in value)) {
                        value = value.get();
                    }
                    result[result.length] = [name, value];
                }
                return result;
            }
        });
        binding.subscribe(function() {
            if(!updateTicking) {
                updateTicking = true;
                Dispatcher.requestAnimationFrame(function() {
                    if(binding) updateBindings(element, context, false, binding.get(), oldValues);
                    updateTicking = false;
                });
            }
        });
        updateBindings(element, context, true, binding.get(), oldValues);
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
        text: contentBindings.text,
        html: contentBindings.html,
        content: contentBindings.content,

        style: styleBindings.style,
        css: styleBindings.css,
        attr: styleBindings.attr,

        foreach: foreachBindings.foreach,

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
	}

	function getBindData(element) {
		var data = DOM.getData(element);
		return data._bind || (data._bind = {});
	}

	return bind;
});
