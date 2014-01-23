/// @internal
/// @private
/// This class is intended for internal use only and should not be considered to be part of the public API.
define(function() {
	"use strict";
	var stack = [];
	return {
		begin: function(observable) {
			this.read(observable);
			stack.unshift({observable: observable, deps: []});
		},
		end: function(observable) {
			var d = stack.shift();
			return d.deps;
		},
		read: function(observable) {
			if(stack.length > 0) {
				stack[0].deps.push(observable);
			}
		}
	};
});