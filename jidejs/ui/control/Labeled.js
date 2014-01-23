/**
 * This module is the base for all controls that have the primary task of displaying either text, a graphic or both to the
 * user.
 *
 * @module jidejs/ui/control/Labeled
 * @abstract
 * @extends module:jidejs/ui/Control
 */
define([
	'./../../base/Class', './../../base/Util', './../../base/ObservableProperty', './../Control', './../Skin',
	'./../../base/DOM', './../bind', './Templates', './../register'
], function(Class, _, Observable, Control, Skin, DOM, bind, Templates, register) {
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
	Labeled.Skin = Skin.create(Skin, {
        graphic: null,
        text: null,
        template: Templates.Labeled,
        defaultElement: 'span',
    });
	var installer = Observable.install(Labeled, 'text', 'contentDisplay', 'graphic', 'graphicTextGap');

	register('jide-labeled', Labeled, Control, ['graphic', 'text', 'graphicTextGap'], []);

	return Labeled;
});