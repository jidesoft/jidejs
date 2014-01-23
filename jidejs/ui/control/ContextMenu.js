/**
 * A ContextMenu is a special type of Popup that can contain menu items and sub menus.
 *
 * @module jidejs/ui/control/ContextMenu
 * @extends jidejs/ui/control/Popup
 * @extends jidejs/ui/Container
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../../base/ObservableList', './../../base/DOM', './Popup',
	'./../Container', './../../base/Util', './Separator', './../register'
], function(Class, Observable, ObservableList, DOM, Popup, Container, _, Separator, register) {
	var isFocused = function(child) {
		return child.focused;
	};

	function findNextFocusedChild(children, dir) {
		var i = children.findIndex(isFocused);
		var len = children.length;
		var child;
		do {
			i += dir;
			if(i < 0) i = len - 1;
			else if(len <= i) i = 0;
		} while((child = children.get(i)) instanceof Separator);
		return child;
	}

	/**
	 * Creates a new ContextMenu.
	 * @memberof module:jidejs/ui/control/ContextMenu
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/ContextMenu
	 */
	function ContextMenu(config) {
		config = _.defaults(config || {}, {
			consumeAutoHidingEvents: false
		});
		Container.call(this);
		Popup.call(this, config);
		this.classList.add('jide-contextmenu');
		this.on({
			click: function() {
				this.visible = false;
			},
			mousemove: function(e) {
				var activeMenu = this['./ContextMenu.activeMenu'] || null;
				var children = this.children.toArray();
				var point = {x:e.pageX, y:e.pageY};
				for(var i = 0, len = children.length; i < len; i++) {
					var child = children[i];
					if(child.showingProperty) {
						var isInElement = DOM.isInElement(child.element, point);
						if(child.showing && (child != activeMenu || !isInElement)) {
							child.showing = false;
						} else if(isInElement) {
							child.showing = true;
							activeMenu = child;
							this['./ContextMenu.activeMenu'] = child;
						}
					}
				}
			},
			focus: function() {
				var child = this.children.get(0) || null;
				if(child) child.focus();
			},
			visible: function(value) {
				if(value === false) {
					var children = this.children.toArray();
					for(var i = 0, len = children.length; i < len; i++) {
						var child = children[i];
						if(child.showingProperty) {
							child.showing = false;
						}
					}
				}
			},
			key: {
				Right: function() {
					var i = this.children.findIndex(function(child) {
						return child.focused;
					});
					if(i !== -1) {
						var child = this.children.get(i);
						if(child.showingProperty && !child.showing) {
							child.showing = true;
							child.focus();
						}
					}
				},
				Left: function() {
					this.visible = false;
				},
				Down: function() {
					findNextFocusedChild(this.children, 1).focus();
				},
				Up: function() {
					findNextFocusedChild(this.children, -1).focus();
				}
			}
		});
	}
	Class(ContextMenu).extends(Popup).def({
		/**
		 * The list of menu items and menus shown by this ContextMenu.
		 * @type module:jidejs/base/ObservableList
		 */
		children: null,
		_insertChildAt: function(child, index) {
			var div = document.createElement('div');
			div.appendChild(child.element);
			var THIS = this;
			if(child.showingProperty) {
				child['./ContextMenu.showingHandler'] = child.showingProperty.subscribe(function(event) {
					if(event.value) {
						THIS['./ContextMenu.activeMenu'] = this;
					}
				});
				child['./ContextMenu.focusHandler'] = child.focusedProperty.subscribe(function(event) {
					if(event.value) THIS['./ContextMenu.activeMenu'] = this;
				});
			}
			DOM.insertElementAt(this.element, div, index);
		},

		_removeChild: function(child) {
			this.element.removeChild(child.element.parentNode);
			if(child.showingProperty) {
				child['./ContextMenu.showingHandler'].dispose();
				delete child['./ContextMenu.showingHandler'];
				child['./ContextMenu.focusHandler'].dispose();
				delete child['./ContextMenu.focusHandler'];
			}
		}
	});
    register('jide-contextmenu', ContextMenu, Popup, [], []);
	return ContextMenu;
});