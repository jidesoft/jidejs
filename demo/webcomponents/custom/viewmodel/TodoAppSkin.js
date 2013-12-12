define([
    'jidejs/base/Observable',
    'jidejs/ui/control/ListView',
    'jidejs/ui/control/TextField',
    'jidejs/ui/control/Button',
    'jidejs/ui/Skin',
    'jidejs/ui/Template',
    'jidejs/ui/Orientation',
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
                items: ['All', 'Active', 'Completed'],
                orientation: Orientation.HORIZONTAL
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