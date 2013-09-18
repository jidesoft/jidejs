//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}]
});
//endregion

require([
	'jidejs/base/Util',
	'jidejs/base/Observable',
	'jidejs/base/ObservableList',
	'jidejs/base/Window',
	'jidejs/ui/Component',
	'jidejs/ui/layout/BorderPane',
	'jidejs/ui/layout/HBox',
	'jidejs/ui/layout/VBox',
	'jidejs/ui/control/Label',
	'jidejs/ui/control/Button',
	'jidejs/ui/control/Hyperlink',
	'jidejs/ui/control/PopupButton',
	'jidejs/ui/control/ListView',
	'jidejs/ui/control/Cell',
	'jidejs/ui/control/HTMLView',
	'jidejs/ui/control/SingleSelectionModel',
	'jidejs/ui/control/MultipleSelectionModel',
	'jidejs/ui/control/ContextMenu',
	'jidejs/ui/control/MenuItem',
	'jidejs/ui/control/ToolBar',
	'jidejs/ui/control/Tooltip',

	'Icon'
], function(
	_, Observable, ObservableList, Window,
	Component, BorderPane, HBox, VBox,
	Label, Button, Hyperlink, PopupButton, ListView, Cell, HTMLView,
	SingleSelectionModel, MultipleSelectionModel, ContextMenu, MenuItem, ToolBar, Tooltip,
	Icon
) {
	"use strict";

	function notImplemented() {
		alert('This feature has not been implemented for this demo.');
	}

	var formatReadableDate = (function() {
		var today = new Date();
		return function(date, withTime) {
			var text;
			if(date.month === today.month && date.year === today.year && date.day === today.day) {
				text = 'Today';
			} else {
				text = date.toLocaleDateString && date.toLocaleDateString() || String(date);
			}
			if(withTime) {
				text += ' '+(date.toLocaleTimeString && date.toLocaleTimeString());
			}
			return text;
		}
	}());

	var emails = new ObservableList();

	function fetchMails(count) {
		for(var i = 0; i < count; i++) {
			emails.insertAt(0, {
				title: Faker.Lorem.sentence(),
				author: Faker.Name.findName(),
				from: Faker.Internet.email(),
				to: 'demo@js.jidesoft.com',
				message: Faker.Lorem.paragraphs(1+((Math.random()*5)|0)).replace(/^\t/gm, "\n"),
				date: new Date()
			});
		}
	}

	fetchMails(100);

	var listView, details, editorToolBar, fetchMailsToolBar, lastUpdatedAt,
		showDetails = Observable(false), editing = Observable(false),
		emptyMail = {
			title: 'Please select an email',
			author: 'System',
			from: 'system@js.jidesoft.com',
			to: 'demo@js.jidesoft.com',
			message: 'You should select an E-Mail.',
			date: new Date()
		}, editedMails = new MultipleSelectionModel(emails), emailLength = Observable.computed(function() {
			return emails.length;
		});
	emails.on('change', function() {
		emailLength.invalidate();
	});
	showDetails.subscribe(function(event) {
		if(event.value) details.style.remove('display');
		else details.style.set('display', 'none');
		details.style.update();
	});
	editing.subscribe(function(event) {
		if(event.value) {
			editorToolBar.style.remove('display');
			fetchMailsToolBar.style.set('display', 'none');
		}
		else {
			editorToolBar.style.set('display', 'none');
			fetchMailsToolBar.style.remove('display');
		}
		editorToolBar.style.update();
		fetchMailsToolBar.style.update();

		for(var items = listView.element.querySelectorAll('input[type="checkbox"]'), i = 0, len = items.length; i < len; i++) {
			items[i].checked = false;
		}
	});
	new BorderPane({
		element: document.getElementById('approot'),
		height: Window.heightProperty,

		children: [
			new VBox({
				'BorderPane.region': 'left',
				'BorderPane.margin': '0',
				spacing: '0',
				fillWidth: true,
				children: [
					new ToolBar({
						'VBox.grow': 'never',
						fillHeight: true,
						classList: ['heading', 'inbox'],
						children: [
							new Label({
								'HBox.grow': 'always',
								element: document.createElement('h2'),
								graphicTextGap: '5',
								graphic: new Icon({name: 'inbox', classList: ['icon-large']}),
								text: Observable.computed(function() {
									return "Inbox (" + emailLength.get() + ")";
								})
							}),
							new Button({
								'HBox.grow': 'never',
								text: editing.when().then('Cancel').otherwise('<i class="icon-wrench icon-large"></i>'),
								on: {
									action: function() {
										if(editing.get()) {
											listView.classList.remove('editing');
											editing.set(false);
											editedMails.clearSelection();
										} else {
											listView.classList.add('editing');
											editing.set(true);
										}
									}
								}
							})
						]
					}),
					listView = new ListView({
						'VBox.grow': 'always',
						classList: ['emails'],
						items: emails,
						selectionModel: new SingleSelectionModel(emails, true),
						converter: function(email) {
							return [
								'<div class="row"><input type="checkbox" class="editor"><h3>',
								email.from,
								'</h3><span class="date">',
								formatReadableDate(email.date),
								'</span></div>',
								'<h4>', email.title, '</h4>',
								'<div class="message">', email.message.substring(0, 150), '...</div>',
							].join('');
						},

						on: {
							click: function(event) {
								if(event.target.type === 'checkbox') {
									var cell = Component.fromEvent(event);
									if(cell) {
										var email = cell.item;
										if(event.target.checked) {
											editedMails.select(email);
										} else {
											editedMails.clearSelection(email);
										}
									}
								}
							}
						}
					}),
					editorToolBar = new ToolBar({
						'VBox.grow': 'never',
						fillHeight: true,
						classList: ['editor-toolbar'],
						style: {
							display: 'none'
						},
						children: [
							new Button({
								'HBox.grow': 'always',
								text: 'Delete',
								tooltip: new Tooltip({content: 'Delete selected mails'}),
								on: {
									action: function() {
										if(editing.get()) {
											editedMails.selectedItems.forEach(function(mail) {
												emails.remove(mail);
											});
										}
									}
								}
							}),
							new Button({
								'HBox.grow': 'always',
								text: 'Move',
								tooltip: new Tooltip({content: 'Move selected mails'}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							})
						]
					}),
					fetchMailsToolBar = new ToolBar({
						'VBox.grow': 'never',
						fillHeight: true,
						children: [
							new Button({
								'HBox.grow': 'never',
								graphic: new Icon({name: 'refresh', classList: ['icon-large']}),
								tooltip: new Tooltip({content: 'Refresh'}),
								on: {
									action: function() {
										fetchMails(10);
										lastUpdatedAt.text = 'Updated '+formatReadableDate(new Date(), true);
									}
								}
							}),
							lastUpdatedAt = new Label({
								'HBox.grow': 'always',
								style: {
									'text-align': 'center'
								},
								text: 'Updated '+formatReadableDate(new Date(), true)
							})
						]
					})
				]
			}),
			new VBox({
				'BorderPane.region': 'center',
				'BorderPane.margin': '0',
				spacing: '0',
				fillWidth: true,
				children: [
					new ToolBar({
						'VBox.grow': 'never',
						fillHeight: true,
						classList: ['heading', 'action-bar'],
						children: [
							new Button({
								graphic: new Icon({name: 'caret-up', classList: ['icon-large']}),
								tooltip: new Tooltip({content: 'Select previous mail'}),
								on: {
									action: function() {
										listView.selectionModel.selectPrevious();
									}
								}
							}),
							new Button({
								graphic: new Icon({name: 'caret-down', classList: ['icon-large']}),
								tooltip: new Tooltip({content: 'Select next mail'}),
								on: {
									action: function() {
										listView.selectionModel.selectNext();
									}
								}
							}),
							new Label({
								'HBox.grow': 'always',
								element: document.createElement('h1'),
								text: Observable.computed(function() {
									return (1+listView.selectionModel.selectedIndex) + ' of '+emailLength.get();
								})
							}),
							new Button({
								graphic: new Icon({name: 'remove-sign', classList: ['icon-large']}),
								tooltip: new Tooltip({content: 'Remove current mail'}),
								onaction: function() {
									emails.remove(listView.selectionModel.selectedItem);
								}
							}),
							new PopupButton({
								graphic: new Icon({name: 'mail-reply', classList: ['icon-large']}),
								tooltip: new Tooltip({content: 'Reply to this email'}),
								popup: new ContextMenu({
									children: [
										new MenuItem({
											text: 'Reply',
											on: {
												action: function() {
													notImplemented();
												}
											}
										}),
										new MenuItem({
											text: 'Reply All',
											on: {
												action: function() {
													notImplemented();
												}
											}
										}),
										new MenuItem({
											text: 'Forward',
											on: {
												action: function() {
													notImplemented();
												}
											}
										}),
										new MenuItem({
											text: 'Print',
											on: {
												action: function() {
													notImplemented();
												}
											}
										})
									]
								})
							}),
							new Button({
								graphic: new Icon({name: 'edit', classList: ['icon-large']}),
								tooltip: new Tooltip({content: 'Send a new mail'}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							})
						]
					}),
					new VBox({
						width: '100%',
						'VBox.grow': 'always',
						spacing: '0',
						fillWidth: true,
						classList: ['detail-row'],
						children: [
							new HBox({
								width: '100%',
								fillHeight: true,
								spacing: '0',
								children: [
									new Label({
										'HBox.grow': 'always',
										element: document.createElement('span'),
										text: Observable.computed(function() {
											return 'From: <span class="email">' + (listView.selectionModel.selectedItem || emptyMail).from + '</span>';
										})
									}),
									new Hyperlink({
										text: showDetails.when().then('Hide').otherwise('Details'),
										on: {
											action: function() {
												showDetails.set(!showDetails.get());
											}
										}
									})
								]
							}),
							details = new Label({
								style: {
									display: 'none'
								},
								element: document.createElement('span'),
								text: Observable.computed(function() {
									return 'To: <span class="email">' + (listView.selectionModel.selectedItem || emptyMail).to + '</span>';
								})
							}),
							new HTMLView({
								content: Observable.computed(function() {
									var mail = listView.selectionModel.selectedItem || emptyMail;
									return '<h3>'+mail.title+'</h3><span class="date">'+
										(mail.date.toLocaleDateString && mail.date.toLocaleDateString() || String(mail.date))+
										' ' + (mail.date.toLocaleTimeString && mail.date.toLocaleTimeString())+
										'</span>';
								})
							}),
							new HTMLView({
								element: document.createElement('pre'),
								content: Observable.computed(function() {
									return (listView.selectionModel.selectedItem || emptyMail).message;
								})
							})
						]
					})
				]
			})
		]
	});
});