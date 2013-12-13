// configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}],
    paths: {
        text: '../../../bower_components/requirejs-text/text'
    }
});

var control = 'jidejs/ui/control/',
	layout = 'jidejs/ui/layout/';
require([
	control+'HTMLView', layout+'BorderPane', control+'ToolBar', control+'Button', layout+'HBox',
	control+'Hyperlink', layout+'VBox', control+'TextField', control+'Label', control+'Separator',
	'jidejs/ui/Orientation', 'jidejs/ui/Pos', control+'TextArea', control+'TitledPane', control+'Popup'
], function(
	HTMLView, BorderPane, ToolBar, Button, HBox, Hyperlink, VBox, TextField, Label, Separator, Orientation, Pos, TextArea,
	TitledPane, Popup
) {
	"use strict";

	var email, title, content;
	var pEmail, pTitle, pContent;
	function row(label, content) {
		return new HBox({
            spacing: '0',
            fillHeight: true,
			children: [
				new Label({text: label, width: '100px'}), content
			]
		});
	}
	var preview = new Popup({
		content: new VBox({
            spacing: '0',
            fillWidth: true,
			children: [
				row('Recipient:', pEmail = new Label()),
				row('Title:', pTitle = new Label()),
				row('Message:', pContent = new Label())
			]
		})
	});

	var root = new VBox({
		height: '100%',
		width: '100%',
		spacing: '0',
		children: [
			new VBox({
				width: '100%',
				spacing: '0',
				classList: ['header'],
				children: [
					new Label({
						classList: ['titlebar'],
						text: 'jide.js Lion CSS UI Kit demo',
						width: '100%'
					}),
					new ToolBar({
						width: '100%',
						classList: ['toolbar'],
						children: [
							new Button({
								text: 'Send',
								classList: ['button', 'textured'],
								on: {
									action: function() {
										preview.show(this, Pos.BOTTOM);
									}
								}
							})
						]
					})
				]
			}),
			VBox.grow(new HBox({
				width: '100%',
				fillHeight: true,
				spacing: '0',
				classList: ['content'],
				children: [
					VBox.grow(new VBox({
						width: '340px',
						fillWidth: true,
						spacing: '0',
						classList: ['sourcelist'],
						children: [
							new TitledPane({
								expanded: true,
								title: 'jide.js OSX styling demo',
								content: new HTMLView({content: document.getElementById('aboutText')}),
								width: '340px'
							}),
							new TitledPane({
								expanded: true,
								title: 'Things to try',
								content: new HTMLView({content: document.getElementById('thingsToTry')}),
								width: '340px'
							}),
						]
					}), 'never'),
					HBox.grow(new BorderPane({
						width: '100%',
						style: {
							'background': '#FFF'
						},
						classList: ['view'],
						children: [
							BorderPane.region(new VBox({
								fillWidth: true,
								width: '100%',
								spacing: '5px 0',
								'BorderPane.margin': '0',
								children:[
									new HBox({
										width: '100%',
										spacing: '0',
                                        fillHeight: true,
										children: [
											new Label({text: 'Recipient', width: '100px'}),
											email = new TextField({width: '100%'})
										]
									}),
									new HBox({
										width: '100%',
                                        fillHeight: true,
										spacing: '0',
										children: [
											new Label({text: 'Title', width: '100px'}),
											title = new TextField({width: '100%'})
										]
									}),
									new Label({text: 'Message'})
								]
							}), 'top'),
							BorderPane.region(content = new TextArea({
								width: '100%',
								'BorderPane.margin': '0',
								prefRowCount: 20
							}), 'center'),
							BorderPane.region(new HBox({
								width: '100%',
								'BorderPane.margin': '0',
								children: [
									new Hyperlink({
										href: 'http://www.jidesoft.com',
										text: 'Copyright &copy; 2012' +
											((function() {
												var y = (new Date()).getFullYear();
												return y == 2012 ? '' : '-'+y;}())) +
											' &middot; JIDE Software, INC'
									})
								]
							}), 'bottom')
						]
					}), 'always')
				]
			}), 'always')
		]
	});
	var converter = {
		convertTo: function(value) { return value || '[none]'; },
		convertFrom: function(value) { return value; }
	};
	email.textProperty.bindBidirectional(pEmail.textProperty, converter);
	title.textProperty.bindBidirectional(pTitle.textProperty, converter);
	content.textProperty.bindBidirectional(pContent.textProperty, converter);
	document.body.appendChild(root.element);
});