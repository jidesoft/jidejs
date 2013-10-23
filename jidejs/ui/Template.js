/// @private
/// @internal
/// This file is not intended as a public API and should not be used outside of jide.js yet.
define('jidejs/ui/Template', [
	'jidejs/base/has',
	'jidejs/base/Util'
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

	function template(template) {
		if(_.isString(template)) {
			if(cache[template]) {
				return cache[template];
			}
			template = (cache[template] = transformStringToElement(template));
		}
		if(!has('templateElement') || !has('shadowDOM')) {
			rewriteTemplateElements(template);
		}
//		if(!has('templateElement')) {
//			rewriteTemplateElements(template);
//		}
//		if(!has('shadowDOM')) {
//			addPseudoClass(template);
//		}
		return template;
	}

	return template;
});