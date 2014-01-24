---
title: Yeoman Quickstart
template: chapter.html
---

# What is Yeoman?

[Yeoman](http://yeoman.io) is a nice friend who will help you to set up a new project using **jide.js**,
[Bower](http://www.bower.io) and [Grunt](http://gruntjs.com/).

First, you need to install [Yeoman](http://yeoman.io) itself using npm.

```
$ npm install -g yo
```

# Installing the jide.js generator for Yeoman

Sadly, Yeoman itself has no idea how to do anything useful for you. You need to install a generator first that will help
you with creating your project. Thankfully, such a generator exists for **jide.js** and we're just one command away from
installing it.

```
npm install -g generator-jidejs
```

Alright, we're all set and ready to go.

# Creating a project

Now that you have setup the Yeoman generator for **jide.js**, you can easily create a fully working project to help you
to get started:

```
yo jidejs
```

The **jide.js** generator for Yeoman will ask you a couple of questions, currently, there are only two questions asked:
How would you like to call your project and whether or not you want to use an `EventBus`. If you don't know what an
`EventBus` is, just say no.

Yeoman will take care of your project setup. It will create a small sample project, install **jide.js** as a Bower
dependency and even setup a simple Gruntfile for you, that contains a LiveReload enabled preview server and a build task
for an optimized release build (minified and concatenated sources, optimized CSS).

# Exploring the project

Since Yeoman has done a lot of work for you, you can just start the preview server:

```
grunt serve
```

This will start a server and you can take a look at the sample application at [http://localhost:3000](http://localhost:3000).
The application is very simple but should work fine as a starting point for you.

It is designed as a multi page application, i.e. you can have multiple, logical, pages on a single page. In order to
get to know the sample application, we'll now add a second page and a navigation to switch the pages.

Please note that the demo application makes use of the new templating feature supported since **jide.js** 1.0.0 beta 2.

## Creating a new page

Let's create a very basic todo application. We want to be able to add todo items and to delete them. A more complete
variant of this demo will be introduced in the [Custom Controls](/guide/03-custom-controls/04-custom-controls.html) guide.
For now, we'll keep it simple.

Create a new file, `app/page/TodoPage.js`, and put the following code inside:

```javascript
define([
    'jidejs/base/Class',
    'jidejs/base/ObservableList',
    'jidejs/ui/Control',
    'jidejs/ui/Skin',

    'text!app/view/todoPage.html'
], function(
    Class, ObservableList, Control, Skin,
    TodoPageTemplate
) {
    function TodoPage(config) {
        if(!config) config = {};

        // get the todo items from the config or create a fresh list
        if(!config.items) config.items = new ObservableList();
        else config.items = ObservableList(config.items);
        this.items = config.items;
        delete config.items; // don't want to reset the items later on

        Control.call(this, config);
        this.classList.add('page');
        this.classList.add('todo');
    }
    Class(TodoPage).extends(Control);

    TodoPage.Skin = Skin.create(Skin, {
        template: TodoPageTemplate,

        convertTodoItem: function(item) {
            return item.title;
        },

        insertNewItem: function() {
            this.queryComponent('x-input').then(function(taskField) {
                this.component.items.add({
                    title: taskField.text,
                    done: false
                });
                taskField.text = '';
            }.bind(this));
        },

        deleteSelectedItem: function() {
            this.queryComponent('x-todoitems').then(function(todoItems) {
                var items = todoItems.items,
                    selectionModel = todoItems.selectionModel;
                if(selectionModel.selectedItem) {
                    items.remove(selectionModel.selectedItem);
                }
            });
        }
    });
    return TodoPage;
});
```

We've now defined our model and view model for this page. To keep it simple, we've not defined a TodoItem model and kept
the code to the bare minimum. As you can see, our TodoPage model has an `items` property that is specified as an
{@link module:jidejs/base/ObservableList} and the items within this list are supposed to be objects with a `title` and a
`done` property (though we're not using the `done` property anywhere right now).

Our brand new TodoPage still needs a template, though, so let's add the code for that in a new file: `app/view/todoPage.html`.

```xml
<template>
    <div>
        <input type="text" pseudo="x-input" bind="
            is: 'jidejs/ui/control/TextField',
            on: { action: insertNewItem.bind($item) }
        ">
    </div>
    <div>
        <ul pseudo="x-todoitems" bind="
            is: 'jidejs/ui/control/ListView',
            items: component.items,
            converter: convertTodoItem
        "></ul>
    </div>
    <div>
        <button bind="
            is: 'jidejs/ui/control/Button',
            on: { action: deleteSelectedItem.bind($item) }
        " text="Delete selected"></button>
    </div>
</template>
```

We've kept that simple, too. Since **jide.js** 1.0.0 beta 2, we can use templates to define the view of our controls and
use data binding within those templates to establish bindings between visual elements and logical handlers and data
provided by the model or view model (the control class or its skin). The `is` binding has a special meaning in that it
upgrades an element to a **jide.js** control which is fetched asynchronously through AMD. That's why we need to use the
(@link jidejs/ui/Skin#queryComponent} method to access such a control - it might not have been upgraded by the time the
method is called.

## Adding a navigation

Now we need to modify the sample application in order to add a navigation menu that allows us to switch between our two
pages. First, we'll want to extend the `MultiPageApplication.js` with an {@link jidejs/base/ObservableList} of pages.

```javascript
define([
  'jidejs/base/Class',
  'jidejs/base/ObservableProperty',
  'jidejs/base/ObservableList',
  'jidejs/ui/Control',
  'jidejs/ui/Skin',
  'jidejs/ui/control/SingleSelectionModel',

  'text!app/view/index.html'
], function(
    Class, ObservableProperty, ObservableList,
    Control, Skin, SingleSelectionModel,
    IndexTemplate
) {
  function MultiPageApplication(config) {
    installer(this);
    if(!config) config = {};
    if(!config.pages) config.pages = new ObservableList();
    else config.pages = ObservableList(config.pages);
    this.pages = config.pages;
    delete config.pages;

    Control.call(this, config);
    this.classList.add('app');
  }
  Class(MultiPageApplication).extends(Control);
  var installer = ObservableProperty.install(MultiPageApplication, 'activePage');

  MultiPageApplication.Skin = Skin.create(Skin, {
    template: IndexTemplate,

    install: function() {
        var app = this.component;
        this.pageSelectionModel = new SingleSelectionModel(app.pages, true);
        app.activePageProperty.bind(this.pageSelectionModel.selectedItemProperty);

        Skin.prototype.install.call(this);
    },

    convertPage: function(page) {
        return page.title;
    }
  });
  return MultiPageApplication;
});
```

As you can see, we've changed a few things around, added a `pages` property which will contain all known pages we want
to navigate between, and we've improved its Skin with knowledge of a `SelectionModel` that we'll need in order to
display the pages as a (@link jidejs/ui/control/ListView}. We've also established a binding between the selection model
and the `activePage` property of the `MultiPageApplication` so that we can read that property if we ever need to know
what page is currently active. We also added a method that can help us to convert a page into a string - also something
we'll need for our list view.

Now let's proceed to the template for this control, change `app/view/index.html` to something like this:

```xml
<template>
    <h1>Welcome to test</h1>
    <ul bind="
        is: 'jidejs/ui/control/ListView',
        items: component.pages,
        selectionModel: pageSelectionModel,
        converter: convertPage,
        orientation: 'horizontal'
    "></ul>
    <div bind="content: pageSelectionModel.selectedItem"></div>
</template>
```

As you can see, we've just added a {@link jidejs/ui/control/ListView} control to our app and set up a couple of bindings
between it and our model and view model.

## Putting it all together

At this point, we've implemented a new todo page and enhanced the `MultiPageApplication` control to support a list of
pages that it also shows as a navigation. Now it is time to actually start using those features in our application.
Open up the `app/main.js` file and change it like this:

```javascript
//region configure requirejs to load jide.js library
require.config({
    "baseUrl": '.',
    "packages": [{
        name: 'jidejs',
        location: './bower_components/jidejs/jidejs'
    }, {
        name: 'app',
        location: './app'
    }],
    paths: {
        text: './bower_components/requirejs-text/text'
    }
});
//endregion

require([
  'app/MultiPageApplication',
  'app/page/IndexPage',
  'app/page/TodoPage'
], function(MultiPageApplication, IndexPage, TodoPage) {
  var app = new MultiPageApplication({
      pages: [
          new IndexPage({ title: 'Index' }),
          new TodoPage({ title: 'Todo' })
      ]
  });
  document.body.appendChild(app.element);
});
```

Save the file and take a look at your browser - unless you've closed the page before or stopped the server, your browser
will have reloaded your application and you can take a look at the changes you've made. Switch between the two implemented
pages (Index and Todo) and toy around with it.

Now, let's work on the look of our application. We won't change much, but a few things would be nice. Open up
`style/app.less` and change it to look more like this:

```css
// Import default style rules for jide.js
@import "../bower_components/jidejs/style/default.less";

// Insert custom rules below

h1 {
    margin: 0;
    margin-bottom: (@unit*3);
}

.app {
  margin-top: (@unit*5);
  margin-left: (@unit*25);
}

.x-outputarea {
  margin-top: (@unit*3);
  margin-left: (@unit*(-2));
}

.app > ul {
    position: absolute;
    left: (@unit*100);
    top: (@unit*5);
    border: 1px solid @lightgray;
}
```

Save the file and watch as your browser reloads the page with the new styling.

## Building your application

In order to build an optimized version of your application, just type:

```
grunt build
```

into your command line. This will generate a `build` directory that contains all of your resources and an optimized
(= minified) version of **jide.js**, your application and your stylesheet.

To preview your build, use this command:

```
grunt preview
```

and visit [http://localhost:3000](http://localhost:3000) to view your application.