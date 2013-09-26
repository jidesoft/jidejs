/**
 * A control designed to work with font-awesome.
 */
define([
	'jidejs/base/Class',
	'jidejs/ui/Control',
	'jidejs/ui/Skin',
	'jidejs/base/DOM'
], function(Class, Control, Skin, DOM) {
	"use strict";
	return Control.create('Icon', Control, ['icons'], {
		Skin: Skin.create(Skin, {
			defaultElement: 'i',

			updateRootElement: function() {
				Skin.prototype.updateRootElement.call(this);
				var icon = this.component;
				icon.classList.add('icon-stack');
				if(icon.icons) {
					this.installIcons();
				}
			},

			installBindings: function() {
				if(this.component.children) this.installIcons();
				var THIS = this;
				return Skin.prototype.installBindings.call(this).concat([
					this.component.iconsProperty.subscribe(function(event) {
						DOM.removeChildren(THIS.element);
						THIS.installIcons();
					})
				]);
			},

			installIcons: function() {
				var icon = this.component,
					element = this.element;
				icon.icons.forEach(function(iconName, index) {
					var node = document.createElement('i');
					node.className = 'icon-'+iconName;
					if(index === 0) node.className += ' icon-stack-base';
					element.appendChild(node);
				})
			}
		})
	});
});