/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 18.09.12
 * Time: 11:43
 * To change this template use File | Settings | File Templates.
 */
define(['./../../base/Class'], function(Class) {
	function Insets(top, right, bottom, left) {
		switch(arguments.length) {
			case 0: this.top = this.left = this.bottom = this.right = 0; break;
			case 1: this.top = top; this.left = top; this.bottom = top; this.right = top; break;
			case 2: this.top = top; this.bottom = top; this.left = right; this.right = right; break;
			default:
				this.top = top;
				this.left = left;
				this.bottom = bottom;
				this.right = right;
				break;
		}
	}

	Class(Insets).def({
		toString: function() {
			return this.top+"px " + this.right+"px " + this.bottom+"px " + this.left+"px";
		},

		clone: function() {
			return new Insets(this.top, this.left, this.bottom, this.right);
		}
	});

	return Insets;
});