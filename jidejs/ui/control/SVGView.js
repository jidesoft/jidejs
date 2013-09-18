/**
 * The SVGView allows to embed SVG content in the component hierarchy.
 *
 * @module jidejs/ui/control/SVGView
 * @extends module:jidejs/ui/Control
 */
define(['jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/ui/Control', 'jidejs/ui/Skin'], function(Class, Observable, Control, Skin) {
	function SVGViewSkin(svgView, el) {
		this.element = el || document.createElementNS('http://www.w3.org/2000/svg', "svg");
		Skin.call(this, svgView, this.element);
	}

	Class(SVGViewSkin).extends(Skin);

	/**
	 * Creates a new SVGView.
	 *
	 * The element in the {@link #content} property is added to the {@link #element} property.
	 *
	 * @memberof module:jidejs/ui/control/SVGView
	 * @param {object} config The configuration.
	 * @constructor
	 * @alias module:jidejs/ui/control/SVGView
	 */
	function SVGView(config) {
		config = config || {};
		if(!config.skin) {
			config.skin = new SVGViewSkin(this, config.element);
		}
		installer(this);
		Control.call(this, config);
		this.contentProperty.subscribe(function(event) {
			var el = this.element;
			while(el.childNodes.length) {
				el.removeChild(el.childNodes[0]);
			}
			el.appendChild(event.value);
		}, this);
		if(this.content) {
			var el = this.element;
			while(el.childNodes.length) {
				el.removeChild(el.childNodes[0]);
			}
			el.appendChild(this.content);
		}
	}
	Class(SVGView).extends(Control).def({
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The content that should be contained in the SVG element.
		 * If you need to add more than one root element, it is advised to set a DocumentFragment as the value of this
		 * property.
		 * @type Element
		 */
		content: '',
		/**
		 * The content that should be contained in the SVG element.
		 * @type module:jidejs/base/ObservableProperty
		 */
		contentProperty: null,

		/**
		 * Contains the `viewBox` property of the SVG element. To change the viewbox, you need to explicitly set this
		 * property. It is not sufficient to just modify a property of the viewbox object.
		 * @type {{x:number, y:number, width:number, height:number}}
		 */
		set viewBox(value) {
			this.element.setAttribute('viewBox', (value.x || 0) + " " + (value.y || 0) + " " + value.width + " " + value.height);
		},

		get viewBox() {
			var attr = this.element.getAttribute('viewBox');
			var parts = attr.split(' ');
			return {
				x: parts[0],
				y: parts[1],
				width: parts[2],
				height: parts[3]
			};
		}
	});
	var installer = Observable.install(SVGView, 'content');
	return SVGView;
});