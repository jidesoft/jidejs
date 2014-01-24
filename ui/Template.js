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

	var cache = {};

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
				pseudo.classList.add(pseudoId);
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
		if(!template.content) removeContentFromDOM(template);
		if(!has('shadowDOM')) addPseudoClass(template);
		var templates = template.content.querySelectorAll('template');
		for(var i = 0, len = templates.length; i < len; i++) {
			var e = templates[i];
			if(!e.content) removeContentFromDOM(e);
			if(!has('shadowDOM')) {
				addPseudoClass(e);
			}
		}
		return template;
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
	function template(template) {
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
	}

	return template;
});