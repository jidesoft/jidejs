//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '/bower_components/jidejs'
	}],
	paths: {
		text: '/bower_components/requirejs-text/text',
        Faker: '/bower_components/Faker/MinFaker'
	},
	shim: {
		'Handlebars': {
			exports: 'Handlebars'
		},
		'moment': {
			exports: 'moment'
		},
        'Faker': {
            exports: 'Faker'
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
	'jidejs/base/Dispatcher',
	'jidejs/ui/Component',
	'jidejs/ui/layout/BorderPane',
	'jidejs/ui/layout/HBox',
	'jidejs/ui/layout/VBox',
	'jidejs/ui/control/Label',
	'jidejs/ui/control/Button',
	'jidejs/ui/control/Hyperlink',
	'jidejs/ui/control/PopupButton',
	'jidejs/ui/control/TextField',
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

	'Icon', 'IconStack', 'Handlebars', 'moment', 'Faker',
	'text!templates/Item.html',
	'text!templates/Detail.html'
], function(
	_, Observable, ObservableList, Window, has, Dispatcher,
	Component, BorderPane, HBox, VBox,
	Label, Button, Hyperlink, PopupButton, TextField, ListView, Cell, HTMLView,
	SingleSelectionModel, MultipleSelectionModel, ChoiceBox, ContextMenu, MenuItem, ToolBar, Tooltip,
	Popup, Separator, Icon, IconStack, Handlebars, moment, Faker,
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
			if(f === 'dayOrTime') {
				var date = moment(context);
				if(moment().diff(date, 'days') === 0) {
					return date.format('LT');
				}
				return date.format('ddd');
			}
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

	function ucfirst(str) {
		return str[0].toUpperCase() + str.substring(1);
	}

	var emails = new ObservableList();

	function fetchMails(count, read, today) {
		for(var i = 0; i < count; i++) {
			var date = today
				? new Date()
				: new Date(+(moment().subtract('days', ((count - i)/10)|0)));
			emails.insertAt(0, {
				title: ucfirst(Faker.Lorem.words(3 + Faker.Helpers.randomNumber(2)).join(' ')),
				author: Faker.Name.findName(),
				from: Faker.Internet.email(),
				to: 'demo@js.jidesoft.com',
				message: Faker.Lorem.paragraphs(1+((Math.random()*5)|0)).replace(/^\t/gm, "\n"),
				date: date,
				read: Observable(read || false),
				tag: Faker.Helpers.randomize(['none', 'none', 'info', 'important'])
			});
		}
	}

	var filterText = function(mail) {
		return mail.title.indexOf(isFilterText) !== -1
			|| mail.author.indexOf(isFilterText) !== -1
			|| mail.from.indexOf(isFilterText) !== -1;
	}, isFilterText = '';
	var filteredMails = emails.filter(function(mail) {
		if(isFilterText) return filterText(mail);
		return true;
	});

	//endregion

    Dispatcher.requestAnimationFrame(function() {
        fetchMails(98, true);
        fetchMails(2, false, true);
    });

	var navigationView, listView, folderView, filterEditor, toolBar, listViewHeader,
		mailTemplate = Handlebars.compile(rawMailTemplate),
		itemTemplate = Handlebars.compile(rawItemTemplate),
		navigation = new ObservableList([
			{name: 'Mail', icon: 'envelope'},
			{name: 'Contact', icon: 'vcard'},
			{name: 'Calendar', icon: 'calendar'},
			{name: 'Documents', icon: 'file'},
			{name: 'Task', icon: 'notes_2'},
			{name: 'Settings', icon: 'cogwheel'}
		]),
		folders = new ObservableList([
			{name:'Inbox', icon: 'inbox_in'},
			{name:'Sent', icon: 'inbox_out'},
			{name:'Drafts', icon: 'pencil'},
			{name:'Trash', icon: 'bin'}
		]),
		emptyMail = {
			title: 'Please select an email',
			author: 'System',
			from: 'system@js.jidesoft.com',
			to: 'demo@js.jidesoft.com',
			message: 'You should select an E-Mail.',
			date: new Date(),
			read: Observable(true),
			tag: 'none'
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
				fillWidth: true,
				spacing: '0px',
				classList: ['navigation'],
				children: [
					new Button({
						classList: ['glyphicons', 'refresh'],
						text: '',
						tooltip: new Tooltip({
							content: new HTMLView({
								content: 'Fetch new mails.'
							})
						}),
						on: {
							action: function() {
								Dispatcher.invokeLater(function() {
									fetchMails(1+Faker.random.number(3), false, true);
								});
							}
						}
					}),
					navigationView = new ListView({
						'VBox.grow': 'always',
						classList: ['inverse'],
						items: navigation,
						selectionModel: new SingleSelectionModel(navigation, true),
						converter: function(item) {
							return '<span class="glyphicons '+item.icon+'">'+item.name+'</span>';
						}
					})
				]
			}),
			new VBox({
				'HBox.grow': 'always',
				spacing: 0,
				fillWidth: true,
				children: [
					toolBar = new ToolBar({
						classList: ['info'],
						spacing: '0px',
						children: [
							new Button({
								classList: ['glyphicons', 'pencil'],
								text: 'Compose',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Compose a new mail and safe it as a draft.'
									})
								}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							}),
							new Button({
								classList: ['glyphicons', 'plus'],
								text: 'New',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Send a new mail.'
									})
								}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							}),
							new Button({
								classList: ['glyphicons', 'unshare'],
								text: 'Reply',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Reply to this mail.'
									})
								}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							}),
							new Button({
								classList: ['glyphicons', 'message_forward'],
								text: 'Reply all',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Reply to all recipients of this mail.'
									})
								}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							}),
							new Button({
								classList: ['glyphicons', 'share'],
								text: 'Forward',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Forward this mail.'
									})
								}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							}),
							new Button({
								classList: ['glyphicons', 'bin'],
								text: 'Delete',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Delete this mail.'
									})
								}),
								on: {
									action: function() {
										emails.remove(listView.selectionModel.selectedItem);
									}
								}
							}),
							new Button({
								classList: ['glyphicons', 'print'],
								text: 'Print',
								tooltip: new Tooltip({
									content: new HTMLView({
										content: 'Print this mail.'
									})
								}),
								on: {
									action: function() {
										notImplemented();
									}
								}
							}),
							new Separator({
								'HBox.grow': 'always',
								classList: ['is-spacer']
							}),
							new Label({
								classList: ['filter-editor'],
								graphic: (filterEditor = new TextField({
									text: '',
									promptText: 'Search your emails',
									on: {
										'change:text': function(event) {
											var filter = event.value;
											isFilterText = filter;
											var oldFilter = event.oldValue;
											if(!oldFilter || oldFilter.length < filter.length && filter.substring(0, oldFilter.length) === oldFilter) {
												Dispatcher.invokeLater(function() { filteredMails.constrainFilter(); });
											} else if(oldFilter && filter.length < oldFilter.length && oldFilter.substring(0, filter.length) === filter) {
												Dispatcher.invokeLater(function() { filteredMails.relaxFilter(); });
											} else if(!filter) {
												Dispatcher.invokeLater(function() { filteredMails.matchAll(); });
											} else {
												Dispatcher.invokeLater(function() { filteredMails.updateFilter(); });
											}
											event.stopPropagation();
										},
										'key': {
											'Esc': function() {
												filterEditor.text = '';
												filterEditor.classList.add('hidden');
											}
										}
									}
								}))
							})
						]
					}),
					new HBox({
						'VBox.grow': 'always',
						fillHeight: true,
						spacing: '0px',
						children: [
							new VBox({
								element: document.createElement('section'),
								classList: ['folders'],
								spacing: 0,
								fillWidth: true,
								children: [
									new Label({
										element: document.createElement('header'),
										text: '<h1 class="glyphicons user">Patrick</h1>'
									}),
									folderView = new ListView({
										'VBox.grow': 'always',
										classList: ['has-border'],
										items: folders,
										selectionModel: new SingleSelectionModel(folders, true),
										converter: function(folder) {
											var text = folder.name, icon = folder.icon;
											if(text === 'Inbox') {
												var unreadCount = Observable.computed(function() {
													var count = 0;
													emails.forEach(function(mail) {
														if(!mail.read.get()) count++;
													});
													return '<div class="glyphicons '+icon+'">'+text+'<span class="count">'+count+'</span></div>';
												});
												emails.on('change', function() {
													this.invalidate();
												}).bind(unreadCount);
												return unreadCount;
											}
											return '<div class="glyphicons '+icon+'">'+text+'</div>';
										}
									})
								]
							}),
							new VBox({
								fillWidth: true,
								spacing: 0,
								element: document.createElement('section'),
								classList: ['inbox'],
								children: [
									listViewHeader = new Label({
										element: document.createElement('header'),
										text: 'From',
										classList: ['default']
									}),
									listView = new ListView({
										height: Observable.computed(function() {
											return (Window.height - 60)+'px';
										}),
										'VBox.grow': 'always',
										items: filteredMails,
										classList: ['emails', 'has-border'],
										selectionModel: new SingleSelectionModel(filteredMails, true),
										cellFactory: function(listView) {
											var cell = new Cell();
											cell.converterProperty.bind(this.converterProperty);
											var updateItem = cell.updateItem;
											cell.updateItem = function(item) {
												updateItem.call(cell, item);
												if(!item.read.get()) cell.classList.add('unread');
												item.read.subscribe(function(event) {
													cell.classList[event.value ? 'remove' : 'add']('unread');
												});
												cell.classList.add('tag-'+item.tag);
											};
											return cell;
										},
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
									new HTMLView({
										'VBox.grow': 'always',
										content: Observable.computed(function() {
											return mailTemplate(listView.selectionModel.selectedItem || emptyMail);
										})
									}),
									new Hyperlink({
										href: 'http://dribbble.com/shots/928321-Email-client',
										text: 'Original Design by Jakub Antalik',
										classList: ['default'],
										style: {
											'text-align': 'right'
										}
									})
								]
							})
						]
					})
				]
			})
		]
	});
	navigationView.selectionModel.selectFirst();
	folderView.selectionModel.selectFirst();

	listView.selectionModel.selectedItemProperty.subscribe(function(event) {
		Dispatcher.invokeLater(function() {
			var mail = event.value;
			if(mail && !mail.read.get()) Dispatcher.invokeLater(function() {
				mail.read.set(true);
			})
		});
	});
	listView.heightProperty.bind(Observable.computed(function() {
		return Window.height - toolBar.measure().height - listViewHeader.measure().height;
	}))
});