/**
 * A TitledPane is a control that combines a content component with a title. It can optionally be configured to be
 * {@link #collapsible} which allows the user to collapse the content of the pane so that only the title is visible.
 *
 * A common use case is to group multiple TitledPanes into an {@link module:jidejs/ui/control/Accordion} so that only
 * one of them can be expanded at a given time.
 *
 * @module jidejs/ui/control/TitledPane
 */
define([
	'./../../base/Class', './../../base/DOM', './../../base/Util', './../../base/Animation', './../../base/ObservableProperty',
    './../Component', './../Control', './../Skin', './../register',
    './Templates'
], function(Class, DOM, _, Animation, Observable, Component, Control, Skin, register, Templates) {
	/**
	 * Creates a new TitledPane.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/control/TitledPane
     * @extends module:jidejs/ui/Control
     *
     * @param {object} config The configuration.
	 */
	var exports = function TitledPane(config) {
		installer(this);
		config = config || {};
		_.defaults(config, { expanded: true, collapsible: true, animated: true });
		Control.call(this, config);
		this.classList.add('jide-titledpane');
	};

	Class(TitledPane).extends(Control).def(/** @lends module:jidejs/ui/control/TitledPane# */{
		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The title of the component.
		 * @type string
		 */
		title: '',
		/**
		 * The title of the component.
		 * @type module:jidejs/base/ObservableProperty
		 */
		titleProperty: null,
		/**
		 * The component that is displayed in the group.
		 * @type module:jidejs/ui/Component
		 */
		content: null,
		/**
		 * The component that is displayed in the group.
		 * @type module:jidejs/base/ObservableProperty
		 */
		contentProperty: null,
		/**
		 * When `true`, the user can collapse the {@link module:jidejs/ui/control/TitledPane#content} of the pane so that
		 * only the {@link module:jidejs/ui/control/TitledPane#title} is visible.
		 * @type boolean
		 */
		collapsible: true,
		/**
		 * When `true`, the user can collapse the {@link module:jidejs/ui/control/TitledPane#content} of the pane so that
		 * only the {@link module:jidejs/ui/control/TitledPane#title} is visible.
		 * @type module:jidejs/base/ObservableProperty
		 */
		collapsibleProperty: null,
		/**
		 * `true`, if the {@link #content} is currently expanded; `false`, if it is collapsed.
		 * @type boolean
		 * @see module:jidejs/ui/control/TitledPane#collapsible
		 */
		expanded: true,
		/**
		 * `true`, if the {@link #content} is currently expanded; `false`, if it is collapsed.
		 * @see module:jidejs/ui/control/TitledPane#collapsibleProperty
		 * @type module:jidejs/base/ObservableProperty
		 */
		expandedProperty: null,
		/**
		 * `true`, if the control should use an animation to while expanding or collapsing the content; `false`,
		 * otherwise.
		 * @type boolean
		 */
		animated: true,
		/**
		 * `true`, if the control should use an animation to while expanding or collapsing the content; `false`,
		 * otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 */
		animatedProperty: null
	});
	var installer = Observable.install(TitledPane, 'title', 'content', 'collapsible', 'expanded', 'animated');
    TitledPane.Skin = Skin.create(Skin, {
        defaultElement: 'div',
        template: Templates.TitledPane,

        get expanded() {
            var titledPane = this.component;
            return !titledPane.collapsible || titledPane.expanded;
        },

        get height() {
            var titledPane = this.component;
            var content = this['x-content'];
            content.style.height = 'auto';
            var originalWidth = content.style.width;
            if(this.element.style.width) content.style.width = this.element.style.width;
            var height = titledPane.expanded ? (DOM.measure(content).height+'px') : '0px';
            content.style.width = originalWidth;
            return height;
        },

        toggleExpanded: function() {
            var titledPane = this.component;
            if(!titledPane.collapsible) return;
            titledPane.expanded = !titledPane.expanded;
        }
    });
    register('jide-titledpane', TitledPane, Control, ['title', 'content', 'collapsible', 'expanded', 'animated'], []);

	return TitledPane;
});