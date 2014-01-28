---
title: The TodoApp Control
template: chapter.html
---

# The TodoApp Control

We'll want to create a custom control to represent our Todo application. Create a file called `app/TodoApp.js`
and use the following content for it.

```javascript
define([
    'jidejs/base/Class',
    'jidejs/base/DependencyProperty',
    'jidejs/base/ObservableList',
    'jidejs/ui/Control',
    'viewmodel/TodoAppSkin' // we'll create that file soon
], function(
    Class, DependencyProperty, ObservableList, Control, TodoAppSkin
) {
    // useful utility function
    function matchOpen(task) {
        return !task.done;
    }

    // The TodoApp constructor
    function TodoApp(config) {
        // make sure that we have a config object
        config || (config = {});
        // create the tasks list, use the tasks provided with the config or create an empty list for them
        this.tasks = ObservableList(config.tasks || []);
        // remove tasks from config so that it is not reassigned when forwarding its creation to Control
        delete config.tasks;

        // create a DependencyProperty for the number of open tasks
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