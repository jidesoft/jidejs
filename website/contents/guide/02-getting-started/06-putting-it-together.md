---
title: Putting it all together
template: chapter.html
---

# Putting it all together

The only thing missing now is the creation of the application itself. Modify the `app/main.js` file to look like this:

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
    'model/Task',
    './TodoApp'
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

If you take a look at your browser, you should see your application. You'll probably want to add some CSS rules to
`style/app.less` to make the app look better.

Once you're done, you can compile your app for distribution by running

```
grunt build
```

You can find the optimized app in the `build` directory of your project.