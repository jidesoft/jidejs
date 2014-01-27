---
title: Template Binding
template: chapter.html
---

# Template Binding

When creating a custom **jide.js** control, it is likely that you'll want to use a `Template`. `Templates` support
binding expressions that allow you to bind the values of properties to HTML elements. You can set binding expressions
by adding a `bind` attribute to an HTML element.

The **bind** attribute supports a limited set of instructions that are useful when authoring templates.

## content

Inserts the value as the only child of the element. The value can be an element, a document fragment, a control or a string
(inserted using innerHTML when available and as text if not).

```xml
<span bind="content: component.content"></span>
```

## text

Inserts the value as the only child of the elment as a text node. The value must be a string.

```xml
<span bind="text: component.content"></span>
```

## html

Inserts the value as the inner html of the elemnt. The value must be a string.

```xml
<div bind="html: component.text"></div>
```

## foreach

Inserts the contents of the value as children of the element. The value must be an Array or an {@link jidejs/base/ObservableList}.
If the element has a child element, it is expected to be a _template_ element and is used to wrap each item of the array.
In case such a template element is specified, the values of the array can be anything (including custom elements). If
no template is specified, the items must be elements or controls.

Within the inner `template` element, the scope is changed. `$item` refers to the currently iterated item and `$parent` refers
to the scope outside of the `template` element.

```xml
<ul bind="foreach: component.items">
    <template>
        <li bind="text: $item.title"></li>
    </template>
</ul>
```

## attr
The value of this binding is expected to be an object where each key-value pair describes the name and value of an attribute.
If the value is either _false_, _null_ or _undefined_, the attribute will be removed from the element.

```xml
<input type="checkbox" bind="
    attr: {
        'checked': control.checked
    }
">
```

## css

The value of this binding is expected to be an object where each key-value pair describes the name and presence of a
CSS class. If the value is truthy, the class will be added, if it is falsy, it will be removed.

```xml
<div bind="
    css: {
        'is-hidden': !visible
    }
"></div>
```

## style

The value of this binidng is expected to be an object where each key-value pair describes the name and value of a CSS style
attribute.

```xml
<div bind="
    style: {
        left: positionX,
        top: positionY
    }
"></div>
```

## on

The value of this binidng is expected to be an object where each key-value pair describes an event name and its handler
function of event listeners that should be added to the element.

```xml
<span bind="
    on: {
        click: close.bind($item)
    }
">x</span>
```

## is

When an `is` binding exists, its value will be used as the name of the control that should be instantiated. All other
bindings will then be forwarded to the control as its config argument.

```xml
<span bind="
    is: 'jidejs/ui/control/Button',
    text: 'Close',
    icon: closeIcon,
    on: {
        click: close.bind($item)
    }
"></span>
```