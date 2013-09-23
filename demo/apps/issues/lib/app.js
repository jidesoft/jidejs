define([
	'jidejs/ui/layout/BorderPane', './issueList', './details', './TemplateView',
	'jidejs/ui/control/MenuBar', 'jidejs/ui/control/MenuItem', 'jidejs/ui/control/Hyperlink',
	'jidejs/base/Observable', 'jidejs/base/Window'
], function(BorderPane, issueList, details, TemplateView, MenuBar, MenuItem, Hyperlink, Observable, Window) {
	"use strict";

	// Create the about view
	var aboutView = BorderPane.margin(BorderPane.region(new TemplateView({
		template: 'about-view-tpl'
	}), 'center'), '0');

	// and join issueList to details view for easier usage
	var appPage = new BorderPane({
		children: [
			BorderPane.margin(BorderPane.region(issueList, 'left'), '0'),
			BorderPane.margin(BorderPane.region(details, 'center'), '0 10px')
		]
	});

	// this observable stores the currently active page
	var activePage = Observable(appPage);
	// automatically replace the displayed page
	activePage.subscribe(function(event) {
		if(event.oldValue) {
			appLayout.children.remove(event.oldValue);
		}
		appLayout.children.add(event.value);
	});
	// this observable stores the currently active menu item
	var activeMenu = Observable();
	// automatically add/remove the "active" css class
	activeMenu.subscribe(function(event) {
		if(event.oldValue) event.oldValue.classList.remove('active');
		event.value.classList.add('active');
	});

	// make sure the aboutView knows it should be placed at the "center" slot
	BorderPane.region(aboutView, 'center');

	// a simple function that returns a function that updates the active page and menu.
	function selectPage(page) {
		return function() {
			activePage.set(page);
			activeMenu.set(this);
		};
	}

	// this is the menu displayed at the top of the page
	var menu = new MenuBar({
		'BorderPane.margin': '0',
		classList: ['navbar-fixed-top'],
		children: [
			// display our brand using Bootstrap display
			new Hyperlink({
				classList: ['brand'],
				href: 'http://js.jidesoft.com',
				text: 'jide.js',
				style: {
					'margin-left': '-10px'
				}
			}),
			new MenuItem({
				text: 'Issues',
				on: {
					click: selectPage(appPage)
				}
			}),
			new MenuItem({
				text: 'About',
				on: {
					click: selectPage(aboutView)
				}
			})
		]
	});
	// activate the "Issues" page
	activeMenu.set(menu.children.get(1));

	var footer;
	// create the app layout
	var appLayout = new BorderPane({
		width: '100%',
//		height: Window.heightProperty,
		children: [
			BorderPane.margin(BorderPane.region(menu, 'top'), '0'),
			BorderPane.margin(BorderPane.region(appPage, 'center'), '0'),
			footer = BorderPane.region(new TemplateView({
				classList: ['inverse'],
				'BorderPane.margin': '0',
				template: 'app-bottom-bar-tpl'
			}), 'bottom')
		]
	});
	return appLayout;
});