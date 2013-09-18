/// @private
/// @internal
/// This file is not intended as a public API and should not be used outside of jide.js yet.
define('jidejs/ui/Template', [
	'jidejs/base/Class',
	'jidejs/ui/bind'
], function(Class, bind) {
	"use strict";

	function Template(frag) {
		this.content = frag;
	}
	Class(Template).def({
		clone: function() {
			var element = this.content.cloneNode(true);
			var result = {
				element: element,
				slots: {},

				render: function(data, context) {
					if(data) {
						bind.to(this.element, data, context); // memory leak: no way to dispose memory
					}
					return this.element;
				}
			};
			for(var slots = element.querySelectorAll('[data-slot]'), i = 0, len = slots.length; i < len; i++) {
				var el = slots[i],
					slotName = el.getAttribute('data-slot');
				if(slotName) {
					result.slots[slotName] = el;
				}
			}

			return result;
		}
	});

	return {
		fromString: function(content) {
			var div = document.createElement('div');
			div.innerHTML = content;
			var frag = document.createDocumentFragment();
			for(var current = div.firstElementChild; current; current = current.nextElementSibling) {
				frag.appendChild(current);
			}
			return new Template(frag);
		},

		fromElement: function(element) {
			if('content' in element) { // support HTML5 template tag
				return new Template(element.content);
			}
			var frag = document.createDocumentFragment();
			frag.appendChild(element);
			return new Template(frag);
		},

		fromId: function(id) {
			var element = document.getElementById(id);
			if(element) return this.fromElement(element);
			return null;
		},

		select: function(selector) {
			var element = document.querySelector(selector);
			if(element) return this.fromElement(element);
			return null;
		}
	};
});