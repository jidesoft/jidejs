---
title: Observable values
template: chapter.html
---

# Using Observable values

Sometimes you may not need a full object to store your data. Instead, a single variable might be sufficient, for example,
to store the state of an application.

```javascript
// create an observable value with the initial value of "false"
var showDetails = new Observable(false), details;
// subscribe to changes of the value
showDetails.subscribe(function(event) {
    // make details visible or hide them
    if(event.value) details.classList.add('visible');
    else details.classList.remove('visible');
});
```

Where `details` is a **jide.js** component. Now it would be useful to modify the state of the `showDetails` variable
upon user interaction. We also want to utilize the variable to change the displayed text message.

```javascript
new Hyperlink({
    // one option to change the display: use the fluent API
    text: showDetails.when().then('Hide').otherwise('Details'),
    // add event listener for the "action" event
    on: {
        action: function() {
            // toggle the state of showDetails when the user clicks the link
            showDetails.set(!showDetails.get());
        }
    }
})
```

Now we're ready to create our details:

```javascript
details = new Label({
    text: 'Thanks for looking at the details! You can now hide them again.'
});
```

Let's take a look at the running example (put into a {@link jidejs/ui/layout/VBox} for layout):

<div id="output-01" class="output"></div>
<script>
require([
    'jidejs/base/Observable',
    'jidejs/ui/control/Label',
    'jidejs/ui/control/Hyperlink',
    'jidejs/ui/layout/VBox'
], function(Observable, Label, Hyperlink, VBox) {
    var details, showDetails = new Observable(false);
    showDetails.subscribe(function(event) {
        if(event.value) details.style.remove('display');
        else details.style.set('display', 'none');
        details.style.update();
    });
    new VBox({
        element: document.getElementById('output-01'),
        children: [
            new Hyperlink({
                text: showDetails.when().then('Hide').otherwise('Details'),
                onaction: function() {
                    showDetails.set(!showDetails.get());
                }
            }),
            details = new Label({
                style: {
                    display: 'none'
                },
                text: 'Thanks for looking at the details! You can now hide them again.'
            })
        ]
    });
});
</script>

## Using computed observables

There are numerous cases where you might need to calculate the value of an observable in a way that depends on other
observable values. **jide.js** supports these use cases through the `computed` method on {@link jidejs/base/Observable}.

In the example above, we used the {@link jidejs/base/Bindings jidejs/base/Bindings.when} method to define which text to display depending on
the state of the `showDetails` variable. An alternative would be to use {@link jidejs/base/Observable.computed} as follows:

```javascript
new Hyperlink({
    text: Observable.computed(function() {
        return showDetails.get() ? 'Hide' : 'Details';
    }),
    // ...
})
```

## Manually invalidating a computed value

Let's explore another use case: Calculating the available height of the browser window:

```javascript
var height = Observable.computed(function() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
});
```

However, since there are no observable values used to calculate the height, we need to invalidate it manually when
the browser is resized.

```javascript
window.addEventListener('resize', function() {
    height.invalidate();
}, false);
```

Invoking `invalidate` will automatically notify all listeners of `height` that its value has changed.

The functionality of this example is contained in the {@link jidejs/base/Window} module so that you don't need to
implement it should you need the functionality.