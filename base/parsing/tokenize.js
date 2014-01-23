/// @internal
/// @private
/// @author Patrick Gotthardt
/// This class is intended for internal use by jide.js only, it is not supported in any way and is not meant to be used
/// as public API.
define(function() {
	function tokenize(macros, tokens, input) {
		var tokenList = toTokenList(tokens, macros);
		var regex = new RegExp('('+tokenList.map(function(token) {
			return token.rule;
		}).join(')|(')+')', 'g');
		var result = [], match;
		regex.lastIndex = 0;
		while(match = regex.exec(input)) {
			var index = -1;
			for(var i = 1, len = tokenList.length + 1; i < len; i++) {
				if(match[i]) {
					index = i;
					break;
				}
			}
			if(index === -1) {
				return null;
			}
			var token = Object.create(tokenList[index-1]);
			token.text = match[0];
			result.push(token);
		}
		return result;
	}

	function expand(token, macros) {
		return token.replace(/#\{([^\}]+)\}/g, function(match) {
			var id = match.match(/#\{([^\}]+)\}/)[1];
			return macros[id];
		});
	}

	function toTokenList(tokens, macros) {
		var tokenPrototypes = [];
		for(var ruleName in tokens) {
			if(tokens.hasOwnProperty(ruleName)) {
				var token = tokens[ruleName];
				token = expand(token, macros);
				tokenPrototypes.push({
					type: ruleName,
					rule: token
				});
			}
		}
		return tokenPrototypes;
	}

	return tokenize;
});