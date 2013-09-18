/**
 * A standard HTML Hyperlink, should be used to redirect the user to another page or website but not for commands or
 * actions. Use a {@link module:jidejs/ui/control/Button} if you want a control that allows the user to invoke a command.
 *
 * @module jidejs/ui/control/Hyperlink
 * @extends module:jidejs/ui/control/ButtonBase
 */
define([
	'jidejs/base/Class', 'jidejs/ui/Component', 'jidejs/ui/control/ButtonBase',
	'jidejs/base/ObservableProperty'
],
	function(Class, Component, ButtonBase, Observable) {
		function HyperlinkSkin(link, el) {
			ButtonBase.Skin.call(this, link, el || document.createElement("a"));
		}
		Class(HyperlinkSkin).extends(ButtonBase.Skin).def({
			installBindings: function() {
				var el = this.element;
				return ButtonBase.Skin.prototype.installBindings.call(this).concat(
					this.component.hrefProperty.subscribe(function(event) {
						el.setAttribute("href", event.value);
					})
				);
			}
		});

		/**
		 * Creates a new Hyperlink.
		 *
		 * @example
		 * 	new Hyperlink({
		 * 		text: "jidesoft.com",
		 * 		href: "http://www.jidesoft.com"
		 * 	});
		 *
		 * @memberof module:jidejs/ui/control/Hyperlink
		 * @param config
		 * @constructor
		 * @alias module:jidejs/ui/control/Hyperlink
		 */
		function Hyperlink(config) {
			installer(this);
			config = config || {};
			if(!config.skin) {
				config.skin  = new Hyperlink.Skin(this, config.element);
			}
			ButtonBase.call(this, config);
			this.classList.add('jide-hyperlink');
		}
		Class(Hyperlink).extends(ButtonBase).def({
			dispose: function() {
				ButtonBase.prototype.dispose.call(this);
				installer.dispose(this);
			},

			/**
			 * The URL that the link should forward to.
			 * @type string
			 */
			href: '',
			/**
			 * The URL that the link should forward to.
			 * @type module:jidejs/base/ObservableProperty
			 * @see module:jidejs/ui/control/Hyperlink#href
			 */
			hrefProperty: null
		});
		var installer = Observable.install(Hyperlink, 'href');
		Hyperlink.Skin = HyperlinkSkin;
		return Hyperlink;
});