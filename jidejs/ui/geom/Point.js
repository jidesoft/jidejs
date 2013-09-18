/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 18.09.12
 * Time: 11:26
 * To change this template use File | Settings | File Templates.
 */
define(['jidejs/base/Class'], function(Class) {
	function Point(x, y) {
		this.x = x;
		this.y = y;
	}

	Class(Point).def({
		toString: function() {
			return this.x+"px "+this.y+"px";
		}
	});

	return Point;
});