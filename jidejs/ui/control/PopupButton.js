/**
 * A PopupButton is a button that shows a Popup when pressed. That Popup might be a ContextMenu or it might be a more
 * complicated popup which allows further configuration of an action.
 * @module jidejs/ui/control/PopupButton
 * @extends module:jidejs/ui/control/Button
 */
define([
	'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/base/DOM', 'jidejs/ui/control/Button', 'jidejs/ui/Pos'
], function(Class, Observable, DOM, Button, Pos) {
	/**
	 * Creates a new PopupButton.
	 * @memberof module:jidejs/ui/control/PopupButton
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/PopupButton
	 */
	function PopupButton(config) {
		installer(this);

		var autoHideHandler = function(e) {
			if(this.popup && !DOM.isInElement(this.element, { x:e.pageX, y:e.pageY})
				&& !DOM.isInElement(this.popup.element, {x: e.pageX, y: e.pageY})) {
				this.showing = false;
			}
		}.bind(this);

		var popupBinding;
		Button.call(this, config);
		this.popupProperty.subscribe(function(event) {
			if(popupBinding) {
				popupBinding.dispose();
				popupBinding = null;
			}
			if(event.popup) {
				var popup = event.popup;
				popupBinding = popup.visibleProperty.bind(this.showingProperty);
				popup.autoHide = false;
			}
		}, this);
		if(this.popup) {
			popupBinding = this.popup.visibleProperty.bind(this.showingProperty);
			this.popup.autoHide = false;
		}

		this.showingProperty.subscribe(function(event) {
			var popup = this.popup, showing = event.value;
			if(showing && popup) {
				var box = DOM.getBoundingBox(this.element);
				var width = (box.right - box.left)+"px";
				if(popup.element.style.minWidth != width) {
					popup.element.style.minWidth = width;
				}
				popup.setLocation(this, Pos.BOTTOM);
			}
			if(showing) {
				document.body.addEventListener('click', autoHideHandler, true);
			} else {
				document.body.removeEventListener('click', autoHideHandler, true);
			}
		}, this);
		if(this.showing) {
			var popup = this.popup;
			if(popup) {
				var box = DOM.getBoundingBox(this.element);
				var width = (box.right - box.left)+"px";
				if(popup.element.style.minWidth != width) {
					popup.element.style.minWidth = width;
				}
				popup.setLocation(this, Pos.BOTTOM);
			}
			document.body.addEventListener('click', autoHideHandler, true);
		}
		this.on('action', function() {
			this.showing = !this.showing;
		});
		this.classList.add('jide-popupbutton');
	}
	Class(PopupButton).extends(Button).def({
		dispose: function() {
			Button.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The popup that should be displayed when the button is clicked.
		 * @type module:jidejs/ui/control/Popup
		 */
		popup: null,
		/**
		 * The popup that should be displayed when the button is clicked.
		 * @type module:jidejs/base/ObservableProperty
		 */
		popupProperty: null,
		/**
		 * `true`, when the popup is currently visible; `false`, otherwise.
		 * @type boolean
		 */
		showing: false,
		/**
		 * `true`, when the popup is currently visible; `false`, otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 */
		showingProperty: null
	});
	var installer = Observable.install(PopupButton, 'popup', 'showing');
	return PopupButton;
});