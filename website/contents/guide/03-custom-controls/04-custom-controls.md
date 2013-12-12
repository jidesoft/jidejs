---
title: Custom Controls
template: chapter.html
---

# Custom Controls

This chapter will explain how to create custom controls using **jide.js**. We'll create a basic todo application that
is a custom control and benefits from separation of concerns.

## The Data Model

Our Todo application needs two separate data models. Naturally, we need a data model that represents a Todo item, let's
call it Task. We need nothing fancy here, a title and a done state will be sufficient for the purpose of this example.
Thus, our first lines of code will define the Task model:

```js
define([
    'jidejs/base/Class',
    'jidejs/base/ObservableProperty'
], function(Class, ObservableProperty) {
    function Task(title, done) {
        installer(this);
        this.title = title;
        this.done = done;
    }
    var installer = ObservableProperty.install(Task, 'title', 'done');

    return Task;
});
```

In addition to this simple Task model, we also need a model that represents our TodoApp. In jide.js, such a model is
a control.

```js
define([
    'jidejs/base/Class',
    'jidejs/base/DependencyProperty',
    'jidejs/base/ObservableList',
    'jidejs/ui/Control',
    'viewmodel/TodoAppSkin'
], function(
    Class, DependencyProperty, ObservableList, Control, TodoAppSkin
) {
    // useful utility function
    function matchOpen(task) {
        return !task.done;
    }

    function TodoApp(config) {
        // make sure that we have a config object
        config || (config = {});
        // create the tasks list, use the tasks provided with the config or create an empty list for them
        this.tasks = ObservableList(config.tasks || []);
        // remove tasks from config so that it is not reassigned when forwarding its creation to Control
        delete config.tasks;

        // create a DependencyProperty for the open tasks
        this.openTasksProperty = new DependencyProperty(this, 'openTasks', function() {
            return this.tasks.toArray().filter(matchOpen).length;
        });
        // we need to invalidate it whenever the list of tasks is changed
        this.tasks.on('change', function() {
            this.openTasksProperty.invalidate();
        }).bind(this);

        // let Control handle the rest of the creation
        Control.call(this, config);
    }
    Class(TodoApp).extends(Control).def({
        // shortcut to the openTasksProperty
        get openTasks() {
            return this.openTasksProperty.get();
        }
    });
    // assign default Skin/ViewModel
    TodoApp.Skin = TodoAppSkin;

    // we're done!
    return TodoApp;
});
```

In this case, we don't need much more than the list of tasks but for comfort, we'll also keep a DependencyProperty that
knows the number of open tasks. Here, we've opted for loading the default Skin (which we'll define later on) and assign
it to our TodoApp control (which will allow the Control class to pick it as the default Skin). If we wanted to, we could
change it during creation by specifying a _skin_ property for the _config_ parameter.

## The View

Now that we have our models in place, it is time to define what we want our application to look like. Thus we need to
specify a template.

```xml
<template>
    <h1>todos</h1>
    <div class="todo-view">
        <header>
            <input type="text" pseudo="x-editor">
        </header>
        <ul bind="
            foreach: tasks
        ">
            <template>
                <li><input type="checkbox" bind="
                    attr: {
                        checked: $item.done ? 'checked' : null
                    },
                    on: {
                        change: $parent.updateCheckedState.bind($parent)
                    }
                "><span bind="text: $item.title"></span></li>
            </template>
        </ul>
        <footer>
            <span bind="text: component.openTasks + ' items left'"></span>
            <div pseudo="x-filter-options"></div>
            <span pseudo="x-clear-completed"></span>
        </footer>
    </div>
</template>
```

**jide.js** relies on the new _template_ tag to define its templates. We could've used a
{@link module:jidejs/ui/control/ListView ListView} to render the tasks but for the sake of this example (and because
of the very narrow scope of this sample project), we'll use simple template bindings to create our task view.
The `pseudo` attributes will make it easier to access these elements within the Skin we'll define later on.

One thing that might look odd is the `$parent.updateCheckedState` reference. When inside a `foreach` binding, the scope
is changed to the iterated item. Accessing the `$parent` variable allows us to reference the original scope again.

When looking at the template above, it becomes clear that our Skin will need a list of tasks that is different from the
one specified by the TodoApp control since we want it to be filtered.

There are certain parts that we'll want to be actual **jide.js** controls to leverage their advanced features. For
example, the list of filters is a perfect fit for the ListView control since we need selection, the editor to insert
new tasks should be a TextField control and the button for clearing the completed tasks can benefit from being a Button.

## The ViewModel

The last missing part for the TodoApp is its Skin, the ViewModel. As we've noticed while preparing the template, there are
a few HTML elements that would benefit from being upgraded to a real Control and we need a filtered list of tasks that
must depend on the users selection for the employed filter.

```js
define([
    'jidejs/base/Observable',
    'jidejs/ui/control/ListView',
    'jidejs/ui/control/TextField',
    'jidejs/ui/control/Button',
    'jidejs/ui/Skin',
    'jidejs/ui/Template',
    'text!view/AppTemplate.html',
    'model/Task'
], function(
    Observable,
    ListView, TextField, Button,
    Skin, Template, AppTemplate,
    Task
) {
    // Utility functions
    function matchAll(task) {
        return true;
    }

    function matchActive(task) {
        return task.done;
    }

    function matchCompleted(task) {
        return !task.done;
    }

    // Now create the Skin
    return Skin.create(Skin, {
        // we want to use a 'div' element if no other element is specified
        defaultElement: 'div',

        // we want to use the AppTemplate as the default template (can be overridden during creation)
        template: Template(AppTemplate),

        /**
         * The selected filter.
         *
         * @type module:jidejs/base/Observable<Function>
         */
        filter: null,

        /**
         * The ListView which offers a set of filters to the user.
         *
         * @type module:jidejs/ui/control/ListView
         */
        filterOptions: null,

        /**
         * The list of tasks that are accepted by the filter.
         *
         * @type module:jidejs/base/ObservableList
         * @see #filter
         */
        tasks: null,

        /**
         * The TextField that can be used to create new tasks.
         *
         * @type module:jidejs/ui/control/TextField
         */
        newTaskEditor: null,

        /**
         * Called during the instantiation of the Skin.
         *
         * Upgrades some pseudo elements to actual jide.js controls.
         */
        upgradePseudos: function() {
            var component = this.component;
            new Button({
                element: this['x-clear-completed'],
                text: Observable.computed(function() {
                    return 'Clear completed ('+(component.tasks.length - component.openTasks)+')';
                }),
                on: {
                    action: this.clearCompleted.bind(this)
                }
            });
            this.filterOptions = new ListView({
                element: this['x-filter-options'],
                items: ['All', 'Active', 'Completed']
            });
            this.newTaskEditor = new TextField({
                element: this['x-editor'],
                on: {
                    action: this.insertNewTask.bind(this)
                }
            });
        },

        /**
         * Overridden to instantiate the filter and tasks properties of the Skin.
         */
        install: function() {
            this.filter = Observable.computed(function() {
                var selectedFilter = this.filterOptions && this.filterOptions.selectionModel.selectedItem || 'All';
                switch(selectedFilter) {
                    case 'All': return matchAll;
                    case 'Active': return matchActive;
                    case 'Completed': return matchCompleted;
                }
            }.bind(this));
            this.tasks = this.component.tasks.filter(this.filter);
            Skin.prototype.install.call(this);
            this.filter.invalidate(); // force reevaluation
        },

        /**
         * Called when the checked state of a task is changed and updates its _done_ property accordingly.
         *
         * @param task The Task model object
         * @param event The checked event of the checkbox.
         */
        updateCheckedState: function(task, event) {
            task.done = event.target.checked;
        },

        /**
         * Removes all completed tasks from the list.
         */
        clearCompleted: function() {
            var tasks = this.component.tasks;
            var completedTasks = tasks.toArray().filter(matchActive);
            for(var i = 0, len = completedTasks.length; i < len; i++) {
                tasks.remove(completedTasks[i]);
            }
        },

        /**
         * Creates a new task and inserts it at the beginning of the task list.
         */
        insertNewTask: function() {
            var task = new Task(this.newTaskEditor.text, false);
            this.component.tasks.insertAt(0, task);
            this.newTaskEditor.text = '';
        }
    });
});
```

Here we once again set the default template (the one we defined previously) and again, it can be overridden during
creation of the control by specifying the `template` option in its `config` parameter.

## Putting it all together

The only thing missing now is the creation of the application itself. Remember that during creation you can specify
a different `template` or `skin` should you need to.

```js
require([
    'model/Task',
    'model/TodoApp'
], function(
    Task, TodoApp
) {
    var app = new TodoApp({
        tasks: [
            new Task('Learn jide.js'),
            new Task('...'),
            new Task('Profit!')
        ]
    });
    document.body.appendChild(app.element);
});
```

Not much to see there, just create the app and supply it with some basic tasks. Now you know how to create custom
controls using **jide.js**.