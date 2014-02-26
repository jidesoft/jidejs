/**
 * The HBox is a layout pane which places its children in a horizontal box.
 *
 * @module jidejs/ui/layout/HBox
 */
define([
	'./../../base/Class', './../../base/Util', './../../base/ObservableProperty',
	'./Pane', './../../base/DOM', './../../base/has',
	'./../Spacing', './../AttachedProperty'
], function(Class, _, Observable, Pane, DOM, has, Spacing, AttachedProperty) {
	function requestLayout() {
		this.requestLayout();
	}

	function setSpacing(event) {
		if(_.isString(event)) {
			return new Spacing(event);
		}
		var val = event.value;
		if(val && !(val instanceof Spacing)) {
			return new Spacing(val);
		}
		return val;
	}

	function updateSpacing(event) {
		var spacing = event.value;
		if(has('flexbox') || has('flexbox/legacy')) {
			var children = this.children.toArray();
			spacing = spacing || new Spacing(0, 0);
			for(var i = 0, len = children.length; i < len; i++) {
				children[i].style.set('margin', spacing.row+' '+spacing.column).update();
			}
		} else {
			this.style.set('borderSpacing', spacing ? spacing.toString() : '0px').update();
		}
	}

	/**
	 * Creates a new HBox.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/layout/HBox
     * @extends module:jidejs/ui/layout/Pane
     *
     * @param {object|Element} configOrElement Either the configuration or the Element that should be managed as a HBox.
	 */
	var exports = function HBox(configOrElement) {
		installer(this);
		this.spacingProperty.converter = setSpacing;
		Pane.call(this, configOrElement);
		this.fillHeightProperty.subscribe(this.requestLayout, this);
		this.spacingProperty.subscribe(updateSpacing);
		if(this.spacing) updateSpacing.call(this, { value: this.spacing });
		this.fillHeightProperty.subscribe(function(event) {
			if(event.value) {
				this.classList.add('jide-hbox-fillHeight');
			} else {
				this.classList.remove('jide-hbox-fillHeight');
			}
		});

		if(this.fillHeight) {
			this.classList.add('jide-hbox-fillHeight');
		}
		this.classList.add('jide-hbox');
		this.classList.add(has('flexbox')
			? 'jide-use-flex'
			: has('flexbox/legacy')
				? 'jide-use-legacy-flex'
				: 'jide-use-table');
	};
    var HBox = exports;

	Class(HBox).extends(Pane).def(/** @lends module:jidejs/ui/layout/HBox# */{
		dispose: function() {
			Pane.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * `true`, if the children should span the complete available height of the HBox; `false`, otherwise.
		 * @type boolean
		 */
		fillHeight: false,
		/**
		 * `true`, if the children should span the complete available height of the HBox; `false`, otherwise.
		 * @type module:jidejs/base/ObservableProperty
		 */
		fillHeightProperty: null,
		/**
		 * The spacing between each child of the HBox.
		 * @type module:jidejs/base/ObservableProperty
		 */
		spacingProperty: null,
		/**
		 * The spacing between each child of the HBox.
		 * @type number
		 */
		spacing: new Spacing('5px'),

		_insertChildAt: function(child, index) {
			HBox.grow.register(child);
			HBox.grow.update(child);
			if(has('flexbox') || has('flexbox/legacy')) {
				if(this.spacing) {
					var spacing = this.spacing;
					child.style.set('margin', spacing.row + ' ' + spacing.column).update();
				}
				DOM.insertElementAt(this.element, child.element, index);
			} else {
				var li = document.createElement('div');
				li.appendChild(child.element);
				DOM.insertElementAt(this.element, li, index);
			}
		},

		_removeChild: function(child) {
			this.element.removeChild(has('flexbox') || has('flexbox/legacy') ? child.element : child.element.parentNode);
			HBox.grow.unregister(child);
		},

		layoutChildren: function() {
			if(has('flexbox') || has('flexbox/legacy')) {
				var children = this.children.toArray();
				var sometimes = [], hasAlways = false;
				for(var i = 0, len = children.length; i < len; i++) {
					var child = children[i];
					var grow = HBox.grow(child) || 'never';
					if(grow === 'always') {
						hasAlways = true;
					} else if(grow === 'sometimes') {
						sometimes.push(child);
					}
				}
				for(i = 0, len = sometimes.length; i < len; i++) {
					sometimes[i].classList[hasAlways ? 'add' : 'remove']('jide-hbox-grow');
				}
				return;
			}
			var size = this.measure();
			var children = this.children.toArray();
			var el = this.element;
			var elChildren = el.childNodes;
			var sometimes = [];
			var always = [];
			for(var i = 0, len = children.length; i < len; i++) {
				// use explicit width unless its the last element and no other element grows
				var child = children[i];
				var childEl = elChildren[i];
				var grow = HBox.grow(child) || 'never';
				if(grow === 'never') {
					if(!(i === len - 1 && sometimes.length === 0 && always.length === 0)) {
						// doesn't need to expand
						var prefSize = child.measure();
						childEl.style.width = prefSize.width + "px";
					}
				} else if(grow === 'sometimes' && always.length === 0) {
					sometimes.push(i);
				} else if(grow === 'always') {
					always.push(i);
					// add a specific width to all "sometimes" growing elements since we have
					// one with a higher priority
					for(var j = 0, elLen = sometimes.length; j < elLen; j++) {
						var idx = sometimes[j];
						child = children[idx];
						childEl = elChildren[idx];
						var prefSize = child.measure();
						childEl.style.width = prefSize.width + "px";
					}
					sometimes = [];
				}
			}
		}
	});
	var installer = Observable.install(HBox, 'spacing', 'fillHeight');

	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies the priority of the component with regard to how much of the available unused space it should receive.
	 *
	 * - **always**
	 * 	The component should always take the available unused space. The space will be shared between all components
	 * 	that have a `grow` priority of `always`.
	 * - **sometimes**
	 * 	The component should grow if there are no components with a priority of `always`. The space will be shared
	 * 	between all components that have a `grow` priority of `sometimes`.
	 * - **never**
	 * 	The component should never grow.
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, this value will be set as the grow priority of the component.
	 */
	exports.grow = AttachedProperty('jidejs/ui/layout/HBox.grow', function(priority, evt) {
		var child = evt.owner;
		if(priority === 'always') {
			child.classList.add('jide-hbox-grow');
		}
	});
	return exports;
});