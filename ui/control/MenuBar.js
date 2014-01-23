/**
 * A MenuBar can be used to display a number of menus.
 *
 * Even though almost every desktop applications have a MenuBar, please make sure that your web application really
 * needs one. Using a MenuBar in a web application is much less common.
 *
 * @module jidejs/ui/control/MenuBar
 * @extends module:jidejs/ui/Control
 * @extends module:jidejs/ui/Container
 */
define([
	'./../.././Class', './../.././DOM', './../Pos', './../layout/HBox', './../Control',
	'./../Skin', './Separator', './../register'
], function(Class, DOM, Pos, HBox, Control, Skin, Separator, register) {
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

	function MenuBarSkin(menuBar, el) {
		Skin.call(this, menuBar);
		if(typeof el === 'undefined') el = document.createElement('div');
		this.element = el;
	}
	Class(MenuBarSkin).extends(Skin);

	/**
	 * Creates a new MenuBar.
	 *
	 * @memberof module:jidejs/ui/control/MenuBar
	 * @param {object} config The configuration.
	 * @param {Array} config.children The array of menus that belong to this MenuBar.
	 * @constructor
	 * @alias module:jidejs/ui/control/MenuBar
	 */
	function MenuBar(config) {
		config = config || {};
		if(!config.skin) config.skin = new MenuBarSkin(this, config.element);
		this.element = config.skin.element;
		this.content = new HBox({
			element: config.skin.element,
			fillHeight: true,
			spacing: 0,
			parent: this
		});
		var THIS = this;
		var activeMenu = null, lastShown = null;
		var showingHandler = function(event) {
			if(event.value) {
				activeMenu = this;
			} else {
				activeMenu = null;
				lastShown = this;
			}
		};
		var clickHandler = function() {
			if(!this.showing && (!lastShown || lastShown != this)) {
				this.show(Pos.BOTTOM);
			} else {
				this.showing = false;
			}
			lastShown = null;
		};
		var mouseOverHandler = function() {
			if(!activeMenu) {
				lastShown = null;
			} else if(activeMenu != this) {
				activeMenu.showing = false;
				activeMenu = this;
				this.show(Pos.BOTTOM);
			}
		};
		this.children.on('change', function(event) {
			var child, changes = event.enumerator();
			while(changes.moveNext()) {
				var change = changes.current;
				if(change.isInsert || change.isUpdate) {
					child = change.newValue;
					if(child.showingProperty) {
						child['./MenuBar.handlers'] = child.on({
							showing: showingHandler,
							click: clickHandler,
							mouseover: mouseOverHandler
						});
					}
				}
				if(change.isDelete || change.isUpdate) {
					child = change.oldValue;
					child['./MenuBar.handlers'].dispose();
					delete child['./MenuBar.handlers'];
				}
			}
		});
		Control.call(this, config);
		this.classList.add('jide-menubar');
		var children = this.children;
		this.on({
			key: {
				Left: function() {
					findNextFocusedChild(children, -1).focus();
				},
				Right: function() {
					findNextFocusedChild(children, 1).focus();
				},
				Down: function() {
					var i = children.findIndex(function(child) {
						return child.focused;
					});
					var child = children.get(i);
					if(child.showingProperty) {
						child.show(Pos.BOTTOM);
					}
				}
			}
		});
	}

	Class(MenuBar).extends(Control).def({
		/**
		 * An ObservableList of menus that should be shown in this MenuBar.
		 *
		 * @type module:jidejs/base/ObservableList
		 */
		get children() {
			return this.content.children;
		}
	});

    register('jide-menubar', MenuBar, Control, [], []);

	return MenuBar;
});