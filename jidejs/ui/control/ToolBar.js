/**
 * A ToolBar is a container for Buttons, TextFields and other components.
 *
 * It allows the user to navigate between its items using the `left` and `right` key of her keyboard.
 *
 * @module jidejs/ui/control/ToolBar
 * @extends module:jidejs/ui/Control
 * @extends module:jidejs/ui/Container
 */
define([
	'./../../base/Class', './../../base/DOM', './../Pos', './../layout/HBox', './../Control',
	'./../Skin'
], function(Class, DOM, Pos, HBox, Control, Skin) {
	function ToolBarSkin(toolBar, el) {
		Skin.call(this, toolBar);
		if(typeof el === 'undefined') el = document.createElement('div');
		this.element = el;
	}
	Class(ToolBarSkin).extends(Skin);

	/**
	 * Creates a new ToolBar.
	 * @memberof module:jidejs/ui/control/ToolBar
	 * @param {object} config The configuration.
	 * @param {Array} config.children The controls that should be displayed in the ToolBar.
	 * @constructor
	 * @alias module:jidejs/ui/control/ToolBar
	 */
	function ToolBar(config) {
		config = config || {};
		if(!config.skin) config.skin = new ToolBarSkin(this, config.element);
		this.content = new HBox({
			element: config.skin.element,
			fillHeight: true,
			spacing: 3,
			parent: this
		});
		Control.call(this, config);
		this.classList.add('jide-toolbar');
		var children = this.children;
		this.keyMap.on({key:'Right'}, function() {
			var i = children.findIndex(function(child) {
				return child.focused;
			});
			var child = children.get(i + 1 < children.length ? i + 1 : 0);
			child.focus();
		});
		this.keyMap.on({key:'Left'}, function() {
			var i = children.findIndex(function(child) {
				return child.focused;
			});
			var child = children.get(i === 0 ? children.length - 1 : i -1);
			child.focus();
		});
	}

	Class(ToolBar).extends(Control).def({
		/**
		 * An ObservableList of controls that should be displayed within the ToolBar.
		 *
		 * @type module:jidejs/base/ObservableList
		 */
		get children() {
			return this.content.children;
		}
	});

	return ToolBar;
	});