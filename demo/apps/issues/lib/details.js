define([
	'jidejs/ui/layout/VBox', 'jidejs/ui/control/Label', 'jidejs/ui/control/TextArea', './TemplateView',
	'./issueList'
], function(VBox, Label, TextArea, TemplateView, issueList) {
	"use strict";

	var detailLayout = new TemplateView({
		template: 'details-tpl',
		width: '600px',
		height: '500px',
		style: {
			overflow: 'auto',
			margin: '0 10px'
		}
	});

	detailLayout.itemProperty.bind(issueList.selectionModel.selectedItemProperty);
	if(issueList.selectionModel.selectedItem === undefined) {
		detailLayout.item = null;
	}

	return detailLayout;
});