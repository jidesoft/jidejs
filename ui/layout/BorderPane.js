/**
 * The BorderPane is the most commonly used layout pane and allows you to place your components in specific regions.
 *
 * The regions are located like this:
 * <table>
 *     <tr>
 *         <td colspan="3">top</td>
 *     </tr>
 *     <tr>
 *         <td>left</td>
 *         <td>center</td>
 *         <td>right</td>
 *     </tr>
 *     <tr>
 *         <td colspan="3">bottom</td>
 *     </tr>
 * </table>
 *
 * It will use the best rendering technique possible in order to minimize the required DOM structure.
 *
 * @module jidejs/ui/layout/BorderPane
 * @extends jidejs/ui/layout/Pane
 */
define([
	'./../.././Class', './../geom/Insets', './Pane', './../.././Util',
	'./../.././has', './../AttachedProperty'
], function(Class, Insets, Pane, _, has, AttachedProperty) {
	var template = (function() {
		var doc = document;
		var frag = doc.createDocumentFragment();
		frag.appendChild(doc.createElement('header'));
		if(has('grid')) {
			frag.appendChild(doc.createElement('aside'));
			frag.appendChild(doc.createElement('div'));
			frag.appendChild(doc.createElement('aside'));
		} else {
			var middleRow = doc.createElement('div');
			middleRow.className = 'jide-borderpane-centerrow';
			middleRow.appendChild(doc.createElement('aside'));
			middleRow.appendChild(doc.createElement('div'));
			middleRow.appendChild(doc.createElement('aside'));
			frag.appendChild(middleRow);
		}
		frag.appendChild(doc.createElement('footer'));
		return frag;
	}());

	/**
	 * Creates a new BorderPane.
	 * @memberof module:jidejs/ui/layout/BorderPane
	 * @param {object|Element} configOrElement Either the configuration or the Element that should be managed as an BorderPane.
	 * @constructor
	 * @alias module:jidejs/ui/layout/BorderPane
	 */
	function BorderPane(configOrElement) {
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
		el.appendChild(template.cloneNode(true));
		Pane.call(this, config);
		this.classList.add('jide-borderpane');
		this.classList.add(has('grid')
			? 'jide-use-grid'
			: has('flexbox')
				? 'jide-use-flex'
				: has('flexbox/legacy')
					? 'jide-use-legacy-flex'
					: 'jide-use-table');
	}

	var regionToIndex = {
		top: 0, left: 1, center: 1, right: 1, bottom: 2
	};
	var regionToInnerIndex = {
		left: 0, center: 1, right: 2
	};
	var regionToGridIndex = {
		top: 0, left: 1, center: 2, right: 3, bottom: 4
	};

	function getElementForChild(self, region) {
		if(has('grid')) {
			return self.element.childNodes[regionToGridIndex[region]];
		}
		var e = self.element.childNodes[regionToIndex[region]];
		if(region in regionToInnerIndex) {
			e = e.childNodes[regionToInnerIndex[region]];
		}
		return e;
	}

	Class(BorderPane).extends(Pane).def({
		_insertChildAt: function(child, index) {
			BorderPane.region.register(child);
			BorderPane.margin.register(child);
			BorderPane.alignment.register(child);
			var region = BorderPane.region(child) || 'center';
			var margin = BorderPane.margin(child) || new Insets(5);
			var alignment = BorderPane.alignment(child) || 'top';

			var e = getElementForChild(this, region);
			if(has('flexbox') || has('flexbox/legacy')) {
				child.classList.add('jide-borderpane-'+region);
				child.style
					.set('margin', margin.toString())
					.set('verticalAlign', alignment)
					.update();
				e.parentNode.replaceChild(child.element, e);
			} else {
				e.style.padding = margin.toString();
				e.style.verticalAlign = alignment;
				if(e.childNodes.length === 1) {
					e.replaceChild(child.element, e.childNodes[0]);
				} else {
					e.appendChild(child.element);
				}
			}
		},

		_removeChild: function(child, region) {
			region = region || BorderPane.region(child) || 'center';
			if(has('flexbox') || has('flexbox/legacy')) {
				child.element.parentNode.replaceChild(document.createElement('div'), child.element);
				child.classList.remove('jide-borderpane-'+region);
				child.style.remove('padding').remove('verticalAlign').update();
			} else {
				var e = getElementForChild(this, region);
				e.removeChild(child.element);
				e.style.padding = '0';
				e.style.verticalAlign = 'top';
			}
			BorderPane.region.unregister(child);
			BorderPane.margin.unregister(child);
			BorderPane.alignment.unregister(child);
		},

		layoutChildren: function() {
			if(has('flexbox') || has('flexbox/legacy')) return;
			var children = this.children.toArray();
			for(var i = 0, len = children.length; i < len; i++) {
				var child = children[i];
				var region = BorderPane.region(child) || 'center';
				var margin = BorderPane.getMargin(child);
				var e = getElementForChild(this, region);
				if(region === 'top' || region === 'bottom') {
					var height = child.measure().height;
					if(margin) {
						height += margin.top + margin.bottom;
					}
					e.style.height = height+"px";
				} else if(region === 'left' || region === 'right') {
					var width = child.measure().width;
					if(margin) {
						width += margin.left + margin.right;
					}
					e.style.width = width+"px";
				}
			}
		}
	});

	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies the region at which the component should be located. Valid values are:
	 *
	 * - top
	 * - left
	 * - center
	 * - right
	 * - bottom
	 *
	 * @memberof module:jidejs/ui/layout/BorderPane
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, the component will be moved to that region.
	 */
	BorderPane.region = AttachedProperty('./BorderPane.region', function(value, e) {
		var component = e.owner;
		var parent = component.parent;
		var isInBorderPane = parent && parent instanceof BorderPane;
		if(isInBorderPane) {
			parent._removeChild(component, e.oldValue);
			parent._insertChildAt(component, -1);
			parent.requestLayout();
		}
	});
	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies the alignment of the component within its region. Allows all values as specified for the
	 * `verticalAlign` CSS property.
	 *
	 * @memberof module:jidejs/ui/layout/BorderPane
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, the component will be aligned according to the value within its region.
	 */
	BorderPane.alignment = AttachedProperty('./BorderPane.alignment', function(alignment, evt) {
		var component = evt.owner;
		if(component.parent && component.parent instanceof BorderPane) {
			if(has('flexbox') || has('flexbox/legacy')) {
				component.style.set('verticalAlign', alignment || 'top').update();
			} else {
				var e = getElementForChild(component.parent, BorderPane.region(component) || 'center');
				e.style.verticalAlign = alignment || 'top';
			}
		}
	});
	BorderPane.margin = AttachedProperty('./BorderPane.margin', function(margin, evt) {
		var component = evt.owner;
		if(component.parent && component.parent instanceof BorderPane) {
			if(has('flexbox') || has('flexbox/legacy')) {
				component.style.set('margin', (margin || new Insets(5)).toString()).update();
			} else {
				var e = getElementForChild(component.parent, BorderPane.region(component) || 'center');
				e.style.padding = (margin || new Insets(5)).toString();
			}
		}
	});
	return BorderPane;
});