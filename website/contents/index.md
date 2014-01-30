---
title: Index
template: index.html
---

jide.js
=======

**jide.js** is an **open source**, MIT licensed, **Javascript** toolkit for developing rich, modern web applications. It features various
powerful UI controls and is built around the concept of properties and data binding and enables highly efficient programming.
**jide.js** uses the AMD format and can be used with any AMD compatible loader such as [require.js](http://www.requirejs.org)
but also supports [Browserify](http://browserify.org).

Observable variables and data binding
-------------------------------------

<div id="front_page_example" class="output"></div>
<script>
require([
    'jidejs/base/Observable',
    'jidejs/ui/layout/VBox', 'jidejs/ui/control/TextField', 'jidejs/ui/control/Label'
], function(Observable, VBox, TextField, Label) {
    var name;
    new VBox({
        element: document.getElementById('front_page_example'),
        spacing: '4px 0',
        children: [
            name = new TextField({ promptText: 'Please enter your name.' }),
            new Label({
                text: Observable.computed(function() {
                    return 'Hello, my name is '+
                            (name.text || '')+
                            ' and I am exploring <b>jide.js</b>!';
                })
            })
        ]
    });
});
</script>

```javascript
require([
    'jidejs/base/Observable',
    'jidejs/ui/layout/VBox', 'jidejs/ui/control/TextField', 'jidejs/ui/control/Label'
], function(Observable, VBox, TextField, Label) {
    var name;
    new VBox({
        element: document.getElementById('front_page_example'),
        spacing: '4px 0',
        children: [
            name = new TextField({ promptText: 'Please enter your name.' }),
            new Label({
                text: Observable.computed(function() {
                    return 'Hello, my name is '+
                        (name.text || '')+
                        ' and I am exploring <b>jide.js</b>!';
                })
            })
        ]
    });
});
```

```xml
<div id="front_page_example"></div>
```

Developed by experts
--------------------

JIDE Software is a leading provider of professional components for *Swing* and *JavaFX* and has years of experience in solving
the needs of large businesses and startups. **jide.js** has been created by those same experts that have been trusted by
thousands of clients with their mission critial applications. It leverages all the experience to produce a development
experience that is nothing short of astonishing. Develop applications with ease by binding your data to your view. Separate
your data model from your view logic, write modular applications by leveraging the power of *AMD*.