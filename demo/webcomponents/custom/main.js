//region configure requirejs to load jide.js library
require.config({
    "packages": [{
        name: 'jidejs',
        location: '../../../jidejs'
    }],
    paths: {
        text: '../../../components/requirejs-text/text'
    }
});
//endregion

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