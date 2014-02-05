/**
 * A PopupButton is a button that shows a Popup when pressed. That Popup might be a ContextMenu or it might be a more
 * complicated popup which allows further configuration of an action.
 * @module jidejs/ui/control/PopupButton
 * @extends module:jidejs/ui/control/Button
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../../base/DOM', './Button', './../Pos',
    './../Skin', './../register'
], function(Class, Observable, DOM, Button, Pos, Skin, register) {
	/**
	 * Creates a new PopupButton.
	 * @memberof module:jidejs/ui/control/PopupButton
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/PopupButton
	 */
	function PopupButton(config) {
		installer(this);
        Button.call(this, config);
		this.classList.add('jide-popupbutton');
	}
	Class(PopupButton).extends(Button).def({
		dispose: function() {
            if(this.popup) this.popup.dispose();
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
    PopupButton.Skin = Skin.create(Button.Skin, {
        maybeHidePopup: function(e) {
            if(this.component.popup && !DOM.isInElement(this.element, { x:e.pageX, y:e.pageY})
                && !DOM.isInElement(this.component.popup.element, {x: e.pageX, y: e.pageY})) {
                this.component.showing = false;
            }
        },

        togglePopupVisibility: function(event) {
            var popup = this.component.popup, showing = event.value;
            popup.autoHide = false;
            if(showing && popup) {
                var box = DOM.getBoundingBox(this.element);
                var width = (box.right - box.left)+"px";
                if(popup.element.style.minWidth != width) {
                    popup.element.style.minWidth = width;
                }
                popup.show(this.component, Pos.BOTTOM);
            }
            if(showing) {
                document.body.addEventListener('click', this.autoHideHandler, true);
            } else {
                if(popup) popup.visible = false;
                document.body.removeEventListener('click', this.autoHideHandler, true);
            }
        },

        install: function() {
            this.autoHideHandler = this.maybeHidePopup.bind(this);
            Button.Skin.prototype.install.call(this);

            this.managed(this.component.showingProperty.subscribe(this.togglePopupVisibility).bind(this));
            if(this.component.showing) {
                var popup = this.popup;
                if(popup) {
                    var box = DOM.getBoundingBox(this.element);
                    var width = (box.right - box.left)+"px";
                    if(popup.element.style.minWidth != width) {
                        popup.element.style.minWidth = width;
                    }
                    popup.show(this, Pos.BOTTOM);
                }
                document.body.addEventListener('click', this.autoHideHandler, true);
            }
            this.managed(this.component.on('action', this.toggleShowing).bind(this));
        },

        toggleShowing: function() {
            this.component.showing = !this.component.showing;
        }
    });
    register('jide-popupbutton', PopupButton, Button, ['popup', 'showing'], []);
	return PopupButton;
});