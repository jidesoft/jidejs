// configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs/base',
		location: '../../../base/src/jidejs/base'
	}, {
		name: 'jidejs/ui',
		location: '../../../controls/src/jidejs/ui'
	}],
	paths: {
		   text: '../../lib/text'
	}
});

require([
	'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/base/Binding', 'jidejs/base/Dispatcher',
	'jidejs/base/Animation', 'jidejs/ui/control/Label', 'jidejs/ui/control/ImageView',
	'jidejs/ui/control/Button', 'jidejs/ui/control/ToggleButton', 'jidejs/ui/layout/HBox', 'jidejs/ui/layout/VBox',
	'jidejs/ui/control/TitledPane', 'jidejs/ui/layout/BorderPane', 'jidejs/ui/control/ToggleGroup', 'jidejs/ui/control/CheckBox',
	'jidejs/ui/control/HTMLView', 'jidejs/ui/control/Hyperlink', 'jidejs/base/Command', 'jidejs/ui/control/RadioButton',
	'jidejs/ui/control/Accordion', 'jidejs/ui/control/Popup', 'jidejs/ui/control/Tooltip', 'jidejs/ui/control/ContextMenu',
	'jidejs/ui/control/MenuItem', 'jidejs/ui/control/PopupButton', 'jidejs/ui/control/CheckBoxMenuItem',
	'jidejs/ui/control/RadioButtonMenuItem', 'jidejs/ui/control/Menu', 'jidejs/ui/control/MenuBar', 'jidejs/ui/control/ToolBar',
	'jidejs/ui/control/TextField', 'jidejs/ui/control/PasswordField', 'jidejs/ui/control/Separator', 'jidejs/ui/Orientation',
	'jidejs/ui/control/ProgressBar', 'jidejs/ui/Pos', 'jidejs/ui/control/ListView', 'jidejs/ui/control/Cell',
	'jidejs/base/Name', 'jidejs/ui/control/TextArea', 'jidejs/ui/control/ChoiceBox', 'jidejs/ui/control/ComboBox',
	'jidejs/ui/layout/GridPane', 'jidejs/ui/layout/AnchorPane', 'jidejs/ui/layout/StackPane', 'jidejs/ui/layout/TilePane',
	'jidejs/base/Bindings', 'jidejs/base/EventEmitter', 'jidejs/ui/Template', 'jidejs/ui/bind', 'jidejs/base/Observable'
],
function(
	Class, Observable, Binding, Dispatcher, Animation, Label, ImageView, Button,
	ToggleButton, HBox, VBox, TitledPane, BorderPane, ToggleGroup, CheckBox, HTMLView, Hyperlink,
	Command, RadioButton, Accordion, Popup, Tooltip, ContextMenu, MenuItem, PopupButton, CheckBoxMenuItem,
	RadioButtonMenuItem, Menu, MenuBar, ToolBar, TextField, PasswordField, Separator, Orientation, ProgressBar,
	Pos, ListView, Cell, Name, TextArea, ChoiceBox, ComboBox, GridPane, AnchorPane, StackPane, TilePane,
	Bindings, EventEmitter, Template, bind, Var
) {
	"use strict";

	var area = GridPane.area;

	var grid = new GridPane({
		grid: [
			"header header  header",
			"nav    content sidebar",
			"footer footer  sidebar"
		],
		children: [
			area(new HTMLView({content: "<h1>Hello World!</h1>"}), 'header'),
			area(new HTMLView({content: "Nav"}), 'nav'),
			area(new HTMLView({content: "Content"}), 'content'),
			area(new HTMLView({content: "Sidebar<br/>Sidebar as well."}), 'sidebar'),
			area(new HTMLView({content: "Footer1"}), 'footer')
		]
	});
	document.body.appendChild(grid.element);

	function Project(name) {
		// make this class observable and define the observable properties "name" and "description"
		Observable.install(this, 'name', 'description', 'priority')(this);
		this.owner = { name: 'Jidesoft', 'link': 'http://www.jidesoft.com' };
		this.name = name;
	}

	Class(Project).mixin(EventEmitter).def({
		// list properties here to help auto completion
		name: null, nameProperty: null,
		description: null, descriptionProperty: null,
		priority: 0, priorityProperty: null
	});

	var proj = new Project();
	var label = new Label({element:document.getElementById('label')});
	label.contentDisplay = 'top';
	label.text = 'No project selected';
	label.graphic = new ImageView(
		'data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==');
	label.graphicTextGap = 10;

	// setup binding ("text" is a manually defined observable property, thus
	// we can't use "textProperty")
	proj.nameProperty.bindBidirectional(label.textProperty);
	var priorityToColor = ['white', 'green', 'yellow', 'red'];
	label.backgroundProperty.bind(proj.priorityProperty, function(value) {
		return priorityToColor[value];
	});

	proj.name = 'Test';
	label.on('change:background', function(value, oldValue) {
		console.log('background changed from '+ oldValue + ' to '+ value);
	});
	label.on('click', function(e) {
		this.text = 'You clicked the label!';
	});
	label.background = 'blue';

	// test templating and binding
	var projectTemplate = Template.fromId('project_details');
	var projectDetails = projectTemplate.clone();
//	bind(projectDetails.slots['name'], { text: proj.nameProperty });
//	bind(projectDetails.slots['priority'], { text: proj.priorityProperty });
//	bind(projectDetails.slots['description'], { text: proj.descriptionProperty });
	document.body.appendChild(projectDetails.render(proj));

	// create a custom Label component
	var labelTemplate = Template.fromId('customLabel');
	// create the label
	var customLabel = labelTemplate.clone();
	bind(customLabel.slots['text'], { text: proj.nameProperty });
	bind(customLabel.slots['graphic'], {
		content: Var.computed(function() {
			return priorityToColor[proj.priority];
		})
	});
	document.body.appendChild(customLabel.element);
	document.body.appendChild(new Button({
		text: 'Change project name',
		on: {
			click: function() {
				proj.name = 'My project';
			}
		}
	}).element);

	Dispatcher.invokeLater(function() {
		proj.name = 'jide.js';
		proj.priority = 3;
	});

	// create an animation
	var anim = new Animation({
		duration: 5000,
		method: Animation.linear,

		step: function(progress) {
			var margin = label.margin.clone();
			margin.left = (200 * progress);
			label.margin = margin;
		},

		done: function() {
			var margin = label.margin.clone();
			margin.left = 200;
			label.margin = margin;
			label.contentDisplay = "textOnly";
			button.selected = false;
		}
	});
	var button = new ToggleButton();
	button.text = 'Start Animation';
	button.on('action', function() {
		anim.start();
	});
	document.body.appendChild(button.element);

	var toggleGroup = new ToggleGroup();
	var box = new VBox({
		spacing: 5,
		fillWidth: true,
		children: [
			new HBox({
				spacing: 5,
				fillHeight: true,
				children: [
					new Label({text: "Test"}),
					HBox.grow(new Label({text:"me!", background: 'grey'}), 'always'),
					new PopupButton({text:'Press me', popup: new ContextMenu({
						children: [
							new MenuItem({text: "Hello"}),
							new MenuItem({text: "World"}),
							new Menu({
								text: 'Menu',
								children: [
									new MenuItem({text: 'A menu item'}),
									new RadioButtonMenuItem({text: 'A radio button'}),
									new CheckBoxMenuItem({text: 'A check box'}),
									new Menu({
										text: 'Menu',
										children: [
											new MenuItem({text: 'A menu item'}),
											new RadioButtonMenuItem({text: 'A radio button'}),
											new CheckBoxMenuItem({text: 'A check box'})
										]
									})
								]
							}),
							new Menu({
								text: 'Menu',
								children: [
									new MenuItem({text: 'A menu item'}),
									new RadioButtonMenuItem({text: 'A radio button'}),
									new CheckBoxMenuItem({text: 'A check box'})
								]
							})
						]
					})})
				]
			}),
			new HBox({
				spacing: 5,
				fillHeight: true,
				children: [
					new ToggleButton({text: "Press", toggleGroup: toggleGroup, tooltip: new Tooltip({content:'Test'})}),
					HBox.grow(new ToggleButton({text:"me", toggleGroup: toggleGroup}), 'always'),
					new ToggleButton({text:'now', toggleGroup: toggleGroup}),
					new ToggleButton({text:'or', toggleGroup: toggleGroup}),
					new ToggleButton({text:'never!', toggleGroup: toggleGroup})
				]
			})
		]
	});
	document.body.appendChild(box.element);

	var titledPane = new TitledPane({
		title: 'Hello World',
		width: '200px',
		content: new VBox({
			spacing: 5,
			fillWidth: true,
			children: [
				new Label({text:'Hello World!'}),
				new Button({
					text: 'Click me',
					on: {
						action: function() {
							this.text = 'You clicked the button';
						}
					}
				}),
				new HTMLView({
					content: '<p>This is an HTMLView control, which allows arbitrary HTML to be placed within a control.</p>'
				})
			]
		})
	});
	document.body.appendChild(titledPane.element);

	var command;
	/*var page = new BorderPane({
		children: [
			BorderPane.region(new MenuBar({
				children: [
					new Menu({
						text: 'Menu 1',
						children: [
							new MenuItem({text: 'A menu item'}),
							new RadioButtonMenuItem({text: 'A radio button'}),
							new CheckBoxMenuItem({text: 'A check box'}),
							new Separator(),
							new Menu({
								text: 'Menu',
								children: [
									new MenuItem({text: 'A menu item'}),
									new RadioButtonMenuItem({text: 'A radio button'}),
									new CheckBoxMenuItem({text: 'A check box'})
								]
							})
						]
					}),
					new Menu({
						text: 'Menu 2',
						children: [
							new MenuItem({text: 'A menu item'}),
							new RadioButtonMenuItem({text: 'A radio button'}),
							new CheckBoxMenuItem({text: 'A check box'})
						]
					})
				]
			}), 'top'),
			BorderPane.region(new Label({text: 'Left'}), 'left'),
			BorderPane.region(new Button({
				text: 'Click me',
				command: command = new Command(function() {
					// disable the button after first click
					command.enabled = false;
				})
			}), 'center'),
			BorderPane.region(new Hyperlink({
				text: 'Copyright &copy; 2012 Jidesoft',
				href: 'http://www.jidesoft.com'
			}), 'bottom')
		],
		width: '100%'
	});*/
	var page = new BorderPane({
		children: [
			new MenuBar({
				'BorderPane.region': 'top',
				children: [
					new Menu({
						text: 'Menu 1',
						children: [
							new MenuItem({text: 'A menu item'}),
							new RadioButtonMenuItem({text: 'A radio button'}),
							new CheckBoxMenuItem({text: 'A check box'}),
							new Separator(),
							new Menu({
								text: 'Menu',
								children: [
									new MenuItem({text: 'A menu item'}),
									new RadioButtonMenuItem({text: 'A radio button'}),
									new CheckBoxMenuItem({text: 'A check box'})
								]
							})
						]
					}),
					new Menu({
						text: 'Menu 2',
						children: [
							new MenuItem({text: 'A menu item'}),
							new RadioButtonMenuItem({text: 'A radio button'}),
							new CheckBoxMenuItem({text: 'A check box'})
						]
					})
				]
			}),
			new Label({'BorderPane.region': 'left', text: 'Left'}),
			new Button({
				'BorderPane.region': 'center',
				text: 'Click me',
				command: command = new Command(function() {
					// disable the button after first click
					command.enabled = false;
				})
			}),
			new Hyperlink({
				'BorderPane.region': 'bottom',
				text: 'Copyright &copy; 2012 Jidesoft',
				href: 'http://www.jidesoft.com'
			})
		],
		width: '100%'
	});
	document.body.appendChild(page.element);

	var checkBox = new CheckBox({
		text: 'Do you like it?',
		allowIndeterminate: true,
		indeterminate: true,
		selected: false
	});
	document.body.appendChild(checkBox.element);

	var radioButton = new RadioButton({
		text: 'I accept the terms',
		selected: true
	});
	document.body.appendChild(radioButton.element);

	var accordion = new Accordion({
		width: '200px',
		children: [
			new TitledPane({
				title: 'Section 1',
				content: new VBox({
					spacing: 5,
					fillWidth: true,
					children: [
						new Label({text:'Hello World!'}),
						new Button({
							text: 'Click me',
							on: {
								action: function() {
									this.text = 'You clicked the button';
								}
							},
							contextmenu: new ContextMenu({
								children: [
									new MenuItem({
										text: 'First',
										on: {
											click: function() {
												alert('Test');
											}
										}
									}),
									new MenuItem({
										text: 'Second'
									}),
									new CheckBoxMenuItem({
										text: 'Do you like it?',
										allowIndeterminate: false,
										indeterminate: false,
										selected: true
									}),
									new RadioButtonMenuItem({
										text: 'I accept the terms',
										selected: true
									})
								]
							})
						}),
						new HTMLView({
							content: '<p>This is an HTMLView control, which allows arbitrary HTML to be placed within a control.</p>'
						})
					]
				})
			}),
			new TitledPane({
				title: 'Section 2',
				content: new VBox({
					spacing: 5,
					fillWidth: true,
					children: [
						new Label({text:'Hello World!'}),
						new Button({
							text: 'Show a popup',
							on: {
								action: function(e) {
									var popup = new Popup({
										width: '200px',
										content: new Label({
											text: "A popup. Click on this text to close it.",
											on: {
												click: function() {
													popup.visible = false;
												}
											}
										}),
										autoHide: true
									});
									popup.show(this, Pos.BOTTOM);
								}
							}
						}),
						new HTMLView({
							content: '<p>This is an HTMLView control, which allows arbitrary HTML to be placed within a control.</p>'
						})
					]
				})
			}),
			new TitledPane({
				title: 'Section 3',
				content: new VBox({
					spacing: 5,
					fillWidth: true,
					children: [
						new Label({text:'Hello World!'}),
						new Button({
							text: 'Click me',
							on: {
								action: function() {
									this.text = 'You clicked the button';
								}
							}
						}),
						new HTMLView({
							content: '<p>This is an HTMLView control, which allows arbitrary HTML to be placed within a control.</p>'
						})
					]
				})
			})
		]
	});
	document.body.appendChild(accordion.element);

	var toolbar = new ToolBar({
		children: [
			new Button({text: 'Load'}),
			new Button({text: 'Save'}),
			new Button({text: 'Save as...'}),
			new ToggleButton({text: 'Enable'}),
			new Separator({orientation: Orientation.VERTICAL}),
			new PasswordField()
		]
	});
	document.body.appendChild(toolbar.element);

	var tf = new TextField({
		promptText: 'Name:',
		on: {
			action: function() {
				alert('Submitted text: '+this.text);
			}
		}
	});
	var label2 = new Label();
	tf.textProperty.bindBidirectional(label2.textProperty);
	var labelBox = new HBox({
		children: [
			tf, label2
		]
	});
	document.body.appendChild(labelBox.element);
	var progressButton = new Button({
		text: 'Increase progress',
		on: {
			action: function() {
				progressInc.progress = ((progressInc.progress*100 + 10)%100)/100;
			}
		}
	});
	document.body.appendChild(progressButton.element);
	var progressInc = new ProgressBar({width: '10em', progress:.5});
	document.body.appendChild(progressInc.element);
	var progress = new ProgressBar({width: '10em', progress:.5});
	document.body.appendChild(progress.element);
	progress = new ProgressBar({width: '10em', progress:.5});
	document.body.appendChild(progress.element);

	progress = new ProgressBar({width: '10em', indeterminate:true});
	document.body.appendChild(progress.element);
	progress = new ProgressBar({width: '10em', indeterminate:true});
	document.body.appendChild(progress.element);
	progress = new ProgressBar({width: '10em', indeterminate:true});
	document.body.appendChild(progress.element);
	progress = new ProgressBar({width: '10em', indeterminate:true});
	document.body.appendChild(progress.element);

	var list = new ListView({
		cellFactory: function(listView) {
			var cell = new Cell();
			cell.textProperty.bind(Bindings.select(cell.itemProperty, 'nameProperty'));
			return cell;
		}
	});
	document.body.appendChild(list.element);
	list.items.add(
		new Project('jide.js'),
		new Project('node.js'),
		new Project('require.js'),
		new Project('Underscore.js')
	);
	list.items.get(3).name = 'jQuery';
	var textArea = new TextArea({
		prefRowCount: 5,
		prefColumnCount: 50
	});
	document.body.appendChild(textArea.element);
	var choiceBox, comboBox, editableToggleButton;
	var choiceBoxBox = new HBox({
		spacing: '5 10',
		children: [
			choiceBox = new ChoiceBox({
				items: ['Choice 1', 'Choice 2', 'Choice 3']
			}),
			comboBox = new ComboBox({
				editable: true,
				items: ['Choice 1', 'Choice 2', 'Choice 3']
			}),
			editableToggleButton = new ToggleButton({
				text: 'Editable',
				selected: true
			})
		]
	});
	choiceBox.selectionModel.selectFirst();
	comboBox.editableProperty.bind(editableToggleButton.selectedProperty);
	document.body.appendChild(choiceBoxBox.element);

	var anchorPane = new AnchorPane({
		width: '200px',
		height: '200px',
		children: [
			new Button({
				'AnchorPane.topAnchor': '10%',
				'AnchorPane.leftAnchor':  '10%',
				text: 'Top left'
			}),
			new Button({
				'AnchorPane.bottomAnchor': '10%',
				'AnchorPane.rightAnchor': '10%',
				text: 'Bottom right'
			})
		]
	});
	document.body.appendChild(anchorPane.element);

	var stackPane = new StackPane({
		width: '200px',
		height: '200px',
		children: [
			StackPane.alignment(new Button({text: 'Center left'}), Pos.CENTER_LEFT),
			StackPane.alignment(new Button({text: 'Center right'}), Pos.CENTER_RIGHT),
			StackPane.alignment(new Button({text: 'Bottom center'}), Pos.BOTTOM_CENTER)
		]
	});
	document.body.appendChild(stackPane.element);

	var tilePane = new TilePane({
		hgap: 5, vgap: 10,
		children: [
			new Button({text: 'Tile 1'}),
			new Button({text: 'Tile 2'}),
			new Button({text: 'Tile 3'}),
			new Button({text: 'Tile 4'}),
			new Button({text: 'Tile 5'}),
			new Button({text: 'Tile 6'}),
			new Button({text: 'Tile 7'}),
			new Button({text: 'Tile 8'}),
			new Button({text: 'Tile 9'}),
			new Button({text: 'Tile 10'})
		]
	});
	document.body.appendChild(tilePane.element);
	tilePane.children.removeAt(3);
	tilePane.children.insertAt(3, new Button({text: 'Tile 4'}));
	tilePane.orientation = Orientation.VERTICAL;
});