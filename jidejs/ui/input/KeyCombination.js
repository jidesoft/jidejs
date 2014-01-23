/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 27.09.12
 * Time: 07:08
 * To change this template use File | Settings | File Templates.
 */
define(['./../../base/Class', './../../base/Util'], function(Class, _) {
	function parseConfig(s) {
		// example: alt char:a
		var parts = s.split(' ');
		var config = {};
		for(var i = 0, len = parts.length; i < len; i++) {
			var p = parts[i];
			switch(p) {
				case 'ctrl':
				case 'shift':
				case 'alt':
				case 'meta':
					config[p] = true;
					break;
				default:
					var keyParts = p.split(':');
					if(keyParts.length === 1) {
						config.key = p;
					} else {
						var type = keyParts[0];
						if(type === 'char') {
							config.char = keyParts[1];
						} else {
							config.key = keyParts[1];
						}
					}
					break;
			}
		}
		return config;
	}

	function KeyCombination(config) {
		if(!(this instanceof KeyCombination)) return new KeyCombination(config);
		if(_.isString(config)) config = parseConfig(config);
		this.key = config.key;
		this.char = config.char;
		this.modifiers = (config.alt ? 1 : 0) | (config.shift ? 2 : 0)
			| (config.ctrl ? 4 : 0) | (config.meta ? 8 : 0)
	}

	Class(KeyCombination).def({
		match: function(keyEvent) {
			return (this.key && this.key === keyEvent.key
				|| this.char && this.char === keyEvent.char)
				&& this.modifiers === (this.modifiers
					& ((keyEvent.altKey ? 1 : 0) | (keyEvent.shiftKey ? 2 : 0)
						| (keyEvent.ctrlKey ? 4 : 0) | (keyEvent.metaKey ? 8 : 0)));

		},

		toString: function() {
			return ((this.modifiers & 1) === 1 ? 'alt+' : '')
				+ ((this.modifiers & 2) === 2 ? 'shift+' : '')
				+ ((this.modifiers & 4) === 4 ? 'ctrl+' : '')
				+ ((this.modifiers & 8) === 8 ? 'meta+' : '')
				+ (this.key || this.char);
		}
	});
	return KeyCombination;
});