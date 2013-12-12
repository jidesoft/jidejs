---
title: Introduction
template: chapter.html
---

# Introduction to custom Controls

Since **jide.js** version _1.0 beta 2_ it has become even easier to create new custom controls. This guide is intended
to help you understand how controls in **jide.js** are structured, how to achieve separation of concerns and how to create
your own controls from scratch.

## The MVVM (Model-View-ViewModel) pattern

**jide.js** controls are structured using the _MVVM_ pattern in a way that might take a little getting used to when coming
from toolkits such as _Swing_. As you've already learned in the [Getting started](/guide/01-getting-started/04-controls.html)
guide, **jide.js** puts a focus on observable properties and data bindings, allowing it to be easily integrated with your
own data.

Even though **jide.js** controls are designed in a way that emphasises the _MVVM_ pattern, there is no limitation on how
you use it, thus you can pick your preferred design pattern.

The _MVVM_ pattern divides our controls into three parts:

- **Model**
  A model contains the business data you want to display. In **jide.js**, the actual control you use fulfills this role.
- **View**
  The View is what defines how a control should look. Since **jide.js** version 1.0 beta 2, this can be done using templates.
  It retrieves its data from the Model and ViewModel using data binding.
- **ViewModel**
  The ViewModel acts as a proxy between the View and the Model. It allows to define view-logic properties (like a mapping
  from a list of child data to HTML elements) and event handlers. In **jide.js**, this role is handled by the
  {@link module:jidejs/ui/Skin Skin} class.

## Changing the **View** or **ViewModel** of an existing control

Because of how a **jide.js** control is split into three parts, it is easy to substitute one or all of them with
a custom implementation.

If you want to change the DOM of a control, just supply it with a _template_ property when creating it. We'll explore
how to do that in [The View](/guide/03-custom-controls/02-the-view.html).

Sometimes, however, it might be necessary to change a control more significantly. In those cases, you should consider
replacing its {@link jidejs/ui/Skin Skin}. When instantiating a control, you have the option of supplying it with a
_skin_ property to allow you to change the used {@link jidejs/ui/Skin Skin}.

## Creating new controls from scratch

Read [Custom Controls](/guide/03-custom-controls/04-custom-controls.html) to learn how to create completely custom controls.
This chapter expects the knowledge gained by reading the above, though. So make sure to read the other ones first.