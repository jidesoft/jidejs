/**
 * The VBox is a layout pane which places its children in a vertical box.
 *
 * @module jidejs/ui/layout/VBox
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
		if(!val) {
			return new Spacing('0px', '0px');
		}
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
	 * Creates a new VBox.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/layout/VBox
     * @extends module:jidejs/ui/layout/Pane
     *
     * @param {object|Element} configOrElement Either the configuration or the Element that should be managed as a VBox.
	 */
	var exports = function VBox(configOrElement) {
		installer(this);
		this.spacingProperty.converter = setSpacing;
		Pane.call(this, configOrElement);
		this.fillWidthProperty.subscribe(this.requestLayout, this);
		this.spacingProperty.subscribe(updateSpacing);
		if(this.spacing) updateSpacing.call(this, { value: this.spacing });
		this.fillWidthProperty.subscribe(function(event) {
			if(event.value) {
				this.classList.add('jide-vbox-fillHeight');
			} else {
				this.classList.remove('jide-vbox-fillHeight');
			}
		});
		if(this.fillWidth) {
			this.classList.add('jide-vbox-fillHeight');
		}
		this.classList.add('jide-vbox');
		this.classList.add(has('flexbox')
			? 'jide-use-flex'
			: has('flexbox/legacy')
				? 'jide-use-legacy-flex'
				: 'jide-use-table');

        VBox.grow.register(this);
	};
    var VBox = exports;

	Class(VBox).extends(Pane).def(/** @lends module:jidejs/ui/layout/VBox# */{
		dispose: function() {
			Pane.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * When `true`, the children will span across the entire available width of the VBox. Otherwise they will only
		 * be as wide as necessary.
		 * @type boolean
		 */
		fillWidth: false,
		/**
		 * When `true`, the children will span across the entire available width of the VBox. Otherwise they will only
		 * be as wide as necessary.
		 */
		fillWidthProperty: null,
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
			//VBox.grow.register(child);
			VBox.grow.update(child);
			if(has('flexbox') || has('flexbox/legacy')) {
				if(this.spacing) {
					var spacing = this.spacing;
					child.style.set('margin', spacing.row + ' ' + spacing.column).update();
				}
				DOM.insertElementAt(this.element, child.element || child, index);
			} else {
				var li = document.createElement('div');
				li.appendChild(child.element || child);
				DOM.insertElementAt(this.element, li, index);
			}
		},

		_removeChild: function(child) {
			this.element.removeChild(
                has('flexbox') || has('flexbox/legacy')
                    ? child.element || child
                    : (child.element || child).parentNode);
			//VBox.grow.unregister(child);
		},

		layoutChildren: function() {
			if(has('flexbox') || has('flexbox/legacy')) {
				var children = this.children.toArray();
				var sometimes = [], hasAlways = false;
				for(var i = 0, len = children.length; i < len; i++) {
					var child = children[i];
					var grow = VBox.grow(child) || 'never';
					if(grow === 'always') {
						hasAlways = true;
					} else if(grow === 'sometimes') {
						sometimes.push(child);
					}
				}
				for(i = 0, len = sometimes.length; i < len; i++) {
					sometimes[i].classList[hasAlways ? 'add' : 'remove']('jide-vbox-grow');
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
				var grow = VBox.grow(child) || 'never';
				if(grow === 'never') {
					if(!(i === len - 1 && sometimes.length === 0 && always.length === 0)) {
						// doesn't need to expand
						var prefSize = child.measure();
						childEl.style.height = prefSize.height + "px";
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
						childEl.style.height = prefSize.height + "px";
					}
					sometimes = [];
				}
			}
		}
	});
	var installer = Observable.install(VBox, 'spacing', 'fillWidth');

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
	exports.grow = AttachedProperty('jidejs/ui/layout/VBox.grow', 'VBox-grow', function(evt) {
		var child = evt.source;
		if(evt.value === 'always' && (has('flexbox') || has('flexbox/legacy'))) {
			child.classList.add('jide-vbox-grow');
		}
        evt.stopImmediatePropagation();
        DOM.notifyLayoutChange(child);
	});

	return exports;
});