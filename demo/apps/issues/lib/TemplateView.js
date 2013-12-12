define([
	'jidejs/base/Class', 'jidejs/base/Observable', 'jidejs/base/ObservableProperty',
	'jidejs/ui/Control', 'jidejs/ui/Skin'
], function(Class, Observable, ObservableProperty, Control, Skin) {
	"use strict";

	function TemplateViewSkin(view, element) {
		Skin.call(this, view, element);
	}
	Class(TemplateViewSkin).extends(Skin).def({
        updateRootElement: function() {
            var view = this.component,
                el = this.element,
                template = Observable.computed(function() {
                    return Handlebars.compile(document.getElementById(view.template).innerHTML);
                }),
                renderer = Observable.computed(function() {
                    return template.get()(view.item || {});
                });
            this.managed(
                view.itemProperty.subscribe(function() {
                    el.innerHTML = renderer.get();
                }),
                renderer.subscribe(function() {
                    el.innerHTML = renderer.get();
                }),
                view.classList.bind('jide-state-selected', view.selectedProperty)
            );
        },

		dispose: function() {
			Skin.prototype.dispose.call(this);
			if(this._bindings) this._bindings.forEach(function(binding) { binding.dispose(); });
			this._bindings = null;
		}
	});

	function TemplateView(config) {
		installer(this);
		if(!config) config = {};
		if(!config.skin) config.skin = new TemplateView.Skin(this, config.element);
		var item = config.item || null;
		delete config.item;
		Control.call(this, config);
		this.item = item;
	}
	Class(TemplateView).extends(Control);
	var installer = ObservableProperty.install(TemplateView, 'item', 'template', 'selected');

	TemplateView.Skin = TemplateViewSkin;

	return TemplateView;
});