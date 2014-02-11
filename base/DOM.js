/// @internal
/// @private
/// This class is currently not considered to be part of the public API.
define([
	'./Util', './Observable', './Disposer'
], function(_, Observable, Disposer) {
	"use strict";
	var dataStore = {}, guidCounter = 0, expando = "data-jide-data";

	var vendors = ['ms', 'moz', 'webkit', 'o'], now = window.performance && performance.now && 'now';
	var requestAnimationFrame = null, cancelAnimationFrame = null;

	// requestAnimationFrame polyfill
	for(var i = 0; i < vendors.length && !requestAnimationFrame; ++i) {
		requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'] || null;
		cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame'] || null;
	}
	if(!requestAnimationFrame) {
		var lastTime = 0;
		requestAnimationFrame = function(callback, element) {
			var currTime = +new Date();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		}
	}
	if(!cancelAnimationFrame) {
		cancelAnimationFrame = function(id) {
			clearTimeout(id);
		}
	}

	// sometimes we'll need to know when we're dealing with IE9 to workaround typical, well known, bugs
	var isIE9 = (function() {
		var div = document.createElement('div'), iElements = div.getElementsByTagName('i');
		div.innerHTML = '<!--[if IE 9]><i></i><![endif]-->';
		return !!iElements[0];
	}());

	var getStyleSheet = (function() {
		var styleSheet;
		return function() {
			if(styleSheet) return styleSheet;

			var style = document.createElement('style');
			document.getElementsByTagName('head')[0].appendChild(style);
			if (!window.createPopup) { /* For Safari */
				style.appendChild(document.createTextNode(''));
			}
			styleSheet = document.styleSheets[document.styleSheets.length - 1];
			return styleSheet;
		};
	}());

	function attributeBinder(element, attributeName, value) {
		element.setAttribute(attributeName, Observable.is(value) ? value.get() : value.toString());
	}

	var DOM = {
		create: function(name, properties, disposer) {
			var e = _.isString(name) ? document.createElement(name) : name;
			if(properties) {
				DOM.configure(e, properties, disposer);
			}
			return e;
		},

		createSvg: function(name, properties, disposer) {
			var e = _.isString(name) ? document.createElementNS('http://www.w3.org/2000/svg', name) : name;
			if(properties) {
				DOM.configure(e, properties, disposer);
			}
			return e;
		},

		configure: function(element, properties, disposer) {
			_.copy(properties, function(attributeName, value) {
				switch(attributeName) {
					case 'children':
						DOM.appendChildren(element, value);
						break;
					case 'data':
						_.extends(DOM.getData(element), value);
						break;
					case 'style':
						_.extends(element.style, value);
						break;
					default:
						if(Observable.is(value)) {
							var disposable = DOM.bindProperty(element, attributeName, value);
							var data = DOM.getData(element);
							if(!data.disposer) {
								data.disposer = new Disposer();
							}
							data.disposer.add(disposable);
							if(disposer) {
								disposer.add(disposable);
							}
						} else {
							element.setAttribute(attributeName, value);
						}
						break;
				}
			});
		},

		bindProperty: function(element, attributeName, property) {
			element.setAttribute(attributeName, property.get());
			return property.subscribe(attributeBinder.bind(null, element, attributeName, property));
		},

		appendChildren: function(element, children) {
			var frag = document.createDocumentFragment();
			children.forEach(function(child) {
				frag.appendChild(child);
			});
			element.appendChild(frag);
		},

		remove: function(element) {
			if(DOM.hasData(element)) {
				var data = DOM.getData(element);
				if(data.disposer) {
					data.disposer.dispose();
					data.disposer = null;
				}
			}
			element.parentNode.removeChild(element);
		},

		getData: function(element) {
			var guid = element[expando];
			if(!guid) {
				guid = element[expando] = guidCounter++;
				dataStore[guid] = {};
			}
			return dataStore[guid];
		},

		hasData: function(element) {
			return element[expando];
		},

		removeData: function(element) {
			var guid = element[expando];
			if(!guid) return;
			delete dataStore[guid];
			try {
				delete element[expando];
			} catch(e) {
				if(element.removeAttribute) {
					element.removeAttribute(expando);
				}
			}
		},

		setCTM: function(e, matrix) {
			var transformMatrix = 'matrix('+matrix.a+' '+matrix.b+' '+matrix.c+' '+matrix.d+' '+matrix.e+' '+matrix.f+')';
			if('transform' in e) {
				e.setAttribute('transform', transformMatrix);
			} else {
				e.style.transform = transformMatrix;
			}
		},

		getStyle: function(e, styleProperty) {
			if(window.getComputedStyle) {
				return document.defaultView.getComputedStyle(e).getPropertyValue(styleProperty);
			}
			if(e.currentStyle) {
				return e.currentStyle[styleProperty];
			}
			return null;
		},

		measure: function(e, noClone) {
			var result = {
				width:e.offsetWidth,
				height:e.offsetHeight
			};

			if(result.width !== 0 || result.height !== 0) {
				return result;
			}

			var style = e.style;
			var position = style.position;
			var visibility = style.visibility;
			var display = style.display;

			if(style.position !== 'fixed') style.position = 'absolute';
			style.visibility = 'hidden';
			if(display === 'none' || display === '') style.display = 'inline-block';

			result.width = e.offsetWidth;
			result.height = e.offsetHeight;

			if(!noClone && (result.height === 0 || result.width === 0)) {
				var clone = e.cloneNode(true);
				document.body.appendChild(clone);
				result.width = clone.offsetWidth;
				result.height = clone.offsetHeight;
				document.body.removeChild(clone);
			}

			style.position = position;
			style.visibility = visibility;
			style.display = display;

			return result;
		},

		measureCopy: function(e) {
			var clonedNode = e.cloneNode(true);
			document.body.appendChild(clonedNode);
			var result = DOM.measure(clonedNode, false);
			document.body.removeChild(clonedNode);
			return result;
		},

		requestAnimationFrame: function(callback, e) {
			return requestAnimationFrame(callback, e);
		},
		cancelAnimationFrame: function(id) {
			cancelAnimationFrame(id);
		},

		insertElementAt: function(parent, node, index) {
			parent.insertBefore(node, parent.childNodes[index] || null);
		},

		removeChildren: function(parent) {
			var child;
			while(child = parent.firstChild) {
				//parent.removeChild(child);
				DOM.remove(child);
			}
		},

		getBoundingBox: function(el) {
			var rect = el.getBoundingClientRect();
			var scrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
			var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
			return {
				left: rect.left+scrollLeft,
				top: rect.top + scrollTop,
				right: rect.right + scrollLeft,
				bottom: rect.bottom + scrollTop
			};
		},

		isInElement: function(el, point) {
			var rect = this.getBoundingBox(el);
			return rect.left < point.x && rect.top < point.y && point.x < rect.right && point.y < rect.bottom;
		},

		addStylesheetRules: function(ruleDeclarations) {
			var styleSheet = getStyleSheet();

			for(var selector in ruleDeclarations) {
				if(ruleDeclarations.hasOwnProperty(selector)) {
					var rules = '';
					var declaration = ruleDeclarations[selector];
					for(var property in declaration) {
						if(declaration.hasOwnProperty(property)) {
							rules += property+':'+declaration[property]+';\n';
						}
					}
					if(styleSheet.insertRule) {
						styleSheet.insertRule(selector + '{'+rules+'}', styleSheet.cssRules.length);
					} else {
						styleSheet.addRule(selector, rules, -1);
					}
				}
			}
		},

		addStylesheetRule: function(selector, rules) {
			var styleSheet = getStyleSheet();
			var index;
			if(styleSheet.insertRule) {
				index = styleSheet.insertRule(selector+'{'+rules+'}', styleSheet.cssRules.length);
			} else {
				index = styleSheet.addRule(selector, rules, -1);
			}
			return styleSheet.cssRules[index];
		},

		setTextContent: function(element, text) {
			var textNode = element.firstChild;
			if(!textNode || textNode.nodeType !== 3 || textNode.nextSibling) {
				DOM.removeChildren(element);
				element.appendChild(document.createTextNode(text));
			} else {
				textNode.data = text;
			}
			if(isIE9 >= 9) { // force refresh to avoid IE9 rendering bug
				element.style.zoom = element.style.zoom;
			}
		}
	};

	if('scrollIntoViewIfNeeded' in Element.prototype) {
		DOM.scrollIntoViewIfNeeded = function(element, centerIfNeeded) {
			element.scrollIntoViewIfNeeded(centerIfNeeded);
		}
	} else {
		DOM.scrollIntoViewIfNeeded = function (element, centerIfNeeded) {
			// implementation from
			// https://gist.github.com/hsablonniere/2581101
			centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

			var parent = element.parentNode,
				parentComputedStyle = window.getComputedStyle(parent, null),
				parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
				parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
				overTop = element.offsetTop - parent.offsetTop < parent.scrollTop,
				overBottom = (element.offsetTop - parent.offsetTop + element.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
				overLeft = element.offsetLeft - parent.offsetLeft < parent.scrollLeft,
				overRight = (element.offsetLeft - parent.offsetLeft + element.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
				alignWithTop = overTop && !overBottom;

			if ((overTop || overBottom) && centerIfNeeded) {
				parent.scrollTop = element.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + element.clientHeight / 2;
			}

			if ((overLeft || overRight) && centerIfNeeded) {
				parent.scrollLeft = element.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + element.clientWidth / 2;
			}

			if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
				element.scrollIntoView(alignWithTop);
			}
		};
	}

	// use a weak hash map for the data link when possible to minimize the risk of memory leaks
	var hasWeakMap = typeof WeakMap !== 'undefined';
	if(hasWeakMap) {
		dataStore = new WeakMap();
		DOM.getData = function(element) {
			var data = dataStore.get(element);
			if(!data) {
				data = {};
				dataStore.set(element, data);
			}
			return data;
		};

		DOM.hasData = function(element) {
			return !!dataStore.get(element);
		};

		DOM.removeData = function(element) {
			dataStore.delete(element);
		};
	}

	return DOM;
});