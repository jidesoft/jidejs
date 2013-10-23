/**
 * This module is the base for all controls that have the primary task of displaying either text, a graphic or both to the
 * user.
 *
 * @module jidejs/ui/control/Labeled
 * @abstract
 * @extends module:jidejs/ui/Control
 */
define([
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/base/ObservableProperty', 'jidejs/ui/Control', 'jidejs/ui/Skin',
	'jidejs/base/DOM', 'jidejs/ui/bind', 'jidejs/ui/Template'
], function(Class, _, Observable, Control, Skin, DOM, bind, Template) {
	// create the DOM structure that is used internally
//	var template = (function() {
//		var doc = document;
//		var frag = doc.createDocumentFragment();
//		var text = doc.createElement('span');
//		var graphic = doc.createElement('span');
//		text.className = 'jide-labeled-text';
//		graphic.className = 'jide-labeled-graphic';
//		frag.appendChild(graphic);
//		frag.appendChild(text);
//		return frag;
//	}());
	var template = Template(
		'<template>'+
		'<span pseudo="x-graphic" class="jide-labeled-graphic" data-bind="content: component.graphic"></span>'+
		'<span pseudo="x-text" class="jide-labeled-text" data-bind="content: component.text"></span>'+
		'</template>'
	);


	function LabeledSkin(label, el) {
		Skin.call(this, label, el);
	}

	function setContentDisplay(contentDisplay, style, value) {
		if(contentDisplay === 'left') {
			style.marginLeft = value + "px";
			style.marginTop = "0px";
		} else if(contentDisplay === 'top') {
			style.marginTop = value + "px";
			style.marginLeft = '0px';
		}
	}

	Class(LabeledSkin).extends(Skin).def({
		graphic: null,
		text: null,
		template: template,
		defaultElement: 'span',

//		updateRootElement: function() {
//			var node = template.cloneNode(true); // clone the template
//			this.graphic = node.childNodes[0];
//			this.text = node.childNodes[1];
//			this.element.appendChild(node);
//		},

		install: function() {
			Skin.prototype.install.call(this);
			var component = this.component;
			var graphic = this['x-graphic'];
			this.bindings = [
//				component.textProperty.subscribe(function(event) {
//					this.text.innerHTML = event.value;
//				}).bind(this),
//				component.graphicProperty.subscribe(function(event) {
//					if(event.oldValue) {
//						event.oldValue.parent = null;
//						graphic.replaceChild(event.value.element, event.oldValue.element);
//					} else {
//						graphic.appendChild(event.value.element);
//					}
//					event.value.parent = component;
//				}),
				component.contentDisplayProperty.subscribe(function(event) {
					if(event.oldValue) {
						component.classList.remove("jide-labeled-content-display-"+event.oldValue);
					}
					component.classList.add("jide-labeled-content-display-"+event.value);
					setContentDisplay(component.contentDisplay, this['x-text'].style, component.graphicTextGap);
				}).bind(this),
				component.graphicTextGapProperty.subscribe(function(event) {
					setContentDisplay(component.contentDisplay, this['x-text'].style, event.value);
				}).bind(this)
			];
//			if(component.text) this.text.innerHTML = component.text;
//			if(component.graphic) {
//				graphic.appendChild(component.graphic.element);
//				component.graphic.parent = component;
//			}
			if(component.contentDisplay) {
				component.classList.add('jide-labeled-content-display-'+component.contentDisplay);
			}
			if(component.contentDisplay || component.graphicTextGap) {
				setContentDisplay(component.contentDisplay || 'left', this['x-text'].style, component.graphicTextGap || '0px');
			}
		},

		dispose: function() {
			Skin.prototype.dispose.call(this);
			this.bindings.forEach(function(binding) {
				binding.dispose();
			});
		}
	});

	/**
	 * Used by subclasses to initialize the Labeled control.
	 * @memberof module:jidejs/ui/control/Labeled
	 * @param {object} config The configuration
	 * @constructor
	 * @alias module:jidejs/ui/control/Labeled
	 */
	function Labeled(config) {
		installer(this);
		config = config || {};
		if(!config.skin) {
			config.skin  = new Labeled.Skin(this, config.element);
		}
		Control.call(this, config);

		this.classList.add('jide-labeled');
	}

	Class(Labeled).extends(Control).def({
		/**
		 * The text displayed by this Labeled control.
		 * @type {string}
		 */
		text: '',
		/**
		 * The text displayed by this Labeled control.
		 * @type module:jidejs/base/ObservableProperty
		 */
		textProperty: null,
		/**
		 * The Component displayed as the graphic of this Labeled control.
		 * @type module:jidejs/ui/Component
		 */
		graphic: null,
		/**
		 * The Component displayed as the graphic of this Labeled control.
		 * @type module:jidejs/base/ObservableProperty
		 */
		graphicProperty: null,
		/**
		 * Specifies how the content is displayed:
		 *
		 * - `top`
		 *     The graphic is shown above the text.
		 * - `bottom`
		 *     The graphic is shown below the text.
		 * - `left`
		 *     The graphic is shown left of the text.
		 * - `right`
		 *     The graphic is shown right of the text.
		 * @type string
		 */
		contentDisplay: null,
		/**
		 * Specifies how the content is displayed.
		 * @type module:jidejs/base/ObservableProperty
		 * @see module:jidejs/ui/control/Labeled#contentDisplay
		 */
		contentDisplayProperty: null,
		/**
		 * The amount of space between the graphic and the text in pixels.
		 *
		 * @type number
		 */
		graphicTextGap: null,
		/**
		 * The amount of space between the graphic and the text in pixels.
		 *
		 * @type module:jidejs/base/ObservableProperty
		 */
		graphicTextGapProperty: null,

		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		}
	});
	Labeled.Skin = LabeledSkin;
	var installer = Observable.install(Labeled, 'text', 'contentDisplay', 'graphic', 'graphicTextGap');

	return Labeled;
});