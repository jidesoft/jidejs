---
title: Using Layouts
template: chapter.html
---

# Using Layouts

**jide.js** offers layout panes that allow to structure an application in the most common ways.
This guide will introduce you to some of them and explains their usage. All layout panes follow the same usage pattern
so that by learning how to use one, you'll be able to easily learn the others by looking at their API documentation.

## Introducing HBox

{@link jidejs/ui/layout/HBox}, together with {@link jidejs/ui/layout/VBox}, is one of the most fundamental layout panes
but also one of the most useful ones. Just like any of the **jide.js** controls all layout panes accept an object that
is used to configure the layout pane. `HBox` is no exception to this rule.

```javascript
require([
    'jidejs/ui/layout/HBox',
    'jidejs/ui/control/Label'
], function(HBox, Label) {
    var box = new HBox({
        // configure the HBox so that each of its children uses the full available height
        fillHeight: true,

        children: [
            new Label({ text: 'Back' }),
            new Label({ text: 'Hello World' }),
            new Label({ text: 'Next' })
        ]
    });
    document.body.appendChild(box.element);
});
```

<div id="example-01" class="output"></div>
<script>
require([
    'jidejs/ui/layout/HBox',
    'jidejs/ui/control/Button'
], function(HBox, Button) {
    document.getElementById('example-01').appendChild(new HBox({
        // configure the HBox so that each of its children uses the full available height
        fillHeight: true,

        children: [
            new Button({ text: 'Back' }),
            new Button({ text: 'Hello World' }),
            new Button({ text: 'Next' })
        ]
    }).element);
});
</script>

Often, you'd like one element to fill the remaining space. In the example below, we modify the middle label ('Hello World')
to grow and use whatever space is still available.

```javascript
new Label({
    text: 'Hello World',
    'HBox.grow': 'always',
    style: { // add some styling so that the label text is centered
        'text-align': 'center'
    }
}),
```

<div id="example-02" class="output"></div>
<script>
require([
    'jidejs/ui/layout/HBox',
    'jidejs/ui/control/Button'
], function(HBox, Button) {
    document.getElementById('example-02').appendChild(new HBox({
        // configure the HBox so that each of its children uses the full available height
        fillHeight: true,

        children: [
            new Button({ text: 'Back' }),
            new Button({
                text: 'Hello World',
                'HBox.grow': 'always',
                style: {
                    'text-align': 'center'
                }
            }),
            new Button({ text: 'Next' })
        ]
    }).element);
});
</script>

The {@link jidejs/ui/layout/VBox} works exactly the same.

## Introducing BorderPane

{@link jidejs/ui/layout/BorderPane} offers the single most often used application layout. It allows to define a complete
application, with a header, footer, content area and two sidebars (one left and one right of the content).

```javascript
require([
    'jidejs/ui/layout/BorderPane',
    'jidejs/ui/control/Label'
], function(BorderPane, Label) {
    var appLayout = new BorderPane({
        children: [
            new Label({
                text: 'Header',
                'BorderPane.region': 'top'
            }),
            new Label({
                text: 'Footer',
                'BorderPane.region': 'bottom'
            }),
            new Label({
                text: 'Left',
                'BorderPane.region': 'left'
            }),
            new Label({
                text: 'Right',
                'BorderPane.region': 'right'
            }),
            new Label({
                text: 'Content',
                'BorderPane.region': 'center'
            }),
        ]
    });
    document.body.appendChild(appLayout.element);
});
```

<div id="example-03" class="output"></div>
<script>
require([
    'jidejs/ui/layout/BorderPane',
    'jidejs/ui/control/Button'
], function(BorderPane, Button) {
    var appLayout = new BorderPane({
        children: [
            new Button({
                text: 'Header',
                'BorderPane.region': 'top'
            }),
            new Button({
                text: 'Footer',
                'BorderPane.region': 'bottom'
            }),
            new Button({
                text: 'Left',
                'BorderPane.region': 'left'
            }),
            new Button({
                text: 'Right',
                'BorderPane.region': 'right'
            }),
            new Button({
                text: 'Content',
                'BorderPane.region': 'center'
            }),
        ]
    });
    document.getElementById('example-03').appendChild(appLayout.element);
});
</script>

## Combining multiple layout panes

By combining multiple simple layout panes you can create even the most complex applications. The
[E-Mail demo](/demo/apps/email/index.html) is build with only {@link jidejs/ui/layout/HBox}
and {@link jidejs/ui/layout/VBox}.

```javascript
require([
    'jidejs/ui/layout/BorderPane',
    'jidejs/ui/layout/HBox',
    'jidejs/ui/control/Label',
    'jidejs/ui/control/Button'
], function(BorderPane, HBox, Label, Button) {
    var appLayout = new BorderPane({
        children: [
            new HBox({
                'BorderPane.region': 'top',
                children: [
                    new Button({ text: 'Back' }),
                    new Label({
                        text: 'Example app',
                        'HBox.grow': 'always',
                         style: {
                             'text-align': 'center'
                         }
                    }),
                    new Button({ text: 'Next' })
                ]
            }),
            new Button({
                text: 'Left',
                'BorderPane.region': 'left'
            }),
            new Button({
                text: 'Content',
                'BorderPane.region': 'center'
            }),
        ]
    });
    document.body.appendChild(appLayout.element);
});
```

<div id="example-04" class="output"></div>
<script>
require([
    'jidejs/ui/layout/BorderPane',
    'jidejs/ui/layout/HBox',
    'jidejs/ui/control/Label',
    'jidejs/ui/control/Button',
    'jidejs/ui/control/TitledPane',
    'jidejs/ui/control/HTMLView'
], function(BorderPane, HBox, Label, Button, TitledPane, HTMLView) {
    var appLayout = new BorderPane({
        children: [
            new HBox({
                fillHeight: true,
                'BorderPane.region': 'top',
                children: [
                    new Button({ text: 'Back' }),
                    new Label({
                        text: 'Example app',
                        'HBox.grow': 'always',
                        style: {
                            'text-align': 'center'
                        }
                    }),
                    new Button({ text: 'Next' })
                ]
            }),
            new Button({
                'BorderPane.region': 'left',
                text: 'Sidebar'
            }),
            new Label({
                text: 'Content of the application<br><br>Usually contains the most important information.',
                'BorderPane.region': 'center',
                classList: ['well']
            }),
            new Label({
                'BorderPane.region': 'bottom',
                text: '' // just to prevent css issues due to embedding in the documentation website
            })
        ]
    });
    document.getElementById('example-04').appendChild(appLayout.element);
});
</script>