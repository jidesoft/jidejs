/// @internal
/// @private
/// This file is not considered to be part of the public API.

// This module helps with feature testing.
define('jidejs/base/has', function() {
	var cssPrefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'];
	var currentPrefix = '';
	var testElement = document.createElement('div');

	function has(testcase) {
		if(tests.hasOwnProperty(testcase)) {
			var test = tests[testcase];
			if(typeof test === 'function') {
				return tests[testcase] = test();
			}
			return test;
		}
		return undefined;
	}

	var tests = {
		// does the browser support the current flexbox specification?
		flexbox: function() {
			return has.prefix('flex-direction') !== undefined;
		},

		// does the browser support the old flexbox specification?
		'flexbox/legacy': function() {
			return has.prefix('box-flex') !== undefined;
		},

		'grid': function() {
			// Safari is to fault for this: It "supports" most CSS properties that could be used to detect
			// whether the CSS3 grid layout module is supported or not but doesn't actually implement any.
			// Which means it gives funny false-positive where the elements are simply not rendered at all.
			// Since the specification is currently being modified from what is implemented in IE10, we'll limit support
			// to IE.
			testElement.style.display = '-ms-grid';
			return testElement.style.display === '-ms-grid';

			// we need to test for CSS3 grid layout support by assigning the grid display style
			// since webkit already supports some properties but doesn't support the actual layout.
			// Thus relying on any property (i.e. currently there is no support for the "grid-column-span"
			// CSS property) is relatively unsafe.
			// However, it is safe to assume that the CSS3 grid layout module is not supported when
			// an important property such as grid-column is missing.
//			if(has.prefix('grid-column') === undefined) {
//				return false;
//			}
//			testElement.style.display = 'block';
//			for(var i = 0, len = cssPrefixes.length; i < len; i++) {
//				// skip "-moz-grid" which is a XUL layout and mustn't be used on a website
//				if(cssPrefixes[i] === 'Moz') continue;
//				var gridName = '-'+cssPrefixes[i].toLowerCase()+'-grid';
//				testElement.style.display = gridName;
//				if(testElement.style.display == gridName) {
//					return true;
//				}
//			}
//			return false;
		},

		// is WeakMap supported?
		WeakMap: function() {
			return typeof WeakMap !== 'undefined';
		},

		'customElements': function() {
			return document.register !== undefined;
		},

		'shadowDOM': function() {
			return false;
		},

		'templateElement': function() {
			return document.createElement('template').content !== undefined;
		},

		'classList': function() {
			return testElement.classList !== undefined;
		}
	};

	var cssPropertyNames = {};

	var dashRegex = /(\-[a-z])/,
		dashReplace = function(x) { return x.charAt(1).toUpperCase(); };

	/**
	 * Returns the prefixed name of a css property if a prefix is required or <code>undefined</code>
	 * if the property is not available at all.
	 * @param prop The CSS property to test for.
	 */
	has.prefix = function(prop) {
		prop = prop.replace(dashRegex, dashReplace);
		if(cssPropertyNames.hasOwnProperty(prop)) {
			return cssPropertyNames[prop];
		} else {
			var style = testElement.style;
			if(prop in style) {
				return cssPropertyNames[prop] = prop;
			}
			var cssPropertyName = prop.charAt(0).toUpperCase()+prop.substr(1);
			for(var i = 0, len = cssPrefixes.length; i < len; i++) {
				var prefixedPropertyName = cssPrefixes[i] + cssPropertyName;
				if(prefixedPropertyName in style) {
					return cssPropertyNames[prop] = prefixedPropertyName;
				}
			}
			return undefined;
		}
	};

	return has;
});