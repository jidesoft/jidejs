/**
 * A Popup can be used to show additional information to users. It is displayed above all other controls.
 *
 * As opposed to all other components of jide.js, you do not need to manually add the Popup to the DOM structure. The
 * Popup itself will manage its position and presence in the DOM.
 *
 * @module jidejs/ui/control/Popup
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../Control', './PopupSkin',
	'./../../base/DOM', './../Pos', './../../base/Util', './../../base/Window', './../register'
], function(Class, Observable, Control, PopupSkin, DOM, Pos, _, Window, register) {
	/**
	 * Creates a new Popup.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/Popup
     * @extends module:jidejs/ui/Control
     *
     * @param {object} config The configuration.
	 */
	var exports = function Popup(config) {
		installer(this);
		config = config || {};
		Control.call(this, _.defaults(config, {tabIndex: 0}));
		this.classList.add('jide-popup');
	};
	Class(exports).extends(Control).def(/** @lends module:jidejs/ui/control/Popup# */{
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The content that the popup should display when it is visible.
		 *
		 * @type module:jidejs/ui/Component
		 */
		content: null,
		/**
		 * The content that the popup should display when it is visible.
		 * @type module:jidejs/base/ObservableProperty
		 */
		contentProperty: null,
		/**
		 * When `true` the popup will close automatically if the user moves the focus away from the popup.
		 * @type boolean
		 */
		autoHide: true,
		/**
		 * When `true` the popup will close automatically if the user moves the focus away from the popup.
		 * @type module:jidejs/base/ObservableProperty
		 */
		autoHideProperty: null,
		/**
		 * `true`, if the popup is currently visible; `false`, otherwise.
		 * @type boolean
		 */
		visible: false,
		/**
		 * `true`, if the popup is currently visible; `false`, otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 */
		visibleProperty: null,
		/**
		 * When `true` the popup will consume the event that caused it to {@link module:jidejs/ui/control/Popup#autoHide}.
		 *
		 * @type boolean
		 */
		consumeAutoHidingEvents: true,
		/**
		 * @type module:jidejs/base/ObservableProperty
		 */
		consumeAutoHidingEventsProperty: null,
		/**
		 * The owner of the popup.
		 * @type module:jidejs/ui/Component
		 */
		owner: null,

		/**
		 * Specifies the location of the popup.
		 *
		 * @example Absolute positioning
		 * myPopup.setLocation(myOwner, 200, 200); // shows the popup at location (200,200)
		 *
		 * @example Relative positioning
		 * myPopup.setLocation(myOwner, Pos.BOTTOM); // show the popup directly below its owner.
		 *
		 * @param {module:jidejs/ui/Component} owner The owner of the popup.
		 * @param {number|module:jidejs/ui/Pos} x The x coordinate or relative position of the popup.
		 * @param {number?} y The y coordinate of the popup. Must not be given if the value of `x` is a relative position.
		 * @param {boolean?} keepInWindow If `true`, the popup might end up at a slightly different location to make sure
		 * 		it is completely visible within the current window bounds. Defaults to **true**. Only available when parameters
		 * 		owner, x and y are supplied as well.
		 */
		setLocation: function(owner, x, y, keepInWindow) {
			this.owner = owner;
			var style = this.element.style;
			var doc = document.documentElement, body = document.body;
			var left = (doc && doc.scrollLeft || body && body.scrollLeft || 0);
			var top = (doc && doc.scrollTop  || body && body.scrollTop  || 0);
			if(typeof y !== 'undefined') {
				if(arguments.length === 3 || keepInWindow) {
					var size = this.measure();
					style.top = Math.min(y, (top+Window.height) - size.height) + "px";
					style.left = Math.min(x, (left+Window.width) - size.width) + "px";
				} else {
					style.top = y + 'px';
					style.left = x + 'px';
				}
			} else {
				var bounds = DOM.getBoundingBox(owner.element);
				switch(x) {
					case Pos.TOP:
						var size = this.measure();
						this.setLocation(owner,
							left+bounds.left,
							top+(bounds.top - size.height)
						);
						break;
					case Pos.BOTTOM:
						var size = this.measure();
						this.setLocation(owner,
							bounds.left + size.width < Window.width ? bounds.left : (bounds.right - size.width),
							bounds.bottom
						);
						break;
					case Pos.RIGHT:
						this.setLocation(owner,
							bounds.right,
							bounds.top
						);
						break;
					case Pos.LEFT:
						var size = this.measure();
						this.setLocation(owner,
							(bounds.left - size.width),
							bounds.top
						);
						break;
					case Pos.CENTER:
						var size = this.measure();
						this.setLocation(owner,
							(bounds.left + (bounds.right-bounds.left)/2-(size.width/2)),
							(bounds.top + (bounds.bottom-bounds.top)/2-(size.height/2))
						);
						break;
					default:
						throw new Error('Illegal parameter value for position: '+x);
				}
			}
		},

		/**
		 * Specifies the location of the popup and then makes it visible.
		 * @param {module:jidejs/ui/Component} owner The owner of the popup.
		 * @param {number|module:jidejs/ui/Pos} x The x coordinate or relative position of the popup.
		 * @param {number?} y The y coordinate of the popup. Must not be given if the value of `x` is a relative position.
		 * @see module:jidejs/ui/control/Popup#setLocation
		 */
		show: function(owner, x, y) {
			this.setLocation(owner, x, y);
			this.visible = true;
		}
	});
	var installer = Observable.install(exports, 'content', 'autoHide', 'visible', 'consumeAutoHidingEvents');
    exports.Skin = PopupSkin;
    register('jide-popup', exports, Control, ['content', 'autoHide', 'visible', 'consumeAutoHidingEvents'], ['show', 'setLocation']);
	return exports;
});