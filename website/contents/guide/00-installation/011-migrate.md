---
title: Migrating from a previous version
template: chapter.html
---

# Migration from *1.0.0-beta2* to *1.0.0-beta3*

jide.js *1.0.0-beta3* introduces one incompatible change for users of the Bower or Yeoman installation.
We have dropped the inner `jidejs` directory in order to provide better compatibility with Browserify.

Locate the following part of your code (you might have modified it):

```javascript
//region configure requirejs to load jide.js library
require.config({
    "packages": [{
        name: 'jidejs',
        location: '/bower_components/jidejs/jidejs'
    }],
    paths: {
        text: '/bower_components/requirejs-text/text'
    }
});
//endregion
```

And change it to drop the inner `jidejs` directory like this:

```javascript
//region configure requirejs to load jide.js library
require.config({
    "packages": [{
        name: 'jidejs',
        location: '/bower_components/jidejs'
    }],
    paths: {
        text: '/bower_components/requirejs-text/text'
    }
});
//endregion
```