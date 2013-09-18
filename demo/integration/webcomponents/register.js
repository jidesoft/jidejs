define(['jidejs/ui/control/HTMLView'], function(HTMLView) {
	"use strict";

	function register(name, Component, proto) {
		var elementPrototype = Object.create(((proto && proto.prototype) || HTMLElement.prototype), {
			// define callbacks for use with document.register
			readyCallback: {
				value: function(proto) {
					// create config from attributes
					var config = { element: this };
					for(var i = 0, attribs = this.attributes, len = attribs.length; i < len; i++) {
						var attribute = attribs[i];
						config[attribute.nodeName] = attribute.nodeValue;
					}
					// copy children to a save place
					var frag = document.createDocumentFragment();
					while(this.firstElementChild) {
						frag.appendChild(this.firstElementChild);
					}
					// create component
					this.component = new Component(config);
					if(frag.childNodes.length > 0) {
						if('children' in this.component) {
							while(frag.firstChild) {
								var child = frag.firstChild;
								if(child.component) {
									this.component.children.add(child.component);
								} else {
									this.component.children.add(new HTMLView({element: child}));
								}
							}
						} else if(('content' in this.component) && frag.length === 1) {
							var child = frag.childNodes[0];
							if(child.component) {
								this.component.content = child;
							} else {
								this.component.content = new HTMLView({element: child});
							}
						} else if('content' in this.component) {
							var div = document.createElement('div');
							div.appendChild(frag);
							this.component.content = new HTMLView({element: div});
						} else {
							console.log('Illegal children in tag', this)
						}
					}
				}
			},

			attributeChangedCallback: {
				value: function(attr, oldValue) {
					this.component[attr] = this.getAttribute(attr);
				}
			}
		});

		document.register('jide-'+name, {
			'prototype': elementPrototype
		});
	}

	return register;
});