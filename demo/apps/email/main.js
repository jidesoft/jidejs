//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}],
	paths: {
		text: '../../../components/requirejs-text/text'
	},
	shim: {
		'Handlebars': {
			exports: 'Handlebars'
		},
		'moment': {
			exports: 'moment'
		}
	}
});
//endregion

require([
	'jidejs/base/Util',
	'jidejs/base/Observable',
	'jidejs/base/ObservableList',
	'jidejs/base/Window',
	'jidejs/base/has',
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
	'jidejs/ui/control/ChoiceBox',
	'jidejs/ui/control/ContextMenu',
	'jidejs/ui/control/MenuItem',
	'jidejs/ui/control/ToolBar',
	'jidejs/ui/control/Tooltip',
	'jidejs/ui/control/Popup',
	'jidejs/ui/control/Separator',

	'Icon', 'IconStack', 'Handlebars', 'moment',
	'text!templates/Item.html',
	'text!templates/Detail.html'
], function(
	_, Observable, ObservableList, Window, has,
	Component, BorderPane, HBox, VBox,
	Label, Button, Hyperlink, PopupButton, ListView, Cell, HTMLView,
	SingleSelectionModel, MultipleSelectionModel, ChoiceBox, ContextMenu, MenuItem, ToolBar, Tooltip,
	Popup, Separator, Icon, IconStack, Handlebars, moment,
	rawItemTemplate, rawMailTemplate
) {
	"use strict";
//region utility functions
	//  format an ISO date using Moment.js
//  http://momentjs.com/
//  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
//  usage: {{dateFormat creation_date format="MMMM YYYY"}}
//  source: https://gist.github.com/stephentcannon/3409103
	Handlebars.registerHelper('dateFormat', function(context, block) {
		if (window.moment) {
			var f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
			if(f === 'fromNow') return moment(context).fromNow();
			if(f === 'calendar') return moment(context).calendar();
			return moment(context).format(f); //had to remove Date(context)
		}else{
			return context;   //  moment plugin not available. return data as is.
		}
	});

	Handlebars.registerHelper('limit', function(context, block) {
		var f = Number(block.hash.format) || 50;
		if(context.length < f) return context;
		return context.substring(0, f)+'...';
	});

	function notImplemented() {
		var popup = new Popup({
			content: new HTMLView({
				content: '<p>This feature has not been implemented for this demo. Click anywhere to dismiss this message</p>'
			}),
			on: {
				click: function() {
					popup.visible = false;
				}
			}
		});
		popup.show(listView, Window.width / 2, Window.height / 2);
	}

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

	//endregion

	fetchMails(100);

	var listView, folderView, readFilterChoice,
		mailTemplate = Handlebars.compile(rawMailTemplate),
		itemTemplate = Handlebars.compile(rawItemTemplate),
		emptyMail = {
			title: 'Please select an email',
			author: 'System',
			from: 'system@js.jidesoft.com',
			to: 'demo@js.jidesoft.com',
			message: 'You should select an E-Mail.',
			date: new Date()
		};

		new HBox({
			element: document.getElementById('approot'),
			height: Window.heightProperty,
			width: Window.widthProperty,
			fillHeight: true,
			spacing: 0,

			children: [
				new VBox({
					element: document.createElement('section'),
					classList: ['folders'],
					spacing: 0,
					fillWidth: true,
					children: [
						new Label({
							element: document.createElement('header'),
							text: '<h1>jide.js</h1>'
						}),
						folderView = new ListView({
							'VBox.grow': 'always',
							classList: ['inverse'],
							items: [
								'Inbox',
								'Sent',
								'Trash',
								'Deleted'
							]
						})
					]
				}),
				new VBox({
					fillWidth: true,
					spacing: 0,
					element: document.createElement('section'),
					classList: ['inbox'],
					children: [
						new HBox({
							element: document.createElement('header'),
							spacing: 'auto 0',
							children: [
								readFilterChoice = new ChoiceBox({
									items: ['All', 'Unread']
								}),
								new Separator({
									'HBox.grow': 'always',
									classList: ['is-spacer']
								}),
								new Button({
									graphic: new Icon({name: 'search', classList: ['icon-2x']}),
									classList: ['transparent'],
									tooltip: new Tooltip({
										content: new HTMLView({
											content: 'Search'
										})
									})
								})
							]
						}),
						listView = new ListView({
							'VBox.grow': 'always',
							items: emails,
							classList: ['emails', 'has-border', 'is-striped'],
							selectionModel: new SingleSelectionModel(emails, true),
							converter: function(email) {
								return itemTemplate(email);
							}
						})
					]
				}),
				new VBox({
					'HBox.grow': 'always',
					fillWidth: true,
					spacing: 0,
					element: document.createElement('section'),
					classList: ['details'],
					children: [
						new HBox({
							spacing: 'auto 0',
							element: document.createElement('header'),
							fillWidth: true,
							classList: ['action-buttons'],
							children: [
								new Separator({
									'HBox.grow': 'always',
									classList: ['is-spacer']
								}),
								new Button({
									classList: ['transparent'],
									graphic: new Icon({ name: 'plus', classList: ['icon-2x'] })
								}),
								new Button({
									classList: ['transparent'],
									graphic: new Icon({ name: 'reply', classList: ['icon-2x'] })
								}),
								new Button({
									classList: ['transparent'],
									graphic: new Icon({ name: 'remove', classList: ['icon-2x'] })
								})
							]
						}),
						new HTMLView({
							'VBox.grow': 'always',
							content: Observable.computed(function() {
								return mailTemplate(listView.selectionModel.selectedItem || emptyMail);
							})
						})
					]
				})
			]
		});
	folderView.selectionModel.selectFirst();
	readFilterChoice.selectionModel.selectFirst();

//	emails.on('change', function() {
//		emailLength.invalidate();
//	});
//	showDetails.subscribe(function(event) {
//		if(event.value) details.style.remove('display');
//		else details.style.set('display', 'none');
//		details.style.update();
//	});
//	editing.subscribe(function(event) {
//		if(event.value) {
//			editorToolBar.style.remove('display');
//			fetchMailsToolBar.style.set('display', 'none');
//		}
//		else {
//			editorToolBar.style.set('display', 'none');
//			fetchMailsToolBar.style.remove('display');
//		}
//		editorToolBar.style.update();
//		fetchMailsToolBar.style.update();
//
//		for(var items = listView.element.querySelectorAll('input[type="checkbox"]'), i = 0, len = items.length; i < len; i++) {
//			items[i].checked = false;
//		}
//	});
//	new BorderPane({
//		element: document.getElementById('approot'),
//		height: Window.heightProperty,
//
//		children: [
//			new VBox({
//				'BorderPane.region': 'left',
//				'BorderPane.margin': '0',
//				spacing: '0',
//				fillWidth: true,
//				children: [
//					listToolbar = new ToolBar({
//						'VBox.grow': 'never',
//						fillHeight: true,
//						classList: ['heading', 'inbox'],
//						children: [
//							new Label({
//								'HBox.grow': 'always',
//								element: document.createElement('h2'),
//								graphicTextGap: '5',
//								graphic: new Icon({name: 'inbox', classList: ['icon-large']}),
//								text: Observable.computed(function() {
//									return "Inbox (" + emailLength.get() + ")";
//								})
//							}),
//							new Button({
//								'HBox.grow': 'never',
//								text: editing.when().then('Cancel').otherwise('<i class="icon-wrench icon-large"></i>'),
//								on: {
//									action: function() {
//										if(editing.get()) {
//											listView.classList.remove('editing');
//											editing.set(false);
//											editedMails.clearSelection();
//										} else {
//											listView.classList.add('editing');
//											editing.set(true);
//										}
//									}
//								}
//							})
//						]
//					}),
//					listView = new ListView({
//						'VBox.grow': 'always',
//						classList: ['emails', 'has-border', 'is-striped'],
//						items: emails,
//						selectionModel: new SingleSelectionModel(emails, true),
//						converter: function(email) {
//							return [
//								'<div class="row"><input type="checkbox" class="editor"><h3>',
//								email.from,
//								'</h3><span class="date">',
//								formatReadableDate(email.date),
//								'</span></div>',
//								'<h4>', email.title, '</h4>',
//								'<div class="message">', email.message.substring(0, 150), '...</div>',
//							].join('');
//						},
//
//						on: {
//							click: function(event) {
//								if(event.target.type === 'checkbox') {
//									var cell = Component.fromEvent(event);
//									if(cell) {
//										var email = cell.item;
//										if(event.target.checked) {
//											editedMails.select(email);
//										} else {
//											editedMails.clearSelection(email);
//										}
//									}
//								}
//							}
//						}
//					}),
//					editorToolBar = new ToolBar({
//						'VBox.grow': 'never',
//						fillHeight: true,
//						classList: ['editor-toolbar'],
//						style: {
//							display: 'none'
//						},
//						children: [
//							new Button({
//								'HBox.grow': 'always',
//								text: 'Delete',
//								classList: ['danger'],
//								tooltip: new Tooltip({content: 'Delete selected mails'}),
//								on: {
//									action: function() {
//										if(editing.get()) {
//											editedMails.selectedItems.forEach(function(mail) {
//												emails.remove(mail);
//											});
//										}
//									}
//								}
//							}),
//							new Button({
//								'HBox.grow': 'always',
//								text: 'Move',
//								tooltip: new Tooltip({content: 'Move selected mails'}),
//								on: {
//									action: function() {
//										notImplemented();
//									}
//								}
//							})
//						]
//					}),
//					fetchMailsToolBar = new ToolBar({
//						'VBox.grow': 'never',
//						fillHeight: true,
//						children: [
//							new Button({
//								'HBox.grow': 'never',
//								graphic: new Icon({name: 'refresh'}),
//								tooltip: new Tooltip({content: 'Refresh'}),
//								on: {
//									action: function() {
//										fetchMails(10);
//										lastUpdatedAt.text = 'Updated '+formatReadableDate(new Date(), true);
//									}
//								}
//							}),
//							lastUpdatedAt = new Label({
//								'HBox.grow': 'always',
//								style: {
//									'text-align': 'center'
//								},
//								text: 'Updated '+formatReadableDate(new Date(), true)
//							})
//						]
//					})
//				]
//			}),
//			new VBox({
//				'BorderPane.region': 'center',
//				'BorderPane.margin': '0',
//				spacing: '0',
//				fillWidth: true,
//				children: [
//					new ToolBar({
//						'VBox.grow': 'never',
//						fillHeight: true,
//						classList: ['heading', 'action-bar'],
//						children: [
//							new Button({
//								graphic: new Icon({name: 'caret-up', classList: ['icon-large']}),
//								tooltip: new Tooltip({content: 'Select previous mail'}),
//								on: {
//									action: function() {
//										listView.selectionModel.selectPrevious();
//									}
//								}
//							}),
//							new Button({
//								graphic: new Icon({name: 'caret-down', classList: ['icon-large']}),
//								tooltip: new Tooltip({content: 'Select next mail'}),
//								on: {
//									action: function() {
//										listView.selectionModel.selectNext();
//									}
//								}
//							}),
//							new Label({
//								'HBox.grow': 'always',
//								element: document.createElement('h1'),
//								text: Observable.computed(function() {
//									return (1+listView.selectionModel.selectedIndex) + ' of '+emailLength.get();
//								})
//							}),
//							new Button({
//								graphic: new Icon({name: 'remove-sign', classList: ['icon-large']}),
//								classList: ['danger'],
//								tooltip: new Tooltip({content: 'Remove current mail'}),
//								onaction: function() {
//									emails.remove(listView.selectionModel.selectedItem);
//								}
//							}),
//							new PopupButton({
//								graphic: new Icon({name: 'mail-reply', classList: ['icon-large']}),
//								tooltip: new Tooltip({content: 'Reply to this email'}),
//								popup: new ContextMenu({
//									children: [
//										new MenuItem({
//											text: 'Reply',
//											on: {
//												action: function() {
//													notImplemented();
//												}
//											}
//										}),
//										new MenuItem({
//											text: 'Reply All',
//											on: {
//												action: function() {
//													notImplemented();
//												}
//											}
//										}),
//										new MenuItem({
//											text: 'Forward',
//											on: {
//												action: function() {
//													notImplemented();
//												}
//											}
//										}),
//										new MenuItem({
//											text: 'Print',
//											on: {
//												action: function() {
//													notImplemented();
//												}
//											}
//										})
//									]
//								})
//							}),
//							new Button({
//								graphic: new Icon({name: 'edit', classList: ['icon-large']}),
//								tooltip: new Tooltip({content: 'Send a new mail'}),
//								on: {
//									action: function() {
//										notImplemented();
//									}
//								}
//							})
//						]
//					}),
//					new VBox({
//						width: '100%',
//						'VBox.grow': 'always',
//						spacing: '0',
//						fillWidth: true,
//						classList: ['detail-row'],
//						children: [
//							new HBox({
//								width: '100%',
//								fillHeight: true,
//								spacing: '0',
//								children: [
//									new Label({
//										'HBox.grow': 'always',
//										element: document.createElement('span'),
//										text: Observable.computed(function() {
//											return 'From: <span class="email">' + (listView.selectionModel.selectedItem || emptyMail).from + '</span>';
//										})
//									}),
//									new Hyperlink({
//										text: showDetails.when().then('Hide').otherwise('Details'),
//										on: {
//											action: function() {
//												showDetails.set(!showDetails.get());
//											}
//										}
//									})
//								]
//							}),
//							details = new Label({
//								style: {
//									display: 'none'
//								},
//								element: document.createElement('span'),
//								text: Observable.computed(function() {
//									return 'To: <span class="email">' + (listView.selectionModel.selectedItem || emptyMail).to + '</span>';
//								})
//							}),
//							new HTMLView({
//								content: Observable.computed(function() {
//									var mail = listView.selectionModel.selectedItem || emptyMail;
//									return '<h3>'+mail.title+'</h3><span class="date">'+
//										(mail.date.toLocaleDateString && mail.date.toLocaleDateString() || String(mail.date))+
//										' ' + (mail.date.toLocaleTimeString && mail.date.toLocaleTimeString())+
//										'</span>';
//								})
//							}),
//							new HTMLView({
//								element: document.createElement('pre'),
//								content: Observable.computed(function() {
//									return (listView.selectionModel.selectedItem || emptyMail).message;
//								})
//							})
//						]
//					})
//				]
//			})
//		]
//	});
//
//	// this is necessary for IE since grid layout seems to ignore the height property set
//	// for the page.
//	if(has('grid')) {
//		Window.heightProperty.subscribe(function() {
//			listView.height = Window.height - listToolbar.measure().height - fetchMailsToolBar.measure().height;
//		});
//		listView.height = Window.height - listToolbar.measure().height - fetchMailsToolBar.measure().height;
//	}
});