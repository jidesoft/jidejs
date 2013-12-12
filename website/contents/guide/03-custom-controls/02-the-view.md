---
title: The View
template: chapter.html
---

# The View

In this chapter, we'll explore the numerous ways you can use to change the view of a control. Supplying a custom view
can greatly assist you in creating a unique appearance for your application and can even be used to create variations
of controls.

## Setting a template in HTML

When creating a control from an HTML element you can easily specify its view directly within your HTML. In the example
below we set the **text** property of the button using a custom attribute and specify its view using a _template_ element.
For this example, we'll use SVG to create our custom button UI but using HTML is just as easy.

```xml
<div id="custom_button" text="Hello World">
    <template>
        <svg width="200" height="28">
            <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop stop-color="#a0caf6" offset="0"/>
                    <stop stop-color="#1579df" offset="0.5" />
                    <stop stop-color="#1675d6" offset="0.5"/>
                    <stop stop-color="#115ca9" offset="1"/>
                </linearGradient>
            </defs>
            <g cursor="pointer" width="200">
                <rect x="0" y="0" rx="8" ry="8" width="200" height="28"
                      style="fill:url(#gradient);"/>
                <text fill="white" font-size="14pt" text-anchor="middle" x="100" y="20" bind="text: component.text"></text>
            </g>
        </svg>
    </template>
</div>
```

It is also possible to reuse a template for multiple controls in case you want to by utilizing the custom **ref** attribute.

```xml
<template id="flashy_button_template">
    <svg width="200" height="28">
        <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                <stop stop-color="#a0caf6" offset="0"/>
                <stop stop-color="#1579df" offset="0.5" />
                <stop stop-color="#1675d6" offset="0.5"/>
                <stop stop-color="#115ca9" offset="1"/>
            </linearGradient>
        </defs>
        <g cursor="pointer" width="200">
            <rect x="0" y="0" rx="8" ry="8" width="200" height="28"
                  style="fill:url(#gradient);"/>
            <text fill="white" font-size="14pt" text-anchor="middle" x="100" y="20" bind="text: component.text"></text>
        </g>
    </svg>
</template>

<div id="custom_button" text="Hello World">
    <template ref="#flashy_button_template"></template>
</div>
```

The **ref** attribute expects a CSS selector that points to the template that should be used.

## Setting a template in Javascript

Sometimes it'd not be practical to place your View template directly within the HTML structure. In these cases, **jide.js**
offers a utility function that will transform a _String_ to a _template_ element. Since we're already using _require.js_
we can rely on its _text_ plugin to load the template file for us.

```js
require([
    'jidejs/ui/Template',
    'jidejs/ui/control/Button',
    'text!./ButtonTemplate.html' // load template file using require.js text plugin
], function(Template, Button, ButtonTemplate) {
    // start by transforming the text template into a template element
    ButtonTemplate = Template(ButtonTemplate);
    // simply add the Button to the DOM
    document.body.appendChild(new Button({
        template: ButtonTemplate, // reference template
        text: 'Submit',
        on: {
            action: function() {
                alert('You clicked the button');
            }
        }
    }).element);
});
```

Now only the template file is missing, in this case, we'll put it within the same directory within a file
named **ButtonTemplate.html**.

```xml
<template>
    <span style="color: #FFF; opacity: .5">Do</span>
    <span bind="content: component.text"></span>
</template>
```

It is quite important to use {@link jidejs/ui/Template} to convert your template string into an element since it'll take
care of upgrading the new HTML5 _template_ element in case it is not supported by the browser.

## Supported View Bindings

The **bind** attribute supports a limited set of instructions that are useful when authoring templates.

- **content**
  Inserts the value as the only child of the element. The value can be an element, a document fragment, a control or a string
  (inserted using innerHTML when available and as text if not).
- **text**
  Inserts the value as the only child of the elment as a text node. The value must be a string.
- **html**
  Inserts the value as the inner html of the elemnt. The value must be a string.
- **foreach**
  Inserts the contents of the value as children of the element. The value must be an Array or an {@link jidejs/base/ObservableList}.
  If the element has a child element, it is expected to be a _template_ element and is used to wrap each item of the array.
  In case such a template element is specified, the values of the array can be anything (including custom elements). If
  no template is specified, the items must be elements or controls.
- **attr**
  The value of this binding is expected to be an object where each key-value pair describes the name and value of an attribute.
  If the value is either _false_, _null_ or _undefined_, the attribute will be removed from the element.
- **css**
  The value of this binding is expected to be an object where each key-value pair describes the name and presence of a
  CSS class. If the value is truthy, the class will be added, if it is falsy, it will be removed.
- **style**
  The value of this binidng is expected to be an object where each key-value pair describes the name and value of a CSS style
  attribute.
- **on**
  The value of this binidng is expected to be an object where each key-value pair describes an event name and its handler
  function of event listeners that should be added to the element.