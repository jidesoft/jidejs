/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 06.11.12
 * Time: 15:40
 * To change this template use File | Settings | File Templates.
 */
define('jidejs/ui/Spacing', ['jidejs/base/Util'], function(_) {
	var toString = function() {
		return this.row + " " + this.column;
	};
	return function Spacing(row, col) {
		if(arguments.length === 1) {
			if(_.isString(row)) {
				var val = row.split(" ");
				row = val[0];
				col = val.length === 1 ? val[0] : val[1];
			} else {
				col = row;
			}
		}
		this.rowValue = Number(row);
		this.columnValue = Number(col);
		if(Number(row) === row) row = row + "px";
		if(Number(col) === col) col = col + "px";
		this.row = row;
		this.column = col;
		this.toString = toString;
	};
});