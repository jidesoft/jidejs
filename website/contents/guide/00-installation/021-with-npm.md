---
title: With npm & Browserify
template: chapter.html
---

# What are npm and Browserify?

[npm](http://www.npmjs.org) is the standard dependency management tool for [node.js](http://nodejs.org) that helps you
to install and update your dependencies. Using npm, you can specify what dependencies you need and which
version, or version range, is required for your application. [Browserify](http://browserify.org) is a tool that can be
used to build a bundle from npm dependencies in a way that works in the browser.

# Installing jide.js with npm

Installing **jide.js** with npm is very easy. Just use the command line to navigate to the directory where you want
to create your project and issue the following commands:

```
npm init
npm install jide --save
```

The `npm init` command will create a `package.json` for you. If you've already created that file, you don't need to
run that command.

# Installing Browserify and the required transforms

Once you've installed **jide.js**, you'll want to install Browserify and the transforms you'll need to use **jide.js**.

```
npm install -g browserify
npm install browserify-jide-template --save-dev
npm install deamdify --save-dev
```

# Creating your application

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
    <link rel="stylesheet" href="./node_modules/jidejs/style/default.css">
    <script src="app/main.bundle.js"></script>
</head>
<body>
</body>
</html>
```

Now create an `app/main.js` file:

```javascript
var Button = require('jide/ui/control/Button');

document.body.appendChild(new Button({
    text: 'Click me',
    on: {
        action: function() {
            alert('Thank you for clicking the button!');
        }
    }
}).element);
```

<div class="alert">
    **Notice:** When using **jide.js** with npm and Browserify, you'll need to use the _jide/_ namespace instead
    of the _jidejs/_ namespace you'd use when working with `require.js`.
</div>

# Creating the Bundle

Browserify requires you to create a bundle every time you changed your application. The
[Yeoman Generator]{/guide/00-installation/03-with-yeoman.html) will help you to create a build script that takes care
of this for you but in the meantime, you can try to run this command:

```
browserify -t 'browserify-jide-template,deamdify' app/main.js -o app/main.bundle.js
```

Now, when you open the `index.html` file in your browser, you can view your application and click
the button to get a thank you note.