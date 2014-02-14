---
title: Modules
template: chapter.html
---

# Modules

When using **jide.js**, you'll notice that almost everything is a module of its own. If you're not that familiar
with words like _AMD_ or _Browserify_ and have no experience with _node.js_, you'll probably feel a bit overwhelmed by
their use throughout the **jide.js** documentation. This guide intends to help you understand those tools.

## What are modules?

In **jide.js** a module is often a control or class that you'll want to use in your own code. Each modules has its own
file. When you create your application, the concept of modules helps you to use only those parts of **jide.js** that you
need. If you don't intend to use the layouts provided by **jide.js**, there is no need for your users to download those
extra KB.

If you come from _jQuery_ or similar frameworks, you'll notice that this is similar to using _jQuery_ plugins, where your
application includes the core _jQuery_ framework and all plugins you need.

## What is a module loader?

The downside to using separate files for modules usually is that you need to manually include them as `script` elements
in your HTML. With a project such as **jide.js**, which consists of so many tiny modules that depend on other
modules, that'd not be productive. Worse yet, it'd be highly error prone. What if you missed an include or used an
incorrect order? You're application would blow up! We don't want that.

That's why we use a module loader. The module loader is responsible for giving you the modules you want and to make sure
that these modules get all their dependencies, too.

Currently, there are three dominant choices for loading modules in this manner:

<ul>
    <li>Build your own and force everyone to recreate his code so that its compatible</li>
    <li>AMD</li>
    <li>Browserify</li>
</ul>

Unlike other projects, we have decided that we want to be compatible with the rest of the world and that we do not
want to reinvent the wheel. That's why we haven't build our own module loader and instead opted to support the existing
ones. Once native Javascript modules become a reality, we will also support those. For now, you can use jide.js with any
AMD compatible module loader and with Browserify.

AMD, unlike Browserify, isn't a tool. It's more like a standard way to define modules. There are many implementations of
AMD loaders, such as [require.js](http://www.requirejs.org). [Browserify](http://browserify.org), on the other hand, is
a tool to transform module files into a single file that contains all of your code.

## Understanding AMD

The AMD standard is based on two innocently looking functions that you will use in your code: `define` and `require`.
With AMD, you need to wrap your own modules in a `define` call and start your application in a `require` call. Let's take
a look at that:

```javascript
// in your main.js file
require(['jidejs/ui/control/Button', 'app/mylib'], function(Button, mylib) {
    // inside of this function you can use the Button constructor to create a new button for your application
});

// in your app/mylib.js file
define(['jidejs/base/Observable'], function(Observable) {
    var mylib = {
        createCoolObservable: function() {
            return new Observable('cool');
        }
    };

    return mylib;
});
```

The `require` expects two parameters: An array of dependencies (defined as Strings) and a function that is invoked
with all of those dependencies in the order in which they were defined. For the purpose of this introduction, you can
assume that `define` has the same signature and expects you to return an object or function that will be passed
to other modules that need it.
`require` and `define` will load the dependencies you specified asynchronously from your server. Since there are many
implementations of AMD, there are many ways to configure how exactly it will resolve those dependencies. In this guide,
we focus mostly on the [require.js](http://www.requirejs.org) implementation of AMD, so let's take a look at how to
configure it for usage with **jide.js**.

```javascript
// this should be placed before your require() call
require.config({
    // path to your script files
   "baseUrl": '.',

   "packages": [{
       // configure a package to let require.js know where to find modules that start with 'jidejs':
       name: 'jidejs',
       location: './bower_components/jidejs'
   }, {
       // and also let it know where to find modules that start with 'app'
       name: 'app',
       location: './app'
   }],
   // and tell it where to find the 'text' plugin (needs to be downloaded in addition to require.js
   paths: {
       text: './bower_components/requirejs-text/text'
   }
});
```

The easiest way to get started with **jide.js** and AMD is to use the
[Yeoman Quickstart Guide](../00-installation/03-with-yeoman.html) which takes care of installing all of the required
dependencies, configures require.js for you and provides the tools to create an optimized build of your application.

## Understanding Browserify

Browserify, unlike AMD, is not a standard for defining modules. Instead, it's a tool that allows you to transform and
bundle your script files into a single application file. You can do the same with AMD (using the require.js optimizer)
but Browserify is a valid and good option in a few cases.

When using Browserify, there is no way around including a build step, even while developing your application. On the
other hand, you gain really easy access to most [npm](http://npmjs.org) modules and, perhaps even better, you can share
your code between your Web Application and your Node.js Server implementation.

If you intend to use Browserify, you should be familiar with build tools like [Grunt](http://gruntjs.org) or
[Gulp](http://gulpjs.org) or something else. The [With npm & Browserify Guide](../00-installation/021-with-npm.html)
explains how to setup and use **jide.js** with Browserify.

When you install a package, such as **jide.js**, using _npm_, it will be placed in the *node_modules* directory of your
project. Let's say you did install **jide.js** using _npm_, then you could easily access it in your code with the
`require` function that is provided by Browserify for you. Unlike AMD, there is no `define` function. Instead, you can
specify which parts of your file you want to export as a module by assigning them to the `exports` object.
If you intend to export a constructor function, you would probably want to assign it to `module.exports` instead.

Let's take a look at what this might look like:

```javascript
// in your main.js file
var Button = require('jide/ui/control/Button'),
    mylib = require('./app/mylib');

// For the rest of this file, you have access to the Button constructor and mylib.
```

```javascript
// in your app/mylib.js file
var Observable = require('jide/base/Observable');

var mylib = {
    createCoolObservable: function() {
        return new Observable('cool');
    }
};

module.exports = mylib;
```

Unlike AMD, Browserify provides a synchronous `require` function, so you don't need to wrap your code in a callback
function. As far as **jide.js** is concerned, the most important difference is the name of the modules. When you
use **jide.js** with Browserify, every **jide.js** module starts with **jide**, not **jidejs**, so the module
`jidejs/ui/control/Button` becomes `jide/ui/control/Button`.