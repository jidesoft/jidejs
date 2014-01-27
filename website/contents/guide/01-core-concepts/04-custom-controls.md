---
title: Custom Controls
template: chapter.html
---

# Custom Controls

When creating a **jide.js** application, you'll most likely want to create your own, custom controls. This guide
will teach you how to create such a control and introduce you to the most common design pattern when creating
such a control.

## The Control structure

### The Control

In **jide.js**, a `Control` is made up of multiple parts that help you to create maintainable applications.
The `Control` itself should only contain the properties that make up the control. For example, a `Button` would need
the properties `text` and `icon`. In addition to those properties, it should have a `Skin`.

### The Skin

The `Skin` is responsible for providing event handlers and properties that are not useful to the `Control` but are still
required to display the control. For example, a filtered list would have an
{@link jidejs/base/ObservableList ObservableList} property named `items` but since we want to filter it based on user
input, the `Skin` would have a `filteredItems` list based on the `Controls` `items` property.
At this point, you're free to choose whether or not you want the `Skin` to create and manage the DOM representation of the
`Control` or if you'd prefer to leave that to a `Template` (you should!).

### The Template

A `Template` is an HTML string that is assigned to the `Skin` and contains the internal DOM representation as well as
data bindings between the DOM elements and the `Skin` and `Control` properties and event handlers. The styling of the
DOM representation is handled by the `Theme`.

### The Theme

This is basically just a bunch of CSS (or preferably LESS) rules that define how the control should be rendered.

## Example

In this example, we'll create a simple `Switch` control.

### The Switch Control

```javascript
define([
    // import jide.js classes
    'jidejs/base/Class',
    'jidejs/base/ObservableProperty',
    'jidejs/ui/Control',

    // import the default Skin
    'SwitchSkin'
], function(
    Class, ObservableProperty,
    Control, SwitchSkin,
    SwitchTemplate
) {
    // define the constructor
    function Switch(config) {
        // initiate the properties
        installer(this);
        // call the parent class
        Control.call(this, config || {});
        this.classList.add('jide-extra-switch');
    }
    // define the class
    Class(Switch).extends(Control).def({
        checked: false,
        checkedText: null,
        uncheckedText: null
    });
    // install the required properties
    var installer = ObservableProperty.install(Switch, 'checked', 'checkedText', 'uncheckedText');

    // set the default Skin
    Switch.Skin = SwitchSkin;

    // return the Control
    return Switch;
});
```

### The Switch Skin

```javascript
define([
    'jidejs/ui/Skin',
    'text!./Switch.html'
], function(Skin, SwitchTemplate) {
    // this is the standard Skin implementation
    return Skin.create(Skin, {
        // set the default template
        template: SwitchTemplate,

        // an event handler that should be invoked when the user toggles the Switch
        toggleCheckedState: function() {
            var toggle = this.component;
            toggle.checked = !toggle.checked;
        }
    });
});
```

### The Switch Template

```xml
<template bind="
    css: {
        'is-checked': component.checked
    },
    on: {
        click: toggleCheckedState.bind($item)
    }
">
    <small pseudo="x-checkmark" bind="
        text: component.checked ? component.checkedText : component.uncheckedText
    "></small>
</template>
```

The `Template` contains binding expressions that can be added to an HTML element using the `bind` attribute.
A detailed explanation of the available bindings can be found in the chapter
[Template Binding](./05-template-binding.html).

### The Switch Theme

Usually, you'll want to use LESS to create a theme.

```scss
.jide-extra-switch {
    .background(@base, @border, @highlight, @checkmark) {
        background: @base;
        border: 1px solid @border;
        .box-shadow(@border 0px 0px 0px 0px inset);

        & > .x-checkmark {
            background: @checkmark;
            color: @highlight;
        }

        &.is-checked {
            background: @highlight;
            border-color: @highlight;
            .box-shadow(@highlight 0px 0px 0px 16px inset);
        }
    }

    .jide-extra-switch > .background(@inverse, @silver, @lightgray, @inverse);

    border-radius: 20px;
    cursor: pointer;
    display: inline-block;
    height: 32px;
    position: relative;
    vertical-align: middle;
    width: 52px;
    .transition("border 0.4s, box-shadow 0.4s, background-color 1.2s");

    & > .x-checkmark {
        .box-sizing(border-box);
        text-align: center;
        padding: 7px 0;
        border-radius: 100%;
        .box-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
        height: 30px;
        width: 30px;
        position: absolute;
        top: 0;
        left: 0px;
        .transition(left 0.2s);
    }

    &.is-checked {
        & > .x-checkmark {
            left: 20px;
        }
    }

    &.primary {
        .jide-extra-switch > .background(@inverse, @silver, @firm, @inverse);
    }
    &.info {
        .jide-extra-switch > .background(@inverse, @silver, @info, @inverse);
    }
    &.danger {
        .jide-extra-switch > .background(@inverse, @silver, @danger, @inverse);
    }
    &.success {
        .jide-extra-switch > .background(@inverse, @silver, @success, @inverse);
    }
    &.warning {
        .jide-extra-switch > .background(@inverse, @silver, @warning, @inverse);
    }
    &.inverse {
        .jide-extra-switch > .background(@inverse, @silver, @base, @inverse);
    }
}
```

Using LESS has the advantage of being able to use mixins defined by the default theme.

### Using the Switch Control

```javascript
require(['Switch'], function(Switch} {
    document.body.appendChild(new Switch({checked: true, checkedText: 'Yes', uncheckedText: 'No'}).element);
    document.body.appendChild(new Switch({classList: ['primary'], checked: true, checkedText: 'On', uncheckedText: 'Off'}).element);
    document.body.appendChild(new Switch({classList: ['info'], checked: true}).element);
    document.body.appendChild(new Switch({classList: ['danger'], checked: true}).element);
    document.body.appendChild(new Switch({classList: ['success'], checked: true}).element);
    document.body.appendChild(new Switch({classList: ['warning'], checked: true}).element);
    document.body.appendChild(new Switch({classList: ['inverse'], checked: true}).element);
});
```