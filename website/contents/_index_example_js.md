---
title: JS part of the index example
view: none
----

```javascript
require([
    'jidejs/base/Class',
    'jidejs/base/ObservableList',
    'jidejs/ui/Control',
    'jidejs/ui/Skin',
    'blog/fetch'
], function(Class, ObservableList, Control, Skin, fetch) {
    var data = new ObservableList();
    // define our Blog control
    function Blog(config) {
        Control.call(this, config || {});
    }
    Class(Blog).extends(Control);

    // and initialize it
    new Blog({
        element: document.getElementById('recent_blog_posts'),
        posts: data
    });
    fetch(data);
});
```