---
title: The Skin
template: chapter.html
---

# The Skin

The last missing part for the TodoApp is its Skin. As we've noticed while preparing the template, there are
a few HTML elements that would benefit from being upgraded to a real Control and we need a filtered list of tasks that
must depend on the users selection for the employed filter.

```javascript
define([
    'jidejs/base/Observable',
    'jidejs/base/Collection',
    'jidejs/ui/control/ListView',
    'jidejs/ui/control/TextField',
    'jidejs/ui/control/Button',
    'jidejs/ui/control/SingleSelectionModel',
    'jidejs/ui/Skin',
    'jidejs/ui/Template',
    'jidejs/ui/Orientation',
    'text!view/AppTemplate.html',
    'model/Task'
], function(
    Observable, Collection,
    ListView, TextField, Button, SingleSelectionModel,
    Skin, Template, Orientation, AppTemplate,
    Task
) {
    // we import ListView, TextField and Button to allow the optimizer to include them
    // in the bundle. They're used in the template.

    // Utility functions
    function matchAll(task) {
        return true;
    }

    function matchActive(task) {
        return !task.done;
    }

    function matchCompleted(task) {
        return task.done;
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

        availableFilters: Collection.fromArray(['All', 'Active', 'Completed']),

        /**
         * Overridden to instantiate the filter and tasks properties of the Skin.
         */
        install: function() {
            this.filterOptionsSelectionModel = new SingleSelectionModel(this.availableFilters, true);
            this.filter = Observable.computed(function() {
                var selectedFilter = this.filterOptionsSelectionModel.selectedItem || 'All';
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
            var completedTasks = tasks.toArray().filter(matchCompleted);
            for(var i = 0, len = completedTasks.length; i < len; i++) {
                tasks.remove(completedTasks[i]);
            }
        },

        /**
         * Creates a new task and inserts it at the beginning of the task list.
         */
        insertNewTask: function() {
            this.queryComponent('x-editor').then(function(taskEditor) {
                var task = new Task(taskEditor.text, false);
                this.component.tasks.insertAt(0, task);
                taskEditor.text = '';
            }.bind(this));
        }
    });
});
```

Here we once again set the default template (the one we defined previously) and again, it can be overridden during
creation of the control by specifying the `template` option in its `config` parameter.