/**
 * An AnchorPane can be used to layout its children relative to its bounds.
 *
 * It can best be compared with the `position: absolute` CSS style.
 *
 * @example
 * 	new AnchorPane({
 * 	    children: [
 * 	    	new HTMLView({
 * 	    	 content: myHtmlContent,
 * 	    	 'AnchorPane.topAnchor': '10px', // 10px from the top of the AnchorPane
 * 	    	 'AnchorPane.leftAnchor': '25px', // 25px from the left of the AnchorPane
 * 	    	 'AnchorPane.rightAnchor': '15px', // 15px from the right of the AnchorPane
 * 	    	 'AnchorPane.bottomAnchor': '20%', // 20% from the bottom of the AnchorPane
 * 	    	})
 * 	    ]
 * 	});
 *
 * @module jidejs/ui/layout/AnchorPane
 */
define([
	'./../../base/Class', './../../base/Util', './Pane', './../AttachedProperty'
], function(Class, _, Pane, AttachedProperty) {
	/**
	 * Creates a new AnchorPane.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/layout/AnchorPane
     * @extends jidejs/ui/layout/Pane
     *
     * @param {object|Element} configOrElement Either the configuration or the Element that should be managed as an AnchorPane.
	 */
	var exports = function AnchorPane(configOrElement) {
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
		this.classList.add('jide-anchorpane');
	};
	Class(AnchorPane).extends(Pane).def(/** @lends module:jidejs/ui/layout/AnchorPane# */{
		_insertChildAt: function(child, index) {
			var style = child.style;
			['top', 'left', 'bottom', 'right'].forEach(function(name) {
				var anchor = AnchorPane[name+'Anchor'];
				anchor.register(child);
				var value = anchor(child);
				if(value) {
					style.set(name, value);
				}
			});
			style.update();
			this.element.appendChild(child.element);
		},

		_removeChild: function(child) {
			this.element.removeChild(child.element);
			var style = child.style;
			['top', 'left', 'bottom', 'right'].forEach(function(name) {
				var anchor = AnchorPane[name+'Anchor'];
				anchor.unregister(child);
				style.remove(name);
			});
			style.update();
		}
	});
	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies how far the component should be from the top edge of the AnchorPane and must be provided
	 * as a CSS value (including the unit type, i.e. `px`, `em`, `%`, ...).
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, this value will be set as the value of the anchor.
	 */
	exports.topAnchor = AttachedProperty('jidejs/ui/layout/AnchorPane.topAnchor', function(value, evt) {
		evt.owner.style.set('top', value).update();
	});
	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies how far the component should be from the left edge of the AnchorPane and must be provided
	 * as a CSS value (including the unit type, i.e. `px`, `em`, `%`, ...).
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, this value will be set as the value of the anchor.
	 */
    exports.leftAnchor = AttachedProperty('jidejs/ui/layout/AnchorPane.leftAnchor', function(value, evt) {
		evt.owner.style.set('left', value).update();
	});
	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies how far the component should be from the bottom edge of the AnchorPane and must be provided
	 * as a CSS value (including the unit type, i.e. `px`, `em`, `%`, ...).
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, this value will be set as the value of the anchor.
	 */
    exports.bottomAnchor = AttachedProperty('jidejs/ui/layout/AnchorPane.bottomAnchor', function(value, evt) {
		evt.owner.style.set('bottom', value).update();
	});
	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies how far the component should be from the right edge of the AnchorPane and must be provided
	 * as a CSS value (including the unit type, i.e. `px`, `em`, `%`, ...).
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, this value will be set as the value of the anchor.
	 */
    exports.rightAnchor = AttachedProperty('jidejs/ui/layout/AnchorPane.rightAnchor', function(value, evt) {
		evt.owner.style.set('right', value).update();
	});
	return exports;
});