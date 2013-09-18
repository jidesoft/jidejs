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
	'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/ui/Control', 'jidejs/ui/Skin', 'jidejs/ui/layout/VBox',
	'jidejs/base/has'
], function(Class, Observable, Control, Skin, VBox, has) {
	function processChange(THIS, handler, change) {
		var child;
		if(change.isDelete || change.isUpdate) {
			child = change.oldValue;
			child['jide/ui/control/Accordion.expandedHandler'].dispose();
			delete child['jide/ui/control/Accordion.expandedHandler'];
		}
		if(change.isInsert || change.isUpdate) {
			child = change.newValue;
			child.animated = false;
			if(child.expanded) {
				if(THIS.expandedPane == null) {
					THIS.expandedPane = child;
				} else {
					child.expanded = false;
				}
			}
			if(has('flexbox') || has('flexbox/legacy')) {
				child.animated = true;
			}
			child['jide/ui/control/Accordion.expandedHandler'] = child.expandedProperty.subscribe(handler);
		}
	}

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
		if(!config.skin) {
			config.skin  = new Accordion.Skin(this, config.element);
		}

		this.content = new VBox({
			element: config.skin.element,
			fillWidth: true,
			spacing: 0,
			parent: this
		});
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
		get children() {
			return this.content.children;
		},

		dispose: function() {
			Control.prototype.dispose.call(this);
			installer.dispose(this);
		}
	});
	var installer = Observable.install(Accordion, 'expandedPane');
	Accordion.Skin = Skin.create(Skin, {
		installBindings: function() {
			var accordion = this.component,
				handler = function(event) {
					if(event.value) {
						accordion.expandedPane = this;
					} else {
						if(accordion.expandedPane == this) {
							accordion.expandedPane = null;
						}
					}
				};
			return Skin.prototype.installBindings.call(this).concat(
				accordion.expandedPaneProperty.subscribe(function(event) {
					if(event.oldValue && event.value != event.oldValue) {
						event.oldValue.expanded = false;
					}
				}),
				accordion.children.on('change', function(event) {
					var changes = event.enumerator();
					while(changes.moveNext()) {
						var change = changes.current;
						processChange(accordion, handler, change);
					}
				})
			);
		},
	});
	return Accordion;
});