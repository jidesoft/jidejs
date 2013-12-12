/**
 * A control designed to work with font-awesome.
 */
define([
	'jidejs/base/Class',
    'jidejs/base/ObservableProperty',
	'jidejs/ui/Control',
	'jidejs/ui/Skin'
], function(Class, ObservableProperty, Control, Skin) {
	"use strict";
	return Control.create('Icon', {
        $extends: Control,

        nameProperty: '',

		Skin: Skin.create(Skin, {
			defaultElement: 'i',

			updateRootElement: function() {
				Skin.prototype.updateRootElement.call(this);
				var icon = this.component;
				if(icon.name) icon.classList.add('icon-'+icon.name);
			},

			installBindings: function() {
				var icon = this.component;
				return Skin.prototype.installBindings.call(this).concat([
					icon.nameProperty.subscribe(function(event) {
						icon.classList.remove('icon-'+event.oldValue);
						icon.classList.add('icon-'+event.value);
					})
				]);
			}
		})
	});
});