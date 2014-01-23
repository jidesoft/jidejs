/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 18.09.12
 * Time: 11:28
 * To change this template use File | Settings | File Templates.
 */
define(['./../.././Class', './Point', './Size'], function(Class, Point, Size) {
	function Rect(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	Class(Rect).def({
		get topLeft() {
			return new Point(this.x, this.y);
		},

		set topLeft(p) {
			this.x = p.x;
			this.y = p.y;
		},

		get topRight() {
			return new Point(this.x+this.width, this.y);
		},

		get size() {
			return new Size(this.width, this.height);
		},

		set size(value) {
			this.width = value.width;
			this.height = value.height;
		}
	});

	return Rect;
});