//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}],
	paths: {
		text: '../../../bower_components/requirejs-text/text'
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

	'Icon', 'IconStack', 'Handlebars', 'moment',
	'text!templates/Item.html',
	'text!templates/Detail.html'
], function(
	_, Observable, ObservableList, Window, has, Dispatcher,
	Component, BorderPane, HBox, VBox,
	Label, Button, Hyperlink, PopupButton, TextField, ListView, Cell, HTMLView,
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

	var emails = new ObservableList();

	function fetchMails(count, read, today) {
		for(var i = 0; i < count; i++) {
			var date = today
				? new Date()
				: new Date(+(moment().subtract('days', ((count - i)/10)|0)));
			emails.insertAt(0, {
				title: Faker.Lorem.sentence(),
				author: Faker.Name.findName(),
				from: Faker.Internet.email(),
				to: 'demo@js.jidesoft.com',
				message: Faker.Lorem.paragraphs(1+((Math.random()*5)|0)).replace(/^\t/gm, "\n"),
				date: date,
				read: Observable(read || false)
			});
		}
	}

	var filterUnread = function(mail) {
		return !mail.read.get();
	}, filterText = function(mail) {
		return mail.title.indexOf(isFilterText) !== -1
			|| mail.author.indexOf(isFilterText) !== -1
			|| mail.from.indexOf(isFilterText) !== -1;
	}, isFilterUnread = false, isFilterText = '';
	var filteredMails = emails.filter(function(mail) {
		var isAccepted = true;
		if(isFilterUnread) isAccepted = isAccepted && filterUnread(mail);
		if(isFilterText) isAccepted = isAccepted && filterText(mail);
		return isAccepted;
	});

	//endregion

	fetchMails(98, true);
	fetchMails(2, false, true);

	setInterval(function() {
		fetchMails(1+Faker.random.number(3), false, true);
	}, 60000);

	var listView, folderView, readFilterChoice, filterEditor,
		mailTemplate = Handlebars.compile(rawMailTemplate),
		itemTemplate = Handlebars.compile(rawItemTemplate),
		folders = new ObservableList([
			'Inbox',
			'Sent',
			'Trash',
			'Deleted'
		]),
		filterChoices = new ObservableList(['All', 'Unread']),
		emptyMail = {
			title: 'Please select an email',
			author: 'System',
			from: 'system@js.jidesoft.com',
			to: 'demo@js.jidesoft.com',
			message: 'You should select an E-Mail.',
			date: new Date(),
			read: Observable(true)
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
							classList: ['inverse'],
							text: '<h1>jide.js</h1>'
						}),
						folderView = new ListView({
							'VBox.grow': 'always',
							classList: ['inverse'],
							items: folders,
							selectionModel: new SingleSelectionModel(folders, true),
							converter: function(text) {
								if(text === 'Inbox') {
									var unreadCount = Observable.computed(function() {
										var count = 0;
										emails.forEach(function(mail) {
											if(!mail.read.get()) count++;
										});
										return text+'<span class="count">'+count+'</span>';
									});
									emails.on('change', function() {
										this.invalidate();
									}).bind(unreadCount);
									return unreadCount;
								}
								return text;
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
						new HBox({
							element: document.createElement('header'),
							spacing: 'auto 0',
							children: [
								readFilterChoice = new ChoiceBox({
									items: filterChoices,
									classList: ['transparent'],
									selectionModel: new SingleSelectionModel(filterChoices, true)
								}),
								new Separator({
									'HBox.grow': 'always',
									classList: ['is-spacer']
								}),
								filterEditor = new TextField({
									classList: ['hidden', 'filter-editor'],
									text: '',
									promptText: 'Search your emails',
									on: {
										'change:text': function(event) {
											var filter = event.value;
											isFilterText = filter;
											var oldFilter = event.oldValue;
											if(oldFilter.length < filter.length && filter.substring(0, oldFilter.length) === oldFilter) {
												Dispatcher.invokeLater(function() { filteredMails.constrainFilter(); });
											} else if(filter.length < oldFilter.length && oldFilter.substring(0, filter.length) === filter) {
												Dispatcher.invokeLater(function() { filteredMails.relaxFilter(); });
											} else if(!filter && !isFilterUnread) {
												Dispatcher.invokeLater(function() { filteredMails.matchAll(); });
											} else {
												Dispatcher.invokeLater(function() { filteredMails.updateFilter(); });
											}
										},
										'key': {
											'Esc': function() {
												filterEditor.text = '';
												filterEditor.classList.add('hidden');
											}
										}
									}
								}),
								new Button({
									graphic: new Icon({name: 'search', classList: ['icon-2x']}),
									classList: ['transparent'],
									tooltip: new Tooltip({
										content: new HTMLView({
											content: 'Search your mails.'
										})
									}),
									on: {
										action: function() {
											if(filterEditor.classList.contains('hidden')) {
												filterEditor.classList.remove('hidden');
											} else {
												filterEditor.classList.add('hidden');
											}
											filterEditor.focus();
										}
									}
								})
							]
						}),
						listView = new ListView({
							height: Observable.computed(function() {
								return (Window.height - 60)+'px';
							}),
							'VBox.grow': 'always',
							items: filteredMails,
							classList: ['emails', 'has-border', 'is-striped'],
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
									graphic: new Icon({ name: 'plus', classList: ['icon-2x'] }),
									tooltip: new Tooltip({
										content: new HTMLView({
											content: 'Write a new mail.'
										})
									}),
									on: {
										action: function() {
											notImplemented();
										}
									}
								}),
								new Button({
									classList: ['transparent'],
									graphic: new Icon({ name: 'reply', classList: ['icon-2x'] }),
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
									classList: ['transparent', 'danger'],
									graphic: new Icon({ name: 'remove', classList: ['icon-2x'] }),
									tooltip: new Tooltip({
										classList: ['danger'],
										content: new HTMLView({
											content: 'Delete this mail.'
										})
									}),
									on: {
										action: function() {
											emails.remove(listView.selectionModel.selectedItem);
										}
									}
								})
							]
						}),
						new HTMLView({
							'VBox.grow': 'always',
							height: Observable.computed(function() {
								return (Window.height - 60)+'px';
							}),
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

	listView.selectionModel.selectedItemProperty.subscribe(function(event) {
		Dispatcher.invokeLater(function() {
			var mail = event.value;
			if(isFilterUnread && event.oldValue && event.oldValue.read) filteredMails.constrainFilter();
			if(mail && !mail.read.get()) Dispatcher.invokeLater(function() {
				mail.read.set(true);
			})
		});
	});
	readFilterChoice.selectionModel.selectedItemProperty.subscribe(function(event) {
		isFilterUnread = event.value === 'Unread';
		if(event.value === 'Unread') {
			filteredMails.constrainFilter();
		} else {
			if(!isFilterText) {
				filteredMails.matchAll();
			} else {
				filteredMails.relaxFilter();
			}
		}
	});
});