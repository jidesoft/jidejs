---
title: Installation with Bower
template: chapter.html
---

# What is Bower?

[Bower](http://www.bower.io) is a dependency management tool from Twitter that helps you to install and update your
frontend dependencies. Using bower, you can specify what dependencies you need and which version, or version range,
is required for your application.

To install **jide.js** with bower, you first need to install Bower (using npm, using node.js):

```
npm install -g bower
```

# Installing jide.js with Bower

Bower allows you to install your dependencies in two ways. You can either use the command line to install **jide.js** or you
can create a `bower.json` file at the top of your project and specify **jide.js** in this file as your dependency.

## Installation via the command line

Installing **jide.js**
from the command line is very easy. Just use the command line to navigate to the directory where you want to create your
project and issue the following command:

```
bower install jidejs
```

This will create a directory named `bower_components` within your working directory. The `bower_components` directory
will contain the dependencies required for using **jide.js**, i.e. **jide.js** itself as well as
[require.js](http://www.requirejs.org).

## Installation via `bower.json`

At the root of your project, create a file called `bower.json` and specify **jide.js** as your dependency.

```javascript
{
    name: "myapp",
    version: "0.0.0",
    private: true,
    dependencies: {
        jidejs: "~1.0.0-beta2",
        requirejs: "~2.1.6",
        requirejs-text: "~2.0.6"
    }
}
```

Now, when you execute the following command on your command line:

```
bower install
```

Bower will install **jide.js** as well as [require.js](http://www.requirejs.org) and the `text` plugin for require.js.

## Creating your application

Now that you have installed all required dependencies for your application, you can start to create your application.
To keep the scope of this documentation small, we'll create a very simple application. The
[Yeoman Quickstart]{/guide/00-installation/03-with-yeoman.html) will create a larger sample application and comes with
a preview server and several other useful tools.

Create an index.html file at your project root, and insert something along the lines of:

```xml
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>MyApp</title>
    <link rel="stylesheet" href="/bower_components/jidejs/style/default.css">
    <script src="/bower_components/requirejs/require.js" data-main="app/main.js"></script>
</head>
<body>
</body>
</html>
```

Now, as you might have guessed from the above example, create the `app/main.js` file:

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

require([
  'jidejs/ui/control/Button'
], function(Button) {
  document.body.appendChild(new Button({
    text: 'Click me',
    on: {
        action: function() {
            alert('Thank you for clicking the button!');
        }
    }
  }).element);
});
```

Now, when you start a server so that your fresh app is at its document root, you can view your application and click
the button to get a thank you note.