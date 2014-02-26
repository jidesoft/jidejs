/**
 * The TilePane arranges its children as tiles in multiple rows and columns.
 *
 * As opposed to the {@link module:jidejs/ui/layout/GridPane} it can handle neither column nor row spanning of the tiles.
 *
 * You can arrange the components either horizontally or vertically. When arranged horizontally, you should also specify
 * the {@link #prefColumns} property to specify in how many columns the components should be arranged. For vertically
 * arranged components, you should specify the {@link #prefRows} property.
 *
 * @module jidejs/ui/layout/TilePane
 */
define([
	'./../../base/Class', './../../base/ObservableProperty', './../../base/DOM', './../../base/Util',
	'./Pane', './../Orientation'
], function(Class, Observable, DOM, _, Pane, Orientation) {
	/**
	 * Creates a new TilePane.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/layout/TilePane
     * @extends jidejs/ui/layout/Pane
     *
     * @param {object|Element} configOrElement Either the configuration or the Element that should be managed as a TilePane.
	 */
	var exports = function TilePane(configOrElement) {
		installer(this);
		Pane.call(this, configOrElement);
		this.hgapProperty.subscribe(function(event) {
			this.element.style.borderSpacing = this.vgap + "px " + event.value + "px";
		});
		this.vgapProperty.subscribe(function(event) {
			this.element.style.borderSpacing = event.value + "px " + this.hgap + "px";
		});
		if(this.vgap || this.hgap) {
			this.element.style.borderSpacing = this.vgap + "px " + this.hgap + "px";
		}
		this.orientationProperty.subscribe(function(event) {
			if(event.value === Orientation.HORIZONTAL) {
				this.classList.remove('jide-orientation-vertical');
				this.classList.add('jide-orientation-horizontal');
			} else {
				this.classList.remove('jide-orientation-horizontal');
				this.classList.add('jide-orientation-vertical');
			}
		});
		this.classList.add('jide-tilepane');
		if(this.orientation === Orientation.HORIZONTAL) {
			this.classList.add('jide-orientation-horizontal');
		} else {
			this.classList.add('jide-orientation-vertical');
		}
	};
    var TilePane = exports;

	Class(TilePane).extends(Pane).def(/** @lends module:jidejs/ui/layout/TilePane# */{
		dispose: function() {
			Pane.prototype.dispose.call(this);
			installer.dispose(this);
		},

		/**
		 * The horizontal spacing between each column.
		 * @type number
		 */
		hgap: 0,
		/**
		 * The horizontal spacing between each column.
		 * @type module:jidejs/base/ObservableProperty
		 */
		hgapProperty: null,
		/**
		 * The vertical spacing between each row.
		 * @type number
		 */
		vgap: 0,
		/**
		 * The vertical spacing between each row.
		 * @type module:jidejs/base/ObservableProperty
		 */
		vgapProperty: null,
		/**
		 * The preferred number of rows, if the components are {@link module:jidejs/ui/control/TilePane#orientation oriented} horizontally.
		 * @type number
		 */
		prefRows: 0,
		/**
		 * The preferred number of rows, if the components are {@link module:jidejs/ui/control/TilePane#orientation oriented} horizontally.
		 * @type module:jidejs/base/ObservableProperty
		 */
		prefRowsProperty: null,
		/**
		 * The preferred number of columns, if the components are {@link module:jidejs/ui/control/TilePane##orientation oriented} vertically.
		 * @type number
		 */
		prefColumns: 5,
		/**
		 * The preferred number of columns, if the components are {@link module:jidejs/ui/control/TilePane##orientation oriented} vertically.
		 * @type module:jidejs/base/ObservableProperty
		 */
		prefColumnsProperty: null,
		/**
		 * The orientation of the components.
		 *
		 * When oriented horizontally, the children will be organized into columns, split across multiple rows when
		 * necessary. Otherwise they will be organized into rows, split across multiple columns when necessary.
		 *
		 * @type module:jidejs/ui/Orientation
		 */
		orientation: Orientation.HORIZONTAL,
		/**
		 * The orientation of the components.
		 * @see module:jidejs/ui/control/TilePane##orientation
		 * @type module:jidejs/base/ObservableProperty
		 */
		orientationProperty: null,

		_insertChildAt: function(child, index) {
			var div = document.createElement('div');
			div.appendChild(child.element);
			// find row/col to which the index belongs
			var perRow = this.orientation === Orientation.HORIZONTAL ? this.prefColumns : this.prefRows;
			var containerIndex = 0;
			while(0 <= (index - perRow)) {
				containerIndex++;
				index -= perRow;
			}
			var parent = this.element.childNodes[containerIndex];
			if(!parent) {
				parent = document.createElement('div');
				this.element.appendChild(parent);
			}
			DOM.insertElementAt(parent, div, index);
			while(perRow < parent.childNodes.length) {
				// one element needs to overflow to the next container
				containerIndex++;
				var lastChild = parent.lastChild;
				var overflowContainer = this.element.childNodes[containerIndex];
				if(!overflowContainer) {
					overflowContainer = document.createElement('div');
					this.element.appendChild(overflowContainer);
				}
				DOM.insertElementAt(overflowContainer, lastChild, 0);
				parent = overflowContainer;
			}
		},

		_removeChild: function(child) {
			// find row/col to which the index belongs
			var perRow = this.orientation === Orientation.HORIZONTAL ? this.prefColumns : this.prefRows;
			var containerIndex = 0;
			var childNodes = this.element.childNodes;
			var childElement = child.element;
			var parent = null;
			for(var len = childNodes.length; !parent && containerIndex < len; containerIndex++) {
				if(childNodes[containerIndex].contains(childElement)) {
					parent = childNodes[containerIndex];
				}
			}
			childElement.parentNode.parentNode.removeChild(childElement.parentNode);
			var containerCount = childNodes.length;
			// one element needs to flow back to the container
			while(parent.childNodes.length < perRow && containerIndex < containerCount) {
				var overflowContainer = childNodes[containerIndex];
				parent.appendChild(overflowContainer.firstChild);
				parent = overflowContainer;
				containerIndex++;
			}
			if(this.element.lastChild.childNodes.length === 0) {
				this.element.removeChild(this.element.lastChild);
			}
		},

		layoutChildren: function() {
			var table = this.element,
				tileHeight = 0,
				tileWidth = 0;
			// iterate over all rows and cells to get the maximum sizes
			var row = table.firstChild, cell;
			if(this.orientation === Orientation.HORIZONTAL) {
				for(row = table.firstChild; row; row = row.nextSibling) {
					tileHeight = Math.max(tileHeight, DOM.measure(row).height);
					for(cell = row.firstChild; cell; cell = cell.nextSibling) {
						tileWidth = Math.max(tileWidth, DOM.measure(cell).width);
					}
				}
				// apply height to all rows
				for(row = table.firstChild; row; row = row.nextSibling) {
					row.style.height = tileHeight + "px";
				}
				// apply width to the cells in the first row
				for(cell = table.firstChild.firstChild; cell; cell = cell.nextSibling) {
					cell.style.width = tileWidth + "px";
				}
			} else {
				for(row = table.firstChild; row; row = row.nextSibling) {
					tileWidth = Math.max(tileWidth, DOM.measure(row).width);
					for(cell = row.firstChild; cell; cell = cell.nextSibling) {
						tileHeight = Math.max(tileHeight, DOM.measure(cell).height);
					}
				}
				// apply width to all rows
				for(row = table.firstChild; row; row = row.nextSibling) {
					row.style.width = tileWidth + "px";
				}
				// apply height to the cells in the first row
				for(cell = table.firstChild.firstChild; cell; cell = cell.nextSibling) {
					cell.style.height = tileHeight + "px";
				}
			}
		}
	});
	var installer = Observable.install(TilePane, 'hgap', 'vgap', 'prefRows', 'prefColumns', 'orientation');
	return TilePane;
});