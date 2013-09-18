/**
 * @module plugins/removeUseStrict
 * @author kpozin
 */
exports.handlers = {
	beforeParse: function (e) {
		e.source = e.source.replace(/(['"])use strict\1;/g, "");
	}
};