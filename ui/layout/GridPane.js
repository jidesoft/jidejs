/**
 * The GridPane is the most powerful of all layout panes and allows components to be arranged in a complex grid.
 *
 * Using the GridPane layout, it is possible to recreate the {@link module:jidejs/ui/layout/BorderPane} layout or
 * even a lot more complicated layouts.
 *
 * While the GridPane is powerful, it is also very easy to use. To create a GridPane, you need to specify a `grid`
 * template as well as its `rowDefinition` and `columnDefinition`.
 * The template allows adding components to regions by using a custom region identifier, specified within the template.
 *
 * It will try to use the emerging CSS `grid layout` standard and tries to be as compatible to it as possible
 * but must fall back to using HTML tables when this layout is not supported by the browser.
 *
 * @example
 * 	//Using the "grid" template mechanism
 * 	new GridPane({
 * 		// the grid is specified as an array where each grid row is one item of the array.
 * 		// the sidebar spans two rows, the header spans two columns,
 * 		// content is placed in the center of the pane, aside spans two rows,
 * 		// footer spans two columns.
 * 	    grid: [
 * 	    	"sidebar header  header",
 * 	    	"sidebar content aside",
 * 	    	"footer  footer  aside"
 * 	    ],
 * 	    // first and last row should be as high as necessary,
 * 	    // the middle row should take all available space
 * 	    rowDefinition: "auto 1fr auto",
 * 	    // the first column should be 250px wide, the middle column should take all unused space
 * 	    // and the last column should be as wide as necessary
 * 	    columnDefinition: "250px 1fr auto",
 *
 * 	    children: [
 * 	    	new Label({
 * 	    		text: 'My GridPane demo',
 * 	   			'GridPane.area': 'header' // place the component in the 'header' area defined in the grid template
 * 	    	}),
 * 	    	// ...
 * 	    ]
 * 	});
 *
 * @example
 * 	// Using GridPane without template
 * 	new GridPane({
 * 	    // first and last row should be as high as necessary,
 * 	    // the middle row should take all available space
 * 	    rowDefinition: "auto 1fr auto",
 * 	    // the first column should be 250px wide, the middle column should take all unused space
 * 	    // and the last column should be as wide as necessary
 * 	    columnDefinition: "250px 1fr auto",
 *
 * 	    children: [
 * 	    	new Label({
 * 	    		text: 'My GridPane demo',
 * 	    		// place the component in the first row and second column, spanning
 * 	    		// two columns, same as the "header" area of the previous example
 * 	   			'GridPane.position': {row: 0, column: 1, colspan: 2}
 * 	    	}),
 * 	    	// place the sidebar in the first row and first column, spanning two rows;
 * 	    	// same as the "sidebar" area the previous example;
 * 	    	// using the function syntax to set the property
 * 	    	GridPane.position(mySidebarComponent, {
 * 	    	 row: 0, column: 0, rowspan: 2
 * 	    	})
 * 	    	// ...
 * 	    ]
 * 	});
 *
 * 	@module jidejs/ui/layout/GridPane
 */
define([
	'./../../base/Class',
	'./../../base/ObservableProperty',
	'./Pane',
	'./../../base/DOM',
	'./../../base/has',
	'./../AttachedProperty',
	'./../../base/parsing/tokenize',
	'./../../base/parsing/Parser',
	'./../Spacing',
	'./../Component'
], function(
	Class, Observable, Pane, DOM, has, AttachedProperty, tokenize, Parser, Spacing, Component
) {
	"use strict";
	//region grid creation
	function createGridFor(spec) {
		var doc = document;
		var table = doc.createElement("table");
		var colgroup = doc.createElement('colgroup');
		var tbody = doc.createElement("tbody");
		table.appendChild(colgroup);
		table.appendChild(tbody);

		// build a matrix
		var matrix = [], rows = 0, columns = 0, y, x;
		for(y = 0, rows = spec.length; y < rows; y++) {
			var cells = spec[y].split(/\s+/);
			matrix[y] = [];
			for(x = 0, columns = cells.length; x < columns; x++) {
				matrix[y][x] = cells[x];
			}
		}

		for(x = 0; x < columns; x++) {
			colgroup.appendChild(doc.createElement('col'));
		}

		var areas = {};

		// now build the table structure
		for(y = 0; y < rows; y++) {
			var tr = doc.createElement("tr");
			tbody.appendChild(tr);
			for(x = 0; x < columns; x++) {
				var area = matrix[y][x];
				if(area !== '.' && y > 0 && matrix[y-1][x] === area) continue;

				var td = doc.createElement("td");
				td.className = 'jide-grid-cell jide-grid-cell-'+(area === '.' ? 'jide-space' : area);
				areas[area] = td;
				if(area !== '.') {
					var colspan = 1, rowspan = 1;
					while(x+1 < columns && matrix[y][x+1] === area) {
						colspan++;
						x++;
					}
					for(var i = 1; y+i < rows && matrix[y+i][x] === area; i++) {
						rowspan++;
					}
					if(colspan > 1) {
						td.setAttribute('colspan', colspan);
					}
					if(rowspan > 1) {
						td.setAttribute('rowspan', rowspan);
					}
				}
				tr.appendChild(td);
			}
		}

		return {
			element: table,
			areas: areas,
			matrix: matrix,
			colgroup: colgroup
		};
	}

	function createGrid(columns, rows) {
		var doc = document;
		var table = doc.createElement("table");
		var colgroup = doc.createElement('colgroup');
		var tbody = doc.createElement("tbody");
		table.appendChild(colgroup);
		table.appendChild(tbody);

		var matrix = [];

		for(var i = 0, len = columns.length; i < len; i++) {
			colgroup.appendChild(doc.createElement('col'));
		}

		for(var row = 0, rowCount = rows.length; row < rowCount; row++) {
			var tr = doc.createElement('tr');
			var items = [];
			matrix.push(items);

			for(var col = 0, colCount = columns.length; col < colCount; col++) {
				var td = doc.createElement('td');
				tr.appendChild(td);
				items.push(td);
			}
			tbody.appendChild(tr);
		}

		return {
			element: table,
			matrix: matrix,
			colgroup: colgroup
		}
	}

	function analyzeGrid(spec) {
		// build a matrix
		var matrix = [], rows = 0, columns = 0, y, x;
		for(y = 0, rows = spec.length; y < rows; y++) {
			var cells = spec[y].split(/\s+/);
			matrix[y] = [];
			for(x = 0, columns = cells.length; x < columns; x++) {
				matrix[y][x] = cells[x];
			}
		}

		var areas = {};
		for(y = 0; y < rows; y++) {
			for(x = 0; x < columns; x++) {
				var area = matrix[y][x];
				if(area !== '.' && y > 0 && matrix[y-1][x] === area) continue;

				areas[area] = {
					column: x+1,
					row: y+1,
					colspan: 1,
					rowspan: 1
				};
				if(area === '.') continue;

				var colspan = 1, rowspan = 1;
				while(x+1 < columns && matrix[y][x+1] === area) {
					colspan++;
					x++;
				}
				for(var i = 1; y+i < rows && matrix[y+i][x] === area; i++, rowspan++) {
					rowspan++;
				}

				areas[area].colspan = colspan;
				areas[area].rowspan = rowspan;
			}
		}

		return areas;
	}
	//endregion

	//region Parser definition
	var definitionMacros = {
	};
	var definitionTokens = {
		'number': '(?:\\d*\\.)?\\d+',
		'unit': 'px|em|fr',
		'lparen': '\\(',
		'rparen': '\\)',
		'comma': ',',
		'minmax': 'minmax',
		'literal': 'm(?:in|ax)-content|auto'
	};
	function parseDefinition(def) {
		var tokens = tokenize(definitionMacros, definitionTokens, def);
		var parser = new Parser(tokens);
		var definition = [];
		while(parser.hasNext) {
			definition.push(parseNext(parser));
		}
		return definition;
	}
	function parseNext(parser) {
		switch(parser.LA(1).type) {
			case 'number':
				return parseNumber(parser);
				break;
			case 'literal':
				return parseLiteral(parser);
				break;
			case 'minmax':
				return parseMinMax(parser);
				break;
			default:
				parser.consume();
				break;
		}
	}
	function parseNumber(parser) {
		var number = Number(parser.consume().text);
		var unit = 'px';
		if(parser.LA(1).type === 'unit') {
			unit = parser.consume().text;
		}
		return {
			type: 'number',
			value: number,
			unit: unit
		};
	}

	function parseLiteral(parser) {
		var size = parser.consume().text;
		return {
			type: 'literal',
			size: size
		};
	}

	function parseMinMax(parser) {
		parser.consume();
		if(parser.LA(1) === 'lparen') parser.consume();
		var minValue = parseNext(parser);
		if(parser.matches('comma')) parser.consume();
		var maxValue = parseNext(parser);
		if(parser.matches('rparen')) parser.consume();
		return {
			type: 'minmax',
			min: minValue,
			max: maxValue
		};
	}
	//endregion

	//region size calculation functions
	function columnSize(grid, table, colIndex, colCount, fn) {
		var tbody = table.childNodes[1],
			childNodes = tbody.childNodes,
			width = -1, cell, size;
		if(grid.areas && grid._matrix) {
			// we're able to optimize
			var matrix = grid._matrix, areas = grid.areas;
			for(var i = 0, len = matrix.length; i < len; i++) {
				var col = matrix[i][colIndex];
				cell = areas[col];
				if(cell.colSpan === 1) {
					// ignore every cell that spans more than 1 column
					if(cell.hasChildNodes()) {
						// ignore empty cells
						size = DOM.measure(cell.firstChild);
						width = width !== -1 ? fn(width, size.width) : size.width;
					}
				}
				if(cell.rowSpan > 1) {
					i += cell.rowSpan - 1;
				}
			}
			return width;
		}
		for(var i = 0, len = childNodes.length; i < len; i++) {
			var row = childNodes[i];
			if(row.childNodes.length === colCount) {
				cell = row.childNodes[colIndex];
				if(cell.hasChildNodes()) {
					size = DOM.measure(cell.firstChild);
					width = width !== -1 ? fn(width, size.width) : size.width;
				}
			} else {
				// FIXME: Doesn't seem to work properly, doesn't always find usable cells
				for(var j = 0, rowLength = row.childNodes.length, index = 0; j < rowLength; j++, index++) {
					cell = row.childNodes[j];
					if(cell.colSpan > 1) {
						index += cell.colSpan;
					} else if(index === colIndex) {
						if(cell.hasChildNodes()) {
							size = DOM.measure(cell.firstChild);
							width = width !== -1 ? fn(width, size.width) : size.width;
						}
						break;
					}
					if(colIndex < index) {
						break;
					}
				}
			}
		}
		return width;
	}
	function minColumnSize(grid, table, colIndex, colCount) {
		return columnSize(grid, table, colIndex, colCount, function(x, y) { return Math.min(x, y); });
	}
	function maxColumnSize(grid, table, colIndex, colCount) {
		return columnSize(grid, table, colIndex, colCount, function(x, y) { return Math.max(x, y); });
	}
	function rowSize(grid, table, rowIndex, fn) {
		var row = table.childNodes[1].childNodes[rowIndex];
		var height = -1;
		for(var i = 0, len = row.childNodes.length; i < len; i++) {
			var cell = row.childNodes[i];
			if(cell.hasChildNodes()) {
				if(cell.rowSpan === 1) {
					var size = DOM.measure(cell.firstChild);
					height = height !== -1 ? fn(size.height, height) : size.height;
				}
			}
		}
		return height;
	}
	function minRowSize(grid, table, rowIndex) {
		return rowSize(grid, table, rowIndex, function(x, y) { return Math.min(x, y); });
	}
	function maxRowSize(grid, table, rowIndex) {
		return rowSize(grid, table, rowIndex, function(x, y) { return Math.max(x, y); });
	}
	//endregion

	//region grid configuration
	function applyRowDefinition(table, spec) {
		var tbody = table.childNodes[1];
		var fractions = 0;
		for(var i = 0, len = spec.length; i < len; i++) {
			var tr = tbody.childNodes[i];
			var group = spec[i];
			if(group.type === 'number') {
				if(group.unit !== 'fr') {
					tr.style.height = group.value+group.unit;
				} else {
					fractions += group.value;
				}
			}
		}
		return fractions;
	}

	function applyColumnDefinition(table, spec) {
		var colgroup = table.firstChild;
		var fractions = 0;
		for(var i = 0, len = spec.length; i < len; i++) {
			var cell = colgroup.childNodes[i];
			var group = spec[i];
			if(group.type === 'number') {
				if(group.unit !== 'fr') {
					cell.style.width = group.value+group.unit;
				} else {
					fractions += group.value;
				}
			}
		}
		return fractions;
	}
	//endregion

	var HAS_GRID = has('grid');

	function setSpacing(event) {
		var val = event.value;
		if(val && !(val instanceof Spacing)) {
			return new Spacing(val);
		}
		return val;
	}

	/**
	 * Creates a new GridPane.
	 *
	 * @constructor
	 * @alias module:jidejs/ui/layout/GridPane
     * @extends module:jidejs/ui/layout/Pane
     *
     * @param {object} config The configuration.
     * @param {Array<string>} config.grid The grid template, one item for each row.
     * @param {string} config.rowDefinition The row definitions.
     * @param {string} config.columnDefinition The column definitions.
	 */
	var exports = function GridPane(config) {
		installer(this);
		if(HAS_GRID) {
			if(config.grid) {
				this.areas = analyzeGrid(config.grid);
			}
			var div = document.createElement('div');
			if(config.element && config.element.parentNode) {
				config.element.parentNode.replaceChild(div, config.element);
			}
			config.element = div;
		} else {
			this._columnDefinition = parseDefinition(config.columnDefinition);
			this._rowDefinition = parseDefinition(config.rowDefinition);
			var grid = config.grid ? createGridFor(config.grid) : createGrid(this._columnDefinition, this._rowDefinition);
			if(config.element && config.element.parentNode) {
				config.element.parentNode.replaceChild(grid.element, config.element);
			}
			config.element = grid.element;
			this.areas = grid.areas;
			this._matrix = grid.matrix;
			this._rowFractions = applyRowDefinition(grid.element, this._rowDefinition);
			delete config.rowDefinition;
			this._columnFractions = applyColumnDefinition(grid.element, this._columnDefinition);
			delete config.columnDefinition;
		}
		Pane.call(this, config);
		this.cellSpacingProperty.subscribe(setSpacing).bind(this);
		if(!HAS_GRID) {
			this.cellSpacingProperty.subscribe(function(event) {
				var spacing = event.value;
				this.style.set('border-spacing', spacing ? spacing.toString() : '0px').update();
			});
		}
		this.classList.add('jide-gridpane');
		this.classList.add(HAS_GRID ? 'jide-use-grid' : 'jide-use-table');
		if(HAS_GRID) {
			this.style.set('-ms-grid-columns', config.columnDefinition)
				.set('-webkit-grid-columns', config.columnDefinition)
				.set('-o-grid-columns', config.columnDefinition)
				.set('grid-columns', config.columnDefinition)
				.set('-ms-grid-rows', config.rowDefinition)
				.set('-webkit-grid-rows', config.rowDefinition)
				.set('-o-grid-rows', config.rowDefinition)
				.set('grid-rows', config.rowDefinition)
				.update();
		}
		if(this.children.length > 0) this.requestLayout();
	};
    var GridPane = exports;
	Class(GridPane).extends(Pane).def(/** @lends module:jidejs/ui/layout/GridPane# */{
		dispose: function() {
			Pane.prototype.dispose.call(this);
			installer.dispose(this);
		},

		cellSpacing: new Spacing(0, 0), cellSpacingProperty: null,
		_insertChildAt: function(child, index) {
			GridPane.area.register(child);
			var area = GridPane.area(child);
			var pos = GridPane.position(child);
			if(HAS_GRID) {
				var def = pos || this.areas[area];
				child.style.set(has.prefix('gridColumn'), def.column)
					.set(has.prefix('gridRow'), def.row);
				if(def.colspan > 1) {
					child.style.set(has.prefix('gridColumnSpan'), def.colspan)
				}
				if(def.rowspan > 1) {
					child.style.set(has.prefix('gridRowSpan'), def.rowspan)
				}
				child.style.update();
				this.element.appendChild(child.element);
			} else if(this.areas && area) {
				var e = this.areas[area];
				if(e.childNodes.length === 1) {
					e.replaceChild(child.element, e.childNodes[0]);
				} else {
					e.appendChild(child.element);
				}
			} else if(this._matrix && pos) {
				var matrix = this._matrix;
				var col = matrix[pos.row-1][pos.column-1];
				var colspan = pos.colspan || 1;
				var rowspan = pos.rowspan || 1;
				var tbody = this.element.childNodes[1];
				if(colspan > 1) col.colSpan = colspan;
				if(rowspan > 1) col.rowSpan = rowspan;
				if(rowspan > 1 && colspan > 1) {
					for(var i = 1, len = rowspan; i < len; i++) {
						for(var j = 1, len2 = colspan; j < len2; j++) {
							var old = matrix[pos.row-1+i][pos.column-1+j];
							tbody.childNodes[pos.row-1+i].removeChild(old);
							matrix[pos.row-1+i][pos.column-1+j] = col;
						}
					}
				} else if(colspan > 1) {
					for(var i = 1, len = colspan; i < len; i++) {
						var old = matrix[pos.row-1][pos.column-1+i];
						tbody.childNodes[pos.row-1].removeChild(old);
						matrix[pos.row-1][pos.column-1+i] = col;
					}
				} else if(rowspan > 1) {
					for(var i = 1, len = rowspan; i < rowspan; i++) {
						var old = matrix[pos.row-1+i][pos.column-1];
						tbody.childNodes[pos.row-1+i].removeChild(old);
						matrix[pos.row-1+i][pos.column-1] = col;
					}
				}
				if(col.hasChildNodes()) {
					col.replaceChild(child.element, col.childNodes[0]);
				} else {
					col.appendChild(child.element);
				}
			}
		},

		_removeChild: function(child) {
			GridPane.area.unregister(child);
			var area = GridPane.area(child);
			if(HAS_GRID) {
				this.element.removeChild(child.element);
			} else if(this.areas) {
				var e = this.areas[area];
				e.removeChild(child.element);
			} else if(this._matrix) {
				var tbody = this.element.childNodes[1];
				var matrix = this._matrix;
				for(var y = 0, rowCount = matrix.length; y < rowCount; y++) {
					var row = matrix[y];
					for(var x = 0, columnCount = row.length; x < columnCount; x++) {
						var cell = row[x];
						if(cell.firstChild === child.element) {
							cell.removeChild(child.element);
							// normalize table structure and matrix
							if(cell.colSpan > 1 && cell.rowSpan > 1) {
								for(var j = y+1; j < y+cell.rowSpan; j++) {
									var tr = tbody.childNodes[j];
									for(var i = x+1; i < x+cell.colSpan; i++) {
										var td = document.createElement('td');
										matrix[j][i] = td;
										tr.insertBefore(td, matrix[j][x+cell.colSpan]);
									}
								}
							} else if(cell.colSpan > 1) {
								var tr = tbody.childNodes[y];
								for(var i = x+1; i < x+cell.colSpan; i++) {
									var td = document.createElement('td');
									matrix[y][i] = td;
									tr.insertBefore(td, matrix[y][x+cell.colSpan]);
								}
							} else if(cell.rowSpan > 1) {
								for(var j = y+1; j < y+cell.rowSpan; j++) {
									var td = document.createElement('td');
									matrix[j][x] = td;
									tbody.childNodes[j].insertBefore(td, matrix[j][x+cell.rowSpan]);
								}
							}
							return;
						}
					}
				}
			}
		},

		layoutChildren: function() {
			if(HAS_GRID || !this._rowDefinition && !this._columnDefinition) return;

			var columnFractions = [], rowFractions = [],
				totalFractions = 0;
			var colDef = this._columnDefinition,
				rowDef = this._rowDefinition;
			var colgroup = this.element.firstChild,
				tbody = this.element.childNodes[1],
				totalSize;

			var i, len, def, size,
				usedWidth = this.cellSpacing.columnValue * (2+colDef.length),
				usedHeight = this.cellSpacing.rowValue * (2+rowDef.length),
				min, max, t;
			// Apply width to columns
			for(i = 0, len = colDef.length; i < len; i++) {
				def = colDef[i];
				var col = colgroup.childNodes[i];
				if(def.type === 'number') {
					if(def.unit === 'fr') {
						columnFractions.push({
							fraction: def.value,
							element: col
						});
						totalFractions += def.value;
					} else if(def.unit === 'px') {
						usedWidth += def.value;
					} else {
						usedWidth += DOM.measure(col).width;
					}
				} else if(def.type === 'literal') {
					if(def.value === 'min-content') {
						size = minColumnSize(this, this.element, i, len);
					} else { // 'auto' & 'max-content'
						size = maxColumnSize(this, this.element, i, len);
					}
					usedWidth += size;
					col.style.width = size+"px";
				} else if(def.type === 'minmax') {
					size = maxColumnSize(this, this.element,i, len);
					if(def.min.type === 'literal') {
						if(def.min.value === 'min-content') {
							min = minColumnSize(this, this.element, i, len);
						} else {
							min = size;
						}
					} else if(def.min.type === 'number' && def.min.unit === 'px') {
						min = def.min.value;
					}
					if(def.max.type === 'literal') {
						if(def.max.value === 'min-content') {
							max = minColumnSize(this, this.element, i, len);
						} else {
							max = size;
						}
					} else if(def.max.type === 'number' && def.max.unit === 'px') {
						max = def.max.value;
					}
					if(max < min) {
						t = min;
						max = min;
						min = t;
					}
					if(size < min) {
						size = min;
					}
					if(max < size) {
						size = max;
					}
					usedWidth += size;
					col.style.width = size+"px";
				}
			}
			if(totalFractions > 0) {
				totalSize = this.measure();
				var maxWidth = totalSize.width - usedWidth;
				for(i = 0, len = columnFractions.length; i < len; i++) {
					col = columnFractions[i];
					col.element.style.width = ((col.fraction / totalFractions)*maxWidth)+"px";
				}
			}

			// apply row height
			for(i = 0, len = rowDef.length, totalFractions = 0; i < len; i++) {
				def = rowDef[i];
				var row = tbody.childNodes[i];
				if(def.type === 'number') {
					if(def.unit === 'fr') {
						rowFractions.push({
							fraction: def.value,
							element: row
						});
						totalFractions += def.value;
					} else if(def.unit === 'px') {
						usedHeight += def.value;
					} else {
						usedHeight += DOM.measure(row).height;
					}
				} else if(def.type === 'literal') {
					if(def.value === 'min-content') {
						size = minRowSize(this, this.element, i);
					} else { // 'auto' & 'max-content'
						size = maxRowSize(this, this.element, i);
					}
					usedHeight += size;
					row.style.height = size+"px";
				} else if(def.type === 'minmax') {
					size = maxRowSize(this, this.element, i);
					if(def.min.type === 'literal') {
						if(def.min.value === 'min-content') {
							min = minRowSize(this, this.element, i);
						} else {
							min = size;
						}
					} else if(def.min.type === 'number' && def.min.unit === 'px') {
						min = def.min.value;
					}
					if(def.max.type === 'literal') {
						if(def.max.value === 'min-content') {
							max = minRowSize(this, this.element, i);
						} else {
							max = size;
						}
					} else if(def.max.type === 'number' && def.max.unit === 'px') {
						max = def.max.value;
					}
					if(max < min) {
						t = min;
						max = min;
						min = t;
					}
					if(size < min) {
						size = min;
					}
					if(max < size) {
						size = max;
					}
					usedHeight += size;
					row.style.height = size+"px";
				}
			}

			if(totalFractions > 0) {
				if(!totalSize) totalSize = this.measure();
				var maxHeight = totalSize.height - usedHeight;
				for(i = 0, len = rowFractions.length; i < len; i++) {
					row = rowFractions[i];
					var height = ((row.fraction / totalFractions)*maxHeight)+"px";
					row.element.style.height = height;
					var child = row.element.firstChild;
					do {
						child.style.height = height;
						if(child.hasChildNodes()) {
							var component = Component.fromElement(child.firstChild);
							if(component) {
								component.style.set('height', height).update();
							}
						}
					} while(child = child.nextSibling)
				}
			}

			// relayout all children...
			var children = this.children.toArray();
			for(i = 0, len = children.length; i < len; i++) {
				var child = children[i];
				if(child.requestLayout) {
					child.requestLayout();
				}
			}
		}
	});
	var installer = Observable.install(GridPane, 'cellSpacing');

	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies the area, as defined by the `grid` template, in which the component should be placed.
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {string?} value When specified, the component will be placed in the given area.
	 */
	exports.area = AttachedProperty('jidejs/ui/layout/GridPane.area', function(region, evt) {
		var component = evt.owner;
		var parent = component.parent;
		var isInGridPane = parent && parent instanceof GridPane;
		if(isInGridPane) {
			if(HAS_GRID) {
				var def = parent.areas[region];
				component.style.set(has.prefix('gridColumn'), def.column)
					.set(has.prefix('gridRow'), def.row);
				if(def.colspan > 1) {
					component.style.set(has.prefix('gridColumnSpan'), def.colspan)
				}
				if(def.rowspan > 1) {
					component.style.set(has.prefix('gridRowSpan'), def.rowspan)
				}
				component.style.update();
			} else {
				parent._removeChild(component);
				parent._insertChildAt(component);
			}
			parent.requestLayout();
		}
		return component;
	});

	/**
	 * Sets or returns the value of the property for the given component.
	 *
	 * Specifies the position in which the component should be placed when no `grid` template was used to create
	 * the GridPane.
	 *
	 * @function
	 * @param {module:jidejs/ui/Component} The component.
	 * @param {{row:number, column:number, rowspan:number, colspan:number}?} value When specified,
	 * 		the component will be placed at the given position, with the (optional) rowspan and colspan.
	 */
    exports.position = AttachedProperty('jidejs/ui/layout/GridPane.position', function(pos, evt) {
		var component = evt.owner;
		var parent = component.parent;
		var isInGridPane = parent && parent instanceof GridPane;
		if(isInGridPane) {
			if(HAS_GRID) {
				component.style.set(has.prefix('gridColumn'), pos.column)
					.set(has.prefix('gridRow'), pos.row);
				if(pos.colspan > 1) {
					component.style.set(has.prefix('gridColumnSpan'), pos.colspan)
				}
				if(pos.rowspan > 1) {
					component.style.set(has.prefix('gridRowSpan'), pos.rowspan)
				}
				component.style.update();
			} else {
				parent._removeChild(component);
				parent._insertChildAt(component);
			}
			parent.requestLayout();
		}
		return component;
	});

	return exports;
});