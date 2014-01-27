---
title: Using Controls
template: chapter.html
---

# Using Controls

**jide.js** comes bundled with lots of useful controls - too many to describe all in detail in this guide. This guide
will explain how you can instantiate controls and bind their properties to each other with a simple example.

## Instantiating a control

All controls follow the same concept: They can be instantiated using a constructor which accepts an object as its
parameter. This object is used to configure the control, including its property, CSS classes and the element containing it.

```javascript
require([
    'jidejs/ui/control/Button'
], function(Button) {
    var myButton = new Button({
        // define the text property
        text: 'Click the button',
        // define event listeners
        on: {
            // the 'action' event is fired when the button is clicked
            action: function() {
                alert('Hello jide.js');
            }
        }
    });
});
```

The configuration object can also contain observables whose values are directly bound to the property they are assigned to.

```javascript
require([
    'jidejs/base/Observable',
    'jidejs/ui/control/Button'
], function(Observable, Button) {
    var clickCounter = new Observable(0);
    var myButton = new Button({
        // define the text property
        text: Observable.computed(function() {
            return clickCounter.get() > 0 ? 'You clicked the button '+clickCounter.get()+' times' : 'Click';
        }),
        // define event listeners
        on: {
            // the 'action' event is fired when the button is clicked
            action: function() {
                clickCounter.set(clickCounter.get()+1);
            }
        }
    });
});
```

## Adding elements to the DOM

If you've tried to run the previous example, you'll have noticed that the button doesn't appear on the screen. Every
control in **jide.js** has an `element` property that contains its actual HTML element that needs to be inserted into
the document.

```javascript
require([
    'jidejs/base/Observable',
    'jidejs/ui/control/Button'
], function(Observable, Button) {
    var clickCounter = new Observable(0);
    var myButton = new Button({
        // define the text property
        text: Observable.computed(function() {
            return clickCounter.get() > 0 ? 'You clicked the button '+clickCounter.get()+' times' : 'Click';
        }),
        // define event listeners
        on: {
            // the 'action' event is fired when the button is clicked
            action: function() {
                clickCounter.set(clickCounter.get()+1);
            }
        }
    });
    document.body.appendChild(myButton.element); // append the element of the button to the document
});
```

Another option would be to provide the `Button` constructor with an appropriate HTML element, i.e.:

```xml
<button id="my-button"></button>
```

```javascript
require([
    'jidejs/base/Observable',
    'jidejs/ui/control/Button'
], function(Observable, Button) {
    var clickCounter = new Observable(0);
    var myButton = new Button({
        element: document.getElementById('my-button'),
        // define the text property
        text: Observable.computed(function() {
            return clickCounter.get() > 0 ? 'You clicked the button '+clickCounter.get()+' times' : 'Click';
        }),
        // define event listeners
        on: {
            // the 'action' event is fired when the button is clicked
            action: function() {
                clickCounter.set(clickCounter.get()+1);
            }
        }
    });
});
```

## A live demo of the example

<div id="example-1" class="output"></div>
<script>
require([
    'jidejs/base/Observable',
    'jidejs/ui/control/Button'
], function(Observable, Button) {
    var clickCounter = new Observable(0);
    var myButton = new Button({
        // define the text property
        text: Observable.computed(function() {
            return clickCounter.get() > 0 ? 'You clicked the button '+clickCounter.get()+' times' : 'Click';
        }),
        // define event listeners
        on: {
            // the 'action' event is fired when the button is clicked
            action: function() {
                clickCounter.set(clickCounter.get()+1);
            }
        }
    });
    document.getElementById('example-1').appendChild(myButton.element); // append the element of the button to the document
});
</script>

## Binding properties between controls

The previous example bound the buttons `text` property to a computed observable. It is, however, also possible to bind
properties between different controls.

```javascript
require([
    'jidejs/ui/control/TextField',
    'jidejs/ui/control/Label'
], function(TextField, Label) {
    var textfield = new TextField();
    var label = new Label();
    label.textProperty.bind(textfield.textProperty);

    document.body.appendChild(textfield.element);
    document.body.appendChild(label.element);
});
```

<div id="example-2" class="output"></div>
<script>
require([
    'jidejs/ui/control/TextField',
    'jidejs/ui/control/Label'
], function(TextField, Label) {
    var textfield = new TextField();
    var label = new Label();
    label.textProperty.bind(textfield.textProperty);

    var output = document.getElementById('example-2');

    output.appendChild(textfield.element);
    output.appendChild(label.element);
});
</script>