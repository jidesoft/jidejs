/**
 * A Tooltip is displayed when the user moves the mouse cursor over a control. The display is usually delayed for a few
 * milliseconds to avoid displaying and hiding tooltips to often which would otherwise confuse the user.
 *
 * It can be specified directly with the {@link module:jidejs/ui/Component~tooltip} property.
 *
 * The tooltip should contain additional information about the component, i.e. an explanation of what will happen when
 * a button is clicked.
 *
 * @module jidejs/ui/control/Tooltip
 */
define(['./../../base/Class', './../../base/Util', './Popup'], function(Class, _, Popup) {
	/**
	 * Creates a new Tooltip.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/Tooltip
     * @extends module:jidejs/ui/control/Popup
     *
     * @see module:jidejs/ui/Component~tooltip
     *
     * @param {object} config The configuration.
	 */
	var exports = function Tooltip(config) {
		config = _.defaults(config || {}, {
			consumeAutoHidingEvents: false,
			autoHide: false
		});
		Popup.call(this, config);
		this.classList.add('jide-tooltip');
	};
	Class(exports).extends(Popup);
    exports.Skin = Popup.Skin;

	return exports;
});