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