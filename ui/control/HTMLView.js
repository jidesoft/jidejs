/**
 * The HTMLView can be used to embed HTML formatted content in a hierarchy of jide.js components.
 *
 * @module jidejs/ui/control/HTMLView
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../Control', './../Skin', './../../base/Util', './../register'
], function(Class, Observable, Control, Skin, _, register) {
	function HTMLViewSkin(htmlView, el) {
		this.element = el || document.createElement("div");
		Skin.call(this, htmlView, this.element);
	}

	Class(HTMLViewSkin).extends(Skin).def({
		install: function() {
			Skin.prototype.install.call(this);
			this._bindings = this.component.contentProperty.subscribe(function(event) {
				var value = event.value;
				if(_.isString(value)) {
					this.element.innerHTML = value;
				} else {
					var el = this.element;
					while(el.childNodes.length) {
						el.removeChild(el.childNodes[0]);
					}
					el.appendChild(value);
				}
			});
			var content = this.component.content;
			if(content) {
				if(_.isString(content)) {
					this.element.innerHTML = content;
				} else {
					while(this.element.firstChild) this.element.removeChild(this.element.firstChild);
					this.element.appendChild(content);
				}
			}
		},

		dispose: function() {
			this._bindings.dispose();
			this._bindings = null;
		}
	});

	/**
	 * Creates a new HTMLView control.
	 *
	 * @example
	 * 	var myText = new HTMLView({
	 * 	    content: '<b>Hello from HTMLView!</b>'
	 * 	});
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/HTMLView
     * @extends module:jidejs/ui/Control
     *
     * @param {object} config The configuration.
	 */
	var exports = function HTMLView(config) {
		config = config || {};
		if(!config.skin) {
			config.skin = new HTMLView.Skin(this, config.element);
		}
		installer(this);
		Control.call(this, config);
	};
	Class(HTMLView).extends(Control).def(/** @lends module:jidejs/ui/control/HTMLView# */{
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The content displayed by the HTMLView. Can be either a string or a HTML DOM Element.
		 * @type {string|Element}
		 */
		content: '',
		/**
		 * The content displayed by the HTMLView. Can be either a string or a HTML DOM Element.
		 * @type module:jidejs/base/ObservableProperty
		 * @see module:jidejs/ui/control/HTMLView#content
		 */
		contentProperty: null
	});
	var installer = Observable.install(HTMLView, 'content');
	HTMLView.Skin = HTMLViewSkin;
    register('jide-htmlview', HTMLView, Control, ['content'], []);
	return exports;
});