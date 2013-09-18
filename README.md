jide.js
=======

**jide.js** is an **open source**, MIT licensed, **Javascript** toolkit for developing rich, modern web applications. It features various
powerful UI controls.

It is built around the concept of properties and data binding and enables highly efficient programming.

**jide.js** uses the AMD format and can be used with any AMD compatible loader such as [require.js](http://www.requirejs.org).

Getting started
===============

Installation
------------

Since **jide.js** uses the AMD format, you must start by including an AMD loader in your HTML file. Since there
are a lot of choices we can only handle the most obvious one: [require.js](http://www.requirejs.org).

For the purpose of this tutorial, we assume that your project has the following directory layout:

* /index.html
* /app.js (your application)
* /jidejs (copied from your **jide.js** download or checkout)
* /require.js

Now place the following content in your `index.html` file:

```html
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="./jidejs/default.css">
</head>
<body>
<!-- your HTML content, nothing for now -->
<script src="./require.js" data-main="app.js"></script>
</body>
</html>
```

This is a minimal HTML file that loads `require.js` as well as the *default* **jide.js** theme and
your application.

Now create your `app.js` and place something along the following lines in it:

```js
// and start your application
require([
'jidejs/ui/control/Button'
], function(Button) {
// use strict mode, or not - up to you
"use strict";
// create a new Button
var myButton = new Button({
text: 'Say hello!',
on: {
    click: function() {
        alert("Hello World, I'm a jide.js programmer now!");
    }
}
});
// add the Button to the DOM
document.body.appendChild(myButton.element);
});
```

**Congratulations!** You've successfully created your first fully functional **jide.js** application!

What next?
----------

**jide.js** comes bundled with plenty of documentation that you can directly access from this page.

* [Guide](http://jidejs.jidesoft.com/guide/index.html)
  The Guide provides a structured introduction to **jide.js** for those who prefer to read.
* [Examples](http://jidejs.jidesoft.com/examples/index.html)
  The Examples provide an interactive way to learn **jide.js** in case you'd like to explore and test it before
  starting to read the detailed guide or diving into the API documentation.
* [API](http://jidejs.jidesoft.com/api/index.html)
  If you need to explore the API of a class or method in detail, the API documentation is the best way to do so.