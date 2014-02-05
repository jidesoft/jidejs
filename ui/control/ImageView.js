/**
 * An ImageView can display an external image.
 *
 * @module jidejs/ui/control/ImageView
 * @extends module:jidejs/ui/Control
 */
define([
	'./../../base/Class', './../../base/Util', './../Control', './../Skin', './../../base/ObservableProperty',
    './../register'
], function(Class, _, Control, Skin, Observable, register) {
	function ImageViewSkin(imageView, el) {
		this.element = el || document.createElement("img");
		Skin.call(this, imageView);
	}

	Class(ImageViewSkin).extends(Skin).def({
		install: function() {
			Skin.prototype.install.call(this);
			this.bindings = [
				this.component.srcProperty.subscribe(function(event) {
					this.element.src = event.value;
				})
			];
		}
	});

	/**
	 * Creates a new ImageView.
	 *
	 * @example
	 * 	new ImageView({
	 * 		src: '<path-to-my-logo>.png'
	 * 	});
	 *
	 * 	// or shorter:
	 * 	new ImageView('<path-to-my-logo>.png');
	 * @param {object|string} config Either the configuration of the control or just the path to the image file.
	 * @constructor
	 */
	function ImageView(config) {
		installer(this);
		config = config || {};
		// allow a string as an argument
		if(_.isString(config)) {
			config = {src: config};
		}
		Control.call(this, config);
	}

	Class(ImageView).extends(Control).def({
		dispose: function() {
			Control.prototype.dispose.call(this);
		},

		/**
		 * The path to the image file. Could also be a base64 encoded image string.
		 *
		 * @type string
		 */
		src: null,
		/**
		 * The path to the image file. Could also be a base64 encoded image string.
		 * @type module:jidejs/base/ObservableProperty
		 */
		srcProperty: null
	});
	var installer = Observable.install(ImageView, 'src');
    ImageView.Skin = ImageViewSkin;
    register('jide-imageview', ImageView, Control, ['src'], []);

	return ImageView;
});