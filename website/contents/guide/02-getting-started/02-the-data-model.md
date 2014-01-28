---
title: The Data Model
template: chapter.html
---

# The Data Model

## Task

Our Todo application needs a data model that represents a Todo item, let's
call it Task. We need nothing fancy here, a title and a done state will be sufficient for the purpose of this example.
Thus, our first lines of code will define the Task model (file `app/model/Task.js`):

```javascript
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