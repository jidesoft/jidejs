/**
 * @module jidejs/base/SvgPainter
 * @private
 * @internal
 */
define('jidejs/base/SvgPainter', [
	'jidejs/base/Class',
	'jidejs/base/Util',
	'jidejs/base/DOM',
	'jidejs/base/Disposer',
	'jidejs/base/Observable'
], function(Class, _, DOM, Disposer, Var) {
	"use strict";

	function Path(element, painter) {
		this.data = [];
		this.element = element;
		this.painter = painter;
		this._lastCommand = 'none';
		this._dependency = false;
		this._d = null;
	}
	Class(Path).def({
		_add: function(c, x, y) {
			if(this._lastCommand === c) {
				if(Var.is(x) || Var.is(y)) {
					this.data.push(Var.computed(function() {
						return x.get()+' '+ y.get();
					}));
					if(this._d) {
						this._d.bind(this.data[this.data.length-1])
					}
					this._dependency = true;
				} else {
					this.data.push(x+' '+y);
				}
			} else {
				if(Var.is(x) || Var.is(y)) {
					this.data.push(Var.computed(function() {
						return c+' '+ x.get()+' '+ y.get();
					}, [x, y]));
					if(this._d) {
						this._d.bind(this.data[this.data.length-1])
					}
					this._dependency = true;
				} else {
					this.data.push(c+' '+x+' '+y);
				}
				this._lastCommand = c;
			}
		},

		moveTo: function(x, y) {
			this._add('M', x, y);
		},

		lineTo: function(x, y) {
			this._add('L', x, y);
		},

		clear: function() {
			if(this._d) {
				this._dependency = false;
				this._d.dispose();
				this._d = null;
			}

			this.data.slice(0, this.data.length);
			this._lastCommand = 'none';
		},

		render: function(pathElement, properties) {
			pathElement = pathElement || this.element;
			if(!properties) properties = {};
			if(this._dependency) {
				var data = this.data;
				properties.d = this._d = Var.computed(function() {
					return data.map(function(prop) { return Var.is(prop) ? prop.get() : prop; }).join(' ');
				});
			} else {
				properties.d = this.data.join(' ');
			}

			if(pathElement) {
				return this.painter.create(pathElement, properties);
			}
			return this.painter.draw('path', properties);
		},

		dispose: function() {
			this.clear();
			this.painter = null;
			if(this.element.parentNode) {
				this.element.parentNode.removeChild(this.element);
			}
			this.element = null;
		}
	});

	function SvgPainter(svgRoot, layer, disposer) {
		this.svgRoot = svgRoot;
		this.root = layer || svgRoot;
		this.defs = svgRoot.querySelector('defs');
		this.defsPainter = null;
		this.disposer = disposer || new Disposer();
	}
	Class(SvgPainter).def({
		create: function(name, properties) {
			if(properties && properties.children && !Array.isArray(properties.children)) {
				var children = [];
				_.forEach(properties.children, function(name, properties) {
					children.push(this.create(name, properties));
				}, this);
				properties.children = children;
			}
			return DOM.createSvg(name, properties, this.disposer);
		},

		createPath: function() {
			return new Path(null, this);
		},

		drawPath: function(properties) {
			var element = this.create('path', properties);
			this.root.appendChild(element);
			return new Path(element, this);
		},

		draw: function(name, properties, callback) {
			var drawing = this.create(name, properties);
			if(callback) {
				callback(new SvgPainter(this.svgRoot, drawing, this.disposer));
			}
			this.root.appendChild(drawing);
			return this;
		},

		drawText: function(text, properties, callback) {
			this.draw('text', _.extends(properties || {}, {
				children: [
					document.createTextNode(text)
				]
			}), callback);
			return this;
		},

		layer: function(callback) {
			return this.draw('g', null, callback);
		},

		define: function(name, properties, callback) {
			if(!this.defs) {
				this.defs = this.create('defs');
				this.svgRoot.appendChild(this.defs);
			}
			if(!this.defsPainter) {
				this.defsPainter = new SvgPainter(this.svgRoot, this.defs, this.disposer)
			}
			this.defsPainter.draw(name, properties, callback);
			return this;
		},

		dispose: function() {
			this.disposer.dispose();
		}
	});
	return SvgPainter;
});