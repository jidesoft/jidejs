/**
 * The Pane is the base class for all layout containers.
 *
 * A Pane can contain {@link #children} and arrange them according to specific layout rules.
 *
 * @module jidejs/ui/layout/Pane
 * @extends module:jidejs/ui/Component
 * @extends module:jidejs/ui/Container
 * @abstract
 */
define([
	'jidejs/base/Class', 'jidejs/base/Util', 'jidejs/ui/Component', 'jidejs/base/Dispatcher', 'jidejs/base/DOM',
	'jidejs/ui/Container'
], function(Class, _, Component, Dispatcher, DOM, Container) {
	/**
	 * Invoked by subclasses to initialize them as a Pane.
	 * @memberof module:jidejs/ui/layout/Pane
	 * @param {object|Element} configOrElement Either the configuration or the Element that should be managed by the Pane.
	 * @constructor
	 * @alias module:jidejs/ui/layout/Pane
	 */
	function Pane(configOrElement) {
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
		Component.call(this, el || document.createElement('div'));
		Container.apply(this);
		this.classList.add('jide-pane');
		Component.applyConfiguration(this, config);
	}

	Class(Pane).extends(Component).def({
		/**
		 * `true`, if the layout needs to be recalculated; `false`, otherwise.
		 * @protected
		 * @type boolean
		 */
		needsLayout: false,

		/**
		 * Inserts a child into the DOM structure managed by this Pane.
		 * @param {module:jidejs/ui/Component} child The new child
		 * @param {number} index The index at which the new child was inserted into the {@link #children} list.
		 * @protected
		 */
		_insertChildAt: function(child, index) {
			DOM.insertElementAt(this.element, child.element, index);
		},

		/**
		 * Removes the child rom the DOM structured managed by this Pane.
		 * @param {module:jidejs/ui/Component} child The child that should be removed.
		 * @protected
		 */
		_removeChild: function(child) {
			this.element.removeChild(child.element);
		},

		/**
		 * Request a new layout in the next available animation frame.
		 */
		requestLayout: function() {
			this.needsLayout = true;
			Dispatcher.requestAnimationFrame(this.layout.bind(this));
		},

		/**
		 * Invoked by {@link #requestLayout} to perform the layout operation.
		 *
		 * Should check and update the {@link #needsLayout} property.
		 *
		 * Subclasses don't need to override this method.
		 * @protected
		 */
		layout: function() {
			if(this.needsLayout) {
				this.layoutChildren();
				this.needsLayout = false;
			}
		},

		/**
		 * Calculates the new layout of the components managed by this Pane.
		 *
		 * Subclasses need to override this method to rearrange the components.
		 * @abstract
		 * @protected
		 */
		layoutChildren: function() {}
	});

	return Pane;
});