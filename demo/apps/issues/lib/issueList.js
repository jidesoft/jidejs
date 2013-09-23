define([
	'./issues', 'jidejs/base/Observable', 'jidejs/ui/control/ListView', 'jidejs/ui/control/Cell',
	'./TemplateView'
], function(issues, Observable, ListView, Cell, TemplateView) {
	"use strict";

	var listView = new ListView({
		classList: ['nav', 'nav-list', 'well', 'well-large', 'is-striped'],
		style: {
			'margin-left': '10px'
		},
		items: issues,
		width: '450px',
		height: '500px',
		cellFactory: function() {
			return new TemplateView({
				classList: ['jide-cell'],
				template: 'issue-item-tpl'
			});
		}
	});
	return listView;
});