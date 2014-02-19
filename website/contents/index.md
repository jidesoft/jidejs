---
title: Index
template: index.html
---

<div class="row-fluid">
    <article class="span8">
        <h2>jide.js &mdash; Version 1.0.0-beta3</h2>

        <p>**jide.js** is an **open source**, MIT licensed, **Javascript** toolkit for developing rich, modern web applications.
        It features various powerful UI controls and is built around the concept of properties and data binding and enables
        highly efficient programming.</p>
        <p>**jide.js** uses the AMD format and can be used with any AMD compatible loader such as [require.js](http://www.requirejs.org)
        but also supports [Browserify](http://browserify.org). Don't worry if you don't know what that means, we've prepared
        a [short introduction](/guide/01-core-concepts/00-modules.md) for you.</p>
        <p><b>jide.js</b> is currently in beta state. This means that it is neither feature complete nor without bugs and
        that its APIs can change when necessary.</p>
    </article>
    <article class="span4">
        <h2>Free and OpenSource</h2>

        <p><b>jide.js</b> has been released under terms of the OpenSource MIT license. It can be used in personal
        and commercial projects for free.</p>

        <p><a class="btn span6" href="http://github.com/jidesoft/jidejs">Get the Source Code</a><a class="btn span6" href="/downloads/jidejs-1.0.0-beta3.zip">Download 1.0.0-beta3</a></p>

        <p>Or install via Bower <code>bower install jidejs</code>.</p>
    </article>
</div>
<div class="row-fluid">
<div class="span12">
<h2>Observable variables and data binding</h2>
</div>
<div class="span4">

```javascript
require([
    'jidejs/base/Observable',
    'jidejs/ui/layout/VBox', 'jidejs/ui/control/TextField', 'jidejs/ui/control/Label'
], function(Observable, VBox, TextField, Label) {
    var name;
    new VBox({
        element: document.getElementById('front_page_example'),
        spacing: '4px 0',
        children: [
            name = new TextField({ promptText: 'Please enter your name.' }),
            new Label({
                text: Observable.computed(function() {
                    return 'Hello, my name is '+
                        (name.text || '')+
                        ' and I am exploring <b>jide.js</b>!';
                })
            })
        ]
    });
});
```

</div>
<div class="span4">

</div>

<div class="span4">
<div id="front_page_example" class="output"></div>

<script>
require([
    'jidejs/base/Observable',
    'jidejs/ui/layout/VBox', 'jidejs/ui/control/TextField', 'jidejs/ui/control/Label'
], function(Observable, VBox, TextField, Label) {
    var name;
    new VBox({
        element: document.getElementById('front_page_example'),
        spacing: '4px 0',
        children: [
            name = new TextField({ promptText: 'Please enter your name.' }),
            new Label({
                text: Observable.computed(function() {
                    return 'Hello, my name is '+
                            (name.text || '')+
                            ' and I am exploring <b>jide.js</b>!';
                })
            })
        ]
    });
});
</script>

</div>
</div>

<div class="row-fluid">
    <article class="span8">
        <h2>Developed by experts</h2>

        <p>JIDE Software is a leading provider of professional components for *Swing* and *JavaFX* and has years of experience in solving
        the needs of large businesses and startups. **jide.js** has been created by those same experts that have been trusted by
        thousands of clients with their mission critial applications. It leverages all the experience to produce a development
        experience that is nothing short of astonishing. Develop applications with ease by binding your data to your view. Separate
        your data model from your view logic, write modular applications by leveraging the power of *AMD*.</p>

        <h2>Professional Support available</h2>
        <p>While **jide.js** is an OpenSource project, we understand the need for professional and fast support, thus
        you can buy professional support for **jide.js** directly from <a href="http://www.jidesoft.com/store/index.php?cPath=38">JIDE Software</a>.</p>
    </article>
    <aside class="span4">
        <h2>Cross Browser Support</h2>

        <p><b>jide.js</b> works across all modern browsers.  It has been designed to be the future of web development and makes a
        clean break with older browsers such as IE8 and earlier to enable you to develop for the web as it is now and not as it
        was years ago.</p>

        <ul class="checkbox-list">
            <li><i class="icon-ok"></i> Internet Explorer 9+</li>
            <li><i class="icon-ok"></i> Chrome</li>
            <li><i class="icon-ok"></i> Firefox</li>
            <li><i class="icon-ok"></i> Safari</li>
            <li><i class="icon-ok"></i> Android</li>
            <li><i class="icon-ok"></i> iOS</li>
        </ul>
    </aside>
</div>

<div class="row-fluid">
    <h2>What next?</h2>

    <p>**jide.js** comes bundled with plenty of documentation that you can directly access from this page.</p>

    <dl>
        <dt><a href="/guide/index.html">Guide</a></dt>
        <dd>The Guide provides a structured introduction to <b>jide.js</b> for those who prefer to read.</dd>
        <dt><a href="/examples/index.html">Examples</a></dt>
        <dd>The Examples provide an interactive way to learn <b>jide.js</b> in case you'd like to explore and test it before
            starting to read the detailed guide or diving into the API documentation.</dd>
        <dt><a href="/api/index.html">API</a></dt>
        <dd>If you need to explore the API of a class or method in detail, the API documentation is the best way to do so.</dd>
        <dt><a href="http://www.jidesoft.com/forum/viewforum.php?f=34">Support Forum</a></dt>
        <dd>Visit our support forum if you need any help or have any questions. For those who paid for the profressional support,
        you can use <a href="http://www.jidesoft.com/forum/viewforum.php?f=37">this link</a> to access to the customer only forum.
        If you don't have access, please email your user id to support@jidesoft.com</dd>
    </dl>
</div>