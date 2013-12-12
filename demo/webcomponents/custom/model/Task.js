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