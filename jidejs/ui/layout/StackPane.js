/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 26.10.12
 * Time: 11:31
 * To change this template use File | Settings | File Templates.
 */
define([
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/ui/layout/Pane', 'jidejs/ui/Pos',
	'jidejs/ui/AttachedProperty'
], function(Class, _, Pane, Pos, AttachedProperty) {
	function StackPane(configOrElement) {
		var el = null, config = null;
		if(typeof configOrElement !== 'undefined') {
			if(_.isElement(configOrElement)) {
				el = configOrElement;
				config = null;
			} else {
				config = configOrElement;
				el = config.element;
			}
		}
		if(el == null) {
			el = document.createElement('div');
		}
		if(config == null) {
			config = {
				element: el
			};
		}
		config.element = el;
		Pane.call(this, config);
		for(var i = 0, len = this.children.length; i < len; i++) {
			this.children.get(i).element.style.zIndex = i;
		}
		this.children.on('change', function(e) {
			if(e.addedLength) {
				for(var i = e.from, len = this.length; i < len; i++) {
					this.get(i).element.style.zIndex = i;
				}
			}
		});
		this.classList.add('jide-anchorpane');
	}
	Class(StackPane).extends(Pane).def({
		_insertChildAt: function(child) {
			StackPane.alignment.register(child).update(child);
			this.element.appendChild(child.element);
		},

		_removeChild: function(child) {
			this.element.removeChild(child.element);
			child.style.remove('top').remove('left').remove('bottom').remove('right').update();
			StackPane.alignment.unregister(child);
		}
	});
	StackPane.alignment = AttachedProperty('jidejs/ui/layout/StackPane.alignment', function(pos, evt) {
		var component = evt.owner;
		var style = component.style;
		switch(pos) {
			case Pos.TOP_LEFT:
				style.set('top', 0)
					.set('left', 0);
				break;
			case Pos.TOP_RIGHT:
				style.set('top', 0)
					.set('right', 0);
				break;
			case Pos.TOP_CENTER:
				style.set('top', 0)
					.set('left', 0)
					.set('right', 0);
				break;
			case Pos.BOTTOM_CENTER:
				style.set('bottom', 0)
					.set('left', 0)
					.set('right', 0);
				break;
			case Pos.BOTTOM_LEFT:
				style.set('bottom', 0)
					.set('left', 0);
				break;
			case Pos.BOTTOM_RIGHT:
				style.set('bottom', 0)
					.set('right', 0);
				break;
			case Pos.CENTER_LEFT:
				style.set('left', 0)
					.set('top', 0)
					.set('bottom', 0);
				break;
			case Pos.CENTER_RIGHT:
				style.set('right', 0)
					.set('top', 0)
					.set('bottom', 0);
				break;
			case Pos.CENTER:
				style.set('top', 0)
					.set('bottom', 0)
					.set('left', 0)
					.set('right', 0);
				break;
		}
		style.update();
	});
	return StackPane;
});