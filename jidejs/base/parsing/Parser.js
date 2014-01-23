/// @internal
/// @private
/// @author Patrick Gotthardt
/// This class is intended for internal use by jide.js only, it is not supported in any way and is not meant to be used
/// as public API.
define(['./../Class'], function(Class) {
	function Parser(tokens) {
		this._tokens = tokens;
		this._index = -1;
		this._length = tokens.length;
		this.hasNext = tokens.length > 0;
	}
	Class(Parser).def({
		set tokens(tokens) {
			this._tokens = tokens;
			this._index = -1;
			this._length = tokens.length;
			this.hasNext = tokens.length > 0;
		},

		hasNext: true,
		LA: function(i) {
			var index;
			if(-1 < i) {
				// lookahead
				index = this._index+i;
				if(index < this._length) {
					return this._tokens[index];
				}
				return null;
			} else {
				// lookback
				index = this._index - i;
				if(-1 < index) {
					return this._tokens[index];
				}
				return null;
			}
		},

		LB: function(i) {
			return this.LA(-i);
		},

		consume: function() {
			this._index++;
			this.hasNext = this._index+1 < this._length;
			return this._tokens[this._index];
		},

		matches: function(type) {
			for(var i = 1, len = arguments.length; i < len; i++) {
				var token = this.LA(i);
				if(!token || token.type !== arguments[i]) {
					return false;
				}
			}
			return true;
		}
	});
	return Parser;
});