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
    'jidejs/ui/Template',
    'jidejs/ui/control/Button',
    'text!./ButtonTemplate.html'
], function(Template, Button, ButtonTemplate) {
    // upgrade the element to a button
    new Button({
        element: document.getElementById('custom_button'),
        on: {
            action: function() {
                alert('You clicked the button');
            }
        }
    });

    // specify template during creation
    // start by transforming the text template into an template element
    ButtonTemplate = Template(ButtonTemplate);
    document.body.appendChild(new Button({
        template: ButtonTemplate,
        text: 'Submit',
        on: {
            action: function() {
                alert('You clicked the button');
            }
        }
    }).element);
});