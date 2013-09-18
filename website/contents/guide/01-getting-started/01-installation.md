---
title: Installation
template: chapter.html
---

# Installing jide.js

Since **jide.js** uses the AMD format, you must start by including an AMD loader in your HTML file. There
are a lot of options for AMD loaders but we will focus on the quasi standard: [require.js](http://www.requirejs.org).

For the purpose of this tutorial, we assume that your project has the following directory layout:

* /index.html
* /app.js (your application)
* /jidejs (copied from your **jide.js** download or checkout)
* /require.js

Now place the following content in your `index.html` file:

```xml
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

```javascript
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