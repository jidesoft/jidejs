//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '/bower_components/jidejs'
	}],
    paths: {
        text: '/bower_components/requirejs-text/text'
    }
});
//endregion

require([
	'jidejs/ui/control/Button',
	'jidejs/ui/control/TitledPane',
	'jidejs/ui/control/HTMLView',
	'jidejs/ui/control/Hyperlink',
	'jidejs/ui/control/Popup',
	'jidejs/ui/control/TextField',
	'jidejs/ui/Pos',
	'jidejs/ui/control/TextArea',
	'jidejs/ui/control/ComboBox',
	'jidejs/ui/control/Label',
	'jidejs/ui/layout/GridPane',
	'jidejs/ui/layout/VBox'
],
function(
	Button, TitledPane, HTMLView, Hyperlink,
	Popup, TextField, Pos, TextArea, ComboBox, Label,
	GridPane, VBox
) {
	"use strict";

	var area = GridPane.area;
	var grid = new GridPane({
		width: '100%',
		height: '100%',
		grid: [
			'header  header header',
			'sidebar .      content',
			'footer  footer footer'
		],
		columnDefinition: '250px 5px 1fr',
		rowDefinition: 'auto 1fr auto',
		children: [
			area(new HTMLView({
				content: '<h1>jide.js - Grid layout demo</h1>'
			}), 'header'),
			area(new VBox({
				children: [
					new TitledPane({
						title: "About",
						width: '100%',
						content: new HTMLView({content: document.getElementById('about')})
					}),
					new TitledPane({
						title: 'Things to try',
						width: '100%',
						content: new HTMLView({content: document.getElementById('thingsToTry')})
					})
				]
			}), 'sidebar'),
			area(new GridPane({
				style: {
					width: '100%',
					height: '100%'
				},
				/*grid: [
					'a . b b',
					'. . . .',
					'c . d d',
					'. . . .',
					'e e e e',
					'. . . .',
					'f f f f',
					'. . . .',
					'. . . i'
				],*/
				columnDefinition: 'auto 5px 1fr auto',
				rowDefinition: 'auto 5px auto 5px auto 5px 1fr 5px auto',
				children: [
					area(new Label({
						text: 'Recipient',
						'GridPane.position': { row : 1, column: 1 }
					}), 'a'),
					area(new TextField({
						width: '100%',
						'GridPane.position': { row : 1, column: 3, colspan: 2 }
					}), 'b'),
					area(new Label({
						text: 'Title',
						'GridPane.position': { row : 3, column: 1 }
					}), 'c'),
					area(new TextField({
						width: '100%',
						'GridPane.position': { row : 3, column: 3, colspan: 2 }
					}), 'd'),
					area(new Label({
						text: 'Message',
						'GridPane.position': { row : 5, column: 1, colspan: 4 }
					}), 'e'),
					area(new TextArea({
						width: '100%',
						height: '100%',
						'GridPane.position': { row : 7, column: 1, colspan: 4 }
					}), 'f'),
					area(new Button({
						text:'Send',
						'GridPane.position': { row : 9, column: 4 }
					}), 'i'),
				]
			}), 'content'),
			area(new Hyperlink({
				text: 'Copyright &copy; 2012 JIDE Software, INC',
				href: 'http://www.jidesoft.com'
			}), 'footer')
		]
	});
	document.body.appendChild(grid.element);
});