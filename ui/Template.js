/**
 * This module exports a single function that should be used to convert a string to an HTML template element.
 * If the client browser doesn't support the new template element, it takes care of shimming its API.
 *
 * Please note that unlike the real HTML element such Shims do not support inline script or style elements. If you do use
 * script or style elements, their value is applied globally.
 *
 * If the root template element has a `ref` attribute, the element returned by a query for the selector is used instead.
 *
 * @module jidejs/ui/Template
 */
define([
	'./../base/has',
	'./../base/Util'
], function(has, _) {
	"use strict";

	var cache = {}, needsCloneNodeFix = (function() {
        // as far as I know, IE is the only current browser
        // that actually needs this fix, but still...
        if(has('templateElement')) return false;
        var a = document.createElement('template'),
            b = document.createElement('template'),
            aFrag = document.createDocumentFragment(),
            bFrag = document.createDocumentFragment();

        bFrag.appendChild(document.createTextNode('test'));
        b.content = bFrag;
        aFrag.appendChild(b);
        a.content = aFrag;

        var clone = a.content.cloneNode();

        if(!clone.firstElementChild) return true;
        if(!clone.firstElementChild.content) return true;
        return false;
    }());
    template.needsCloneNodeFix = needsCloneNodeFix;

	function transformStringToElement(templateContent) {
		var div = document.createElement('div');
		div.innerHTML = templateContent;
		var template = div.firstElementChild;
		return template;
	}

	function addPseudoClass(template) {
		var pseudos = template.content.querySelectorAll('[pseudo]');
		for(var i = 0, len = pseudos.length; i < len; i++) {
			var pseudo = pseudos[i],
				pseudoId = pseudo.getAttribute('pseudo');
			if(has('classList')) {
                if(!pseudo.classList) {
                    // special case to support SVG elements
                    if(typeof pseudo.className.baseVal !== 'undefined') {
                        pseudo.className.baseVal += ' '+pseudoId;
                    }
                } else {
				    pseudo.classList.add(pseudoId);
                }
			} else if(typeof pseudo.className.baseVal !== 'undefined') {
                pseudo.className.baseVal += ' '+pseudoId;
			} else {
                pseudo.className += ' '+pseudoId;
            }
		}
	}

	function removeContentFromDOM(e) {
		var frag = document.createDocumentFragment();
		while(e.hasChildNodes()) {
			frag.appendChild(e.firstChild);
		}
        e.content = frag;
	}

	function rewriteTemplateElements(template) {
		if(!template.content) {
            removeContentFromDOM(template);
            if(needsCloneNodeFix) fixCloneNode(template);
        }
		if(!has('shadowDOM')) addPseudoClass(template);
		var templates = template.content.querySelectorAll('template');
		for(var i = 0, len = templates.length; i < len; i++) {
			var e = templates[i];
			if(!e.content) {
                removeContentFromDOM(e);
                if(needsCloneNodeFix) fixCloneNode(e);
            }
			if(!has('shadowDOM')) {
				addPseudoClass(e);
			}
		}
		return template;
	}

    var originalCloneNode = document.createDocumentFragment().cloneNode;
    function fixCloneNode(e) {
        var originalTemplates = e.content.querySelectorAll('template');
        e.content.cloneNode = function(flag) {
            var copy = originalCloneNode.call(this, flag);
            var templates = copy.querySelectorAll('template');
            for(var i = 0, len = templates.length; i < len; i++) {
                var template = templates[i];
                if(!template.content) template.content = originalTemplates[i].content;
            }
            return copy;
        };
    }

    /**
     * Converts a string or element into an HTML5 template element or shims it, if the browser doesn't support
     * the template element.
     *
     * Returns the converted element.
     *
     * @alias module:jidejs/ui/Template
     * @param {String|HTMLElement} template
     * @returns {HTMLElement}
     */
	var exports = function template(template) {
		if(_.isString(template)) {
			if(cache[template]) {
				return cache[template];
			}
			template = (cache[template] = transformStringToElement(template));
		}
		if(template.hasAttribute('ref')) {
			// support template references
			var ref = template.getAttribute('ref');
			var refTemplate = document.querySelector(ref);
			if(refTemplate) {
				template = refTemplate;
			}
		}
		if(!has('templateElement') || !has('shadowDOM')) {
			rewriteTemplateElements(template);
		}
		return template;
	};

    exports.getContent = function(template) {
        return template.content || template.getAttribute('content');
    };

	return exports;
});