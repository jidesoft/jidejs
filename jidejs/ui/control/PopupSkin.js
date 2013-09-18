/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 28.09.12
 * Time: 09:13
 * To change this template use File | Settings | File Templates.
 */
define(['jidejs/base/Class', 'jidejs/base/DOM', 'jidejs/base/Util', 'jidejs/ui/Skin', 'jidejs/base/Dispatcher'], function(Class, DOM, _, Skin, Dispatcher) {
	function autoHideHandler(e) {
		var point = { x: e.pageX, y: e.pageY },
			consumeAutoHidingEvents = false,
			managedPopupHit = null;
		for(var i = autoHideHandler.managedPopups.length-1; -1 < i; i--) {
			var popup = autoHideHandler.managedPopups[i];
			if(popup && popup.visible) {
				if(!DOM.isInElement(popup.element, point)) {
					if(!consumeAutoHidingEvents) consumeAutoHidingEvents = popup.consumeAutoHidingEvents;
					popup.visible = false;
					delete autoHideHandler.managedPopups[i];
				} else if(!managedPopupHit) {
					managedPopupHit = popup;
					break;
				}
			}
		}
		if(!managedPopupHit && consumeAutoHidingEvents) {
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	}
	autoHideHandler.managedPopups = [];
	autoHideHandler.pushPopup = function(popup) {
		autoHideHandler.managedPopups.push(popup);
		if(!autoHideHandlerRegistered) autoHideHandler.register();
	};
	autoHideHandler.removePopup = function(popup) {
		var index = autoHideHandler.managedPopups.indexOf(popup);
		if(index !== -1) {
			autoHideHandler.managedPopups.splice(index, 1);
		}
		if(autoHideHandler.managedPopups.length === 0) {
			autoHideHandler.unregister();
		}
	};
	var autoHideHandlerRegistered = false;
	autoHideHandler.register = function() {
		if(autoHideHandlerRegistered) return;
		document.addEventListener('click', autoHideHandler, true);
		autoHideHandlerRegistered = true;
	};
	autoHideHandler.unregister = function() {
		if(!autoHideHandlerRegistered) return;
		document.removeEventListener('click', autoHideHandler, true);
		autoHideHandlerRegistered = false;
	};

	function PopupSkin(popup, el) {
		if(typeof el === 'undefined') {
			el = document.createElement('div');
		}
		this.popup = popup;
		this.element = el;
		Skin.call(this, popup);
	}

	Class(PopupSkin).extends(Skin).def({
		install: function() {
			Skin.prototype.install.call(this);
			var popup = this.popup;
			var THIS = this;
			this.bindings = [
				popup.contentProperty.subscribe(function(event) {
					if(event.oldValue) {
						var oldValue = event.oldValue;
						// cleanup
						if(!_.isString(oldValue)) {
							oldValue.parent = null;
						}
						DOM.removeChildren(this.element);
					}
					if(event.value != null) {
						var value = event.value;
						// add new child
						if(_.isString(value)) {
							this.element.innerHTML = value;
						} else {
							value.parent = this.popup;
							this.element.appendChild(value.element);
						}
					}
				}.bind(this)),
				popup.visibleProperty.subscribe(function(event) {
					if(event.value) {
						document.body.appendChild(this.element);
						this.classList.add('jide-visible');
						Dispatcher.invokeLater(function() {
							this.focus();
						}, this);
						if(popup.autoHide) {
							//document.addEventListener('click', THIS.autoHideHandler, true);
							autoHideHandler.pushPopup(popup);
							autoHideHandler.register();
						}
					} else if(event.oldValue) {
						this.classList.remove('jide-visible');
						document.body.removeChild(this.element);
						if(popup.autoHide) {
							autoHideHandler.removePopup(popup);
						}
					}
				}),
				popup.keyMap.on({key: 'Esc'}, function() {
					if(popup.autoHide) popup.visible = false;
				})
			];
			if(popup.content) {
				if(_.isString(popup.content)) {
					this.element.innerHTML = popup.content;
				} else {
					this.element.appendChild(popup.content.element);
				}
			}
		},

		dispose: function() {
			this.bindings.forEach(function(binding) {
				binding.dispose();
			});
			this.bindings = [];
		}
	});
	return PopupSkin;
});