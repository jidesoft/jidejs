//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '../../../jidejs'
	}],
    paths: {
        text: '../../../bower_components/requirejs-text/text'
    }
});
//endregion

require([
	'register', 'jidejs/ui/control/Button', 'jidejs/ui/control/TitledPane', 'jidejs/ui/control/Accordion'
], function(
	register, Button, TitledPane, Accordion
) {
	"use strict";

	register('button', Button, HTMLButtonElement);
	register('titledpane', TitledPane, HTMLDivElement);
	register('accordion', Accordion, HTMLDivElement);

	var buttonElement = document.getElementById('helloWorldButton'),
		button = buttonElement.component;
	button.text = 'Click me!';
	button.on('click', function() {
		alert(this.text);
		buttonElement.setAttribute('text', 'Hello Universe!');
		var second = document.createElement('jide-button');
		second.component.text = "I've been created dynamically!";
		document.body.appendChild(second);
	});
});