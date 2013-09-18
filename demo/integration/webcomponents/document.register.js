
(function(){

	var win = window,
		doc = document,
		tags = {},
		tokens = [],
		domready = false,
		mutation = win.MutationObserver || win.WebKitMutationObserver ||  win.MozMutationObserver,
		_createElement = doc.createElement,
		register = function(name, options){
			name = name.toLowerCase();
			var base,
				token = name,
				options = options || {};

			if (!options.prototype) {
				throw new Error('Missing required prototype property for registration of the ' + name + ' element');
			}

			if (options.prototype && !('setAttribute' in options.prototype)) {
				throw new TypeError("Unexpected prototype for " + name + " element - custom element prototypes must inherit from the Element interface");
			}

			if (options.extends){
				var ancestor = (tags[options.extends] || _createElement.call(doc, options.extends)).constructor;
				if (ancestor != (win.HTMLUnknownElement || win.HTMLElement)) {
					base = options.extends;
					token = '[is="' + name + '"]';
				}
			}

			if (tokens.indexOf(token) == -1) tokens.push(token);

			var tag = tags[name] = {
				base: base,
				'constructor': function(){
					return doc.createElement(name);
				},
				_prototype: doc.__proto__ ? null : unwrapPrototype(options.prototype),
				'prototype': options.prototype
			};

			tag.constructor.prototype = tag.prototype;

			if (domready) query(doc, name).forEach(function(element){
				upgrade(element, true);
			});

			return tag.constructor;
		};

	function unwrapPrototype(proto){
		var definition = {},
			names = Object.getOwnPropertyNames(proto),
			index = names.length;
		if (index) while (index--) {
			definition[names[index]] = Object.getOwnPropertyDescriptor(proto, names[index]);
		}
		return definition;
	}

	var typeObj = {};
	function typeOf(obj) {
		return typeObj.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	}

	function clone(item, type){
		var fn = clone[type || typeOf(item)];
		return fn ? fn(item) : item;
	}
	clone.object = function(src){
		var obj = {};
		for (var key in src) obj[key] = clone(src[key]);
		return obj;
	};
	clone.array = function(src){
		var i = src.length, array = new Array(i);
		while (i--) array[i] = clone(src[i]);
		return array;
	};

	var unsliceable = ['number', 'boolean', 'string', 'function'];
	function toArray(obj){
		return unsliceable.indexOf(typeOf(obj)) == -1 ?
			Array.prototype.slice.call(obj, 0) :
			[obj];
	}

	function query(element, selector){
		return element && selector && selector.length ? toArray(element.querySelectorAll(selector)) : [];
	}

	function getTag(element){
		return element.getAttribute ? tags[element.getAttribute('is') || element.nodeName.toLowerCase()] : false;
	}

	function manipulate(element, fn){
		var next = element.nextSibling,
			parent = element.parentNode,
			frag = doc.createDocumentFragment(),
			returned = fn.call(frag.appendChild(element), frag) || element;
		if (next){
			parent.insertBefore(returned, next);
		}
		else{
			parent.appendChild(returned);
		}
	}

	function upgrade(element){
		if (!element._elementupgraded) {
			var tag = getTag(element);
			if (tag) {
				if (doc.__proto__) element.__proto__ = tag.prototype;
				else Object.defineProperties(element, tag._prototype);
				element.constructor = tag.constructor;
				element._elementupgraded = true;
				if (element.readyCallback) element.readyCallback.call(element, tag.prototype);
				if (element.insertedCallback && doc.documentElement.contains(element)) element.insertedCallback.call(element, tag.prototype);
			}
		}
	}

	function inserted(element, event){
		var tag = getTag(element);
		if (tag){
			if (!element._elementupgraded) upgrade(element);
			else {
				if (doc.documentElement.contains(element) && element.insertedCallback) {
					element.insertedCallback.call(element);
				}
				insertChildren(element);
			}
		}
		else insertChildren(element);
	}

	function insertChildren(element){
		if (element.childNodes.length) query(element, tokens).forEach(function(el){
			if (!el._elementupgraded) upgrade(el);
			if (el.insertedCallback) el.insertedCallback.call(el);
		});
	}

	function removed(element){
		if (element._elementupgraded) {
			if (element.removedCallback) element.removedCallback.call(element);
			if (element.childNodes.length) query(element, tokens).forEach(function(el){
				removed(el);
			});
		}
	}

	function addObserver(element, type, fn){
		if (!element._records) {
			element._records = { inserted: [], removed: [] };
			if (mutation){
				element._observer = new mutation(function(mutations) {
					parseMutations(element, mutations);
				});
				element._observer.observe(element, {
					subtree: true,
					childList: true,
					attributes: !true,
					characterData: false
				});
			}
			else ['Inserted', 'Removed'].forEach(function(type){
				element.addEventListener('DOMNode' + type, function(event){
					event._mutation = true;
					element._records[type.toLowerCase()].forEach(function(fn){
						fn(event.target, event);
					});
				}, false);
			});
		}
		if (element._records[type].indexOf(fn) == -1) element._records[type].push(fn);
	}

	function removeObserver(element, type, fn){
		var obj = element._records;
		if (obj && fn){
			obj[type].splice(obj[type].indexOf(fn), 1);
		}
		else{
			obj[type] = [];
		}
	}

	function parseMutations(element, mutations) {
		var diff = { added: [], removed: [] };
		mutations.forEach(function(record){
			record._mutation = true;
			for (var z in diff) {
				var type = element._records[(z == 'added') ? 'inserted' : 'removed'],
					nodes = record[z + 'Nodes'], length = nodes.length;
				for (var i = 0; i < length && diff[z].indexOf(nodes[i]) == -1; i++){
					diff[z].push(nodes[i]);
					type.forEach(function(fn){
						fn(nodes[i], record);
					});
				}
			}
		});
	}

	function fireEvent(element, type, data, options){
		options = options || {};
		var event = doc.createEvent('Event');
		event.initEvent(type, 'bubbles' in options ? options.bubbles : true, 'cancelable' in options ? options.cancelable : true);
		for (var z in data) event[z] = data[z];
		element.dispatchEvent(event);
	}

	var polyfill = !doc.register;
	if (polyfill) {
		doc.register = register;

		doc.createElement = function createElement(tag){
			var base = tags[tag] ? tags[tag].base : null;
			element = _createElement.call(doc, base || tag);
			if (base) element.setAttribute('is', tag);
			upgrade(element);
			return element;
		};

		function changeAttribute(attr, value, method){
			var tag = getTag(this),
				last = this.getAttribute(attr);
			method.call(this, attr, value);
			if (tag && last != this.getAttribute(attr)) {
				if (this.attributeChangedCallback) this.attributeChangedCallback.call(this, attr, last);
			}
		};

		var setAttr = Element.prototype.setAttribute;
		Element.prototype.setAttribute = function(attr, value){
			changeAttribute.call(this, attr, value, setAttr);
		};

		removeAttr = Element.prototype.removeAttribute;
		Element.prototype.removeAttribute = function(attr, value){
			changeAttribute.call(this, attr, value, removeAttr);
		};

		var initialize = function (){
			addObserver(doc.documentElement, 'inserted', inserted);
			addObserver(doc.documentElement, 'removed', removed);

			if (tokens.length) query(doc, tokens).forEach(function(element){
				upgrade(element);
			});

			domready = true;
			fireEvent(doc.body, 'WebComponentsReady');
			fireEvent(doc.body, 'DOMComponentsLoaded');
			fireEvent(doc.body, '__DOMComponentsLoaded__');
		};

		if (doc.readyState == 'complete') initialize();
		else doc.addEventListener(doc.readyState == 'interactive' ? 'readystatechange' : 'DOMContentLoaded', initialize);
	}

	doc.register.__polyfill__ = {
		query: query,
		clone: clone,
		typeOf: typeOf,
		toArray: toArray,
		fireEvent: fireEvent,
		manipulate: manipulate,
		addObserver: addObserver,
		removeObserver: removeObserver,
		observerElement: doc.documentElement,
		_parseMutations: parseMutations,
		_insertChildren: window.CustomElements ? window.CustomElements.upgradeAll : insertChildren,
		_inserted: inserted,
		_createElement: _createElement,
		_polyfilled: polyfill || (window.CustomElements && !window.CustomElements.hasNative)
	};

})();