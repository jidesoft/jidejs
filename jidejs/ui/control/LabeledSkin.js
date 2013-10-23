/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 18.09.12
 * Time: 11:16
 * To change this template use File | Settings | File Templates.
 */
define(['jidejs/base/Class', 'jidejs/ui/Skin'], function(Class, Skin) {
	// create the DOM structure that is used internally
	var template = (function() {
		var doc = document;
		var frag = doc.createDocumentFragment();
		var text = doc.createElement('span');
		var graphic = doc.createElement('span');
		text.className = 'jide-labeled-text';
		graphic.className = 'jide-labeled-graphic';
		frag.appendChild(graphic);
		frag.appendChild(text);
		return frag;
	}());


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

		defaultElement: 'span',

		updateRootElement: function() {
			var node = template.cloneNode(true); // clone the template
			this.graphic = node.childNodes[0];
			this.text = node.childNodes[1];
			this.element.appendChild(node);
		},

		install: function() {
			Skin.prototype.install.call(this);
			var component = this.component;
			var graphic = this.graphic;
			this.bindings = [
				component.textProperty.subscribe(function(event) {
					this.text.innerHTML = event.value;
				}).bind(this),
				component.graphicProperty.subscribe(function(event) {
					if(event.oldValue) {
						event.oldValue.parent = null;
						graphic.replaceChild(event.value.element, event.oldValue.element);
					} else {
						graphic.appendChild(event.value.element);
					}
					event.value.parent = component;
				}),
				component.contentDisplayProperty.subscribe(function(event) {
					if(event.oldValue) {
						component.classList.remove("jide-labeled-content-display-"+event.oldValue);
					}
					component.classList.add("jide-labeled-content-display-"+event.value);
					setContentDisplay(component.contentDisplay, this.text.style, component.graphicTextGap);
				}).bind(this),
				component.graphicTextGapProperty.subscribe(function(event) {
					setContentDisplay(component.contentDisplay, this.text.style, event.value);
				}).bind(this)
			];
			if(component.text) this.text.innerHTML = component.text;
			if(component.graphic) {
				graphic.appendChild(component.graphic.element);
				component.graphic.parent = component;
			}
			if(component.contentDisplay) {
				component.classList.add('jide-labeled-content-display-'+component.contentDisplay);
			}
			if(component.contentDisplay || component.graphicTextGap) {
				setContentDisplay(component.contentDisplay, this.text.style, component.graphicTextGap);
			}
		},

		dispose: function() {
			Skin.prototype.dispose.call(this);
			this.bindings.forEach(function(binding) {
				binding.dispose();
			});
		}
	});

	return LabeledSkin;
});