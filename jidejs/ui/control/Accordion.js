/**
 * An Accordion is a control that can contain multiple {@link module:jidejs/ui/control/TitledPane TitledPanes}.
 *
 * Only one of those TitledPanes can be open at a time. If another TitledPane is opened, the Accordion will automatically
 * close the previously opened one.
 *
 * It can optionally display an animation or just close and open without animation.
 *
 * @module jidejs/ui/control/Accordion
 * @extends module:jidejs/ui/Control
 * @extends module:jidejs/ui/Container
 */
define([
	'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/base/ObservableList', 'jidejs/ui/Control',
    'jidejs/ui/Skin', 'jidejs/ui/layout/VBox', 'jidejs/base/has', 'jidejs/ui/control/Templates'
], function(Class, Observable, ObservableList, Control, Skin, VBox, has, Templates) {
	/**
	 * Creates a new Accordion.
	 *
	 * @memberof module:jidejs/ui/control/Accordion
	 * @param {object} config The configuration
	 * @param {array<module:jidejs/ui/control/TitledPane>} config.children An array of TitledPanes that should be displayed
	 * 		in the accordion.
	 * @constructor
	 * @alias module:jidejs/ui/control/Accordion
	 */
	function Accordion(config) {
		installer(this);
		config = config || {};
        if(config.children) this.children = ObservableList(config.children);
        else this.children = new ObservableList();
        delete config.children;
		Control.call(this, config);
		this.classList.add('jide-accordion');
	}
	Class(Accordion).extends(Control).def({
		/**
		 * Contains the currently expanded TitledPane.
		 *
		 * @type module:jidejs/ui/control/TitledPane
		 */
		expandedPane: null,
		/**
		 * Contains the currently expanded TitledPane.
		 *
		 * @type module:jidejs/base/ObservableProperty
		 */
		expandedPaneProperty: null,

		/**
		 * Contains an ObservableList of TitledPanes. The list can be modified and changes to it
		 * will be reflected by the control.
		 *
		 * @readonly
		 * @type {module:jidejs/base/ObservableList}
		 */
        children: null,

		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		}
	});
	var installer = Observable.install(Accordion, 'expandedPane');
	Accordion.Skin = Skin.create(Skin, {
        template: Templates.Accordion,
        install: function() {
            // collapse all children except the first expanded one.
            var accordion = this.component,
                foundExpanded = false;
            for(var i = 0, children = accordion.children, len = children.length; i < len; i++) {
                var titledPane = children.get(i);
                if(titledPane.expanded) {
                    if(foundExpanded) {
                        titledPane.expanded = false;
                    } else {
                        foundExpanded = true;
                        accordion.expandedPane = titledPane;
                    }
                }
            }
            Skin.prototype.install.call(this);
        },

        handleExpandedChanged: function(self, event) {
            var accordion = this.component,
                expandedPane = event.source;
            if(accordion.children.contains(expandedPane) &&  event.value) {
                // if some TitledPane was expanded, collapse the previously expanded pane
                var previouslyExpandedPane = accordion.expandedPane;
                expandedPane.collapsible = false;
                accordion.expandedPane = expandedPane;
                if(previouslyExpandedPane !== expandedPane) {
                    previouslyExpandedPane.expanded = false;
                    previouslyExpandedPane.collapsible = true;
                }
            }
        }
	});
	return Accordion;
});