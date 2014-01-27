---
title: Observable values
template: chapter.html
---

# Observable values

The most important concept in **jide.js** is that of *observable values* and *data binding*. Everything that is
observable can be bound to another observable. By relying on observable values and data binding, you can stop worrying
about the state of your application. If you change your data, your view will update automatically.

## {@link module:jidejs/base/EventEmitter EventEmitter}

At the heart of observable values is our {@link module:jidejs/base/EventEmitter EventEmitter} implementation. An
`EventEmitter` can send arbitrary events to subscribers.

```javascript
// import EventEmitter using AMD syntax
require(['jidejs/base/EventEmitter'], function(EventEmitter) {
    // create a new EventEmitter - usually you'd use it as a mixin
    var app = new EventEmitter();
    // subscribe to the 'change:status' event
    app.on('change:status', function(event) {
        console.log('Status changed to: '+event.status);
    });
    // dispatch the 'change:status' event
    app.emit('change:status', { status: 'Example completed!' });
});
```

## {@link module:jidejs/base/Observable Observable}

The {@link module:jidejs/base/Observable Observable} is an extension of the `EventEmitter` and offers a more specific API
on top of it. With an {@link module:jidejs/base/Observable Observable}, you can store a single value such that, whenever
you change the value, a well defined event is fired.

```javascript
// import Observable using AMD
require(['jidejs/base/Observable'], function(Observable) {
    // create a new observable value that contains the current status of the application
    var status = Observable('Example started');
    // access the observable value
    console.log('Initial status: '+status.get());
    // subscribe to the value
    status.subscribe(function(event) {
        console.log('Status changed to: '+event.value);
    });
    // dispatch the 'change' event
    status.set('Example completed!');
});
```

Setting the value of an `Observable` will fire the `change` event. The `subscribe` method is simply a wrapper around
the `on` method of `EventEmitter` that makes sure that you always register to the `change` event.

### change Event API

The `change` event has a strict API and always contains the following properties:

<dl>
    <dt>oldValue</dt>
    <dd>The value of the `Observable` before it was changed.</dd>
    <dt>value</dt>
    <dd>The current value of the `Observable`.</dd>
    <dt>source</dt>
    <dd>The `Observable` that fired the event.</dd>
</dl>

## {@link module:jidejs/base/Observable.computed Observable.computed}

Often the value of an `Observable` is the result of some calculation that depends on other observable values. **jide.js**
supports this scenario with the {@link module:jidejs/base/Observable.computed Observable.computed} method.

```javascript
// import Observable using Browserify syntax
var Observable = require('jide/base/Observable');
// create a computed observable that depends on the "value" observable we created before
var htmlStatus = Observable.computed(function() {
    return '<div>'+value.get()+'</div>';
});
// subscribe to it
htmlStatus.subscribe(function() {
    document.body.appendChild(htmlStatus.get());
});
```

Now, if you were to change the value of `status`, you'd see a new `div` element displayed in your browser.

<div class="alert">
    **Warning:** Observable.computed is lazy by default, no event is passed to subscribers!
</div>

The `computed` function also accepts an object instead of a function which allows for more precise configuration:

```javascript
// import Observable using Browserify syntax
var Observable = require('jide/base/Observable');
var firstName = Observable('Patrick'),
    lastName = Observable('Gotthardt');
// create a computed observable
var fullName = Observable.computed({
    // By setting lazy to false, we can force the observable to generate a real change event
    // the default value is true.
    lazy: false,
    // This function is used to compute the value of the observable.
    // You must supply this function.
    read: function() {
        return firstName.get() + ' ' + lastName.get();
    },
    // This function is used to set the value of the observable,
    // if it isn't specified, setting the value of a computed observable will
    // throw an error
    write: function(value) {
        var name = value.split(' ');
        firstName.set(name[0]);
        lastName.set(name[1]);
    }
});
// subscribe to it
fullName.subscribe(function(event) {
    console.log(event.value);
});
```

Now, if you were to change either `firstName`, `lastName` or `fullName`, the console would show the new calculated name.

## {@link module:jidejs/base/ObservableProperty ObservableProperty}

Often you'll want to create an object that consists of multiple observable values. Using
{@link module:jidejs/base/ObservableProperty ObservableProperty}, you can create such an object.

```javascript
// import ObservableProperty using Browserify syntax
var ObservableProperty = require('jide/base/ObservableProperty');

// create a constructor for your class
function Person(firstName, lastName) {
    // initialize its observable properties
    installer(this);

    // add a DependencyProperty
    this.fullNameProperty = new DependencyProperty(this, 'fullName', function() {
        // this function is executed in the context of the Person instance
        return this.firstName+' '+this.lastName();
    });

    // apply constructor parameters
    this.firstName = firstName;
    this.lastName = lastName;
}
// add a method to the person
Person.prototype.sayHello = function() {
    console.log('Hello, my name is '+this.fullName);
};
// make the shortcut 'fullName' available
Object.defineProperty(Person.prototype, 'fullName', {
    get: function() {
        return this.fullNameProperty.get();
    },

    set: function(value) {
        this.fullNameProperty.set(value);
    }
});
// install the properties
var installer = ObservableProperty.install(Person, 'firstName', 'lastName');
```

While the above example looks fairly unattractive it's also relying on pure Javascript without any class framework.
If you were to use [jidejs-extra]{https://github.com/pago/jidejs-extra), you could write it like this:

```javascript
require(['jidejs-extra/Class'], function(Class) {
    var Property = Class.Property,
        DependencyProperty = Class.DependencyProperty;

    var Person = Class({
        $init: function(firstName, lastName) {
            // the Person constructor
            this.firstName = firstName;
            this.lastName = lastName;
        },

        firstName: Property,
        lastName: Property,
        fullName: DependencyProperty(function() {
            return this.firstName+' '+this.lastName;
        }),

        sayHello: function() {
            console.log('Hello, my name is '+this.fullName);
        }
    });
});

That looks a lot cleaner already. **jide.js** doesn't enforce usage of a specific class framework so you're free to
use what you want.

Now that you have defined your `Person` class, let's use it:

```javascript
var john = new Person('John', 'Doe');
// a class with observable properties always uses EventEmitter as a mixin
// thus we can use the EventEmitter API here
john.on('change:fullName', function() {
    john.sayHello();
});
// or we can subscribe directly to a property
john.firstNameProperty.subscribe(function(event) {
    console.log('First name changed from '+event.oldValue+' to '+event.value);
});
john.firstName = 'Joseph';
// prints the following in the console
// Hello, my name is Joseph Doe
// First name changed from John to Joseph
```

## {@link module:jidejs/base/ObservableList ObservableList}

The {@link module:jidejs/base/ObservableList ObservableList} is another corner stone of **jide.js** and act as an
observable array that fires a `change` event whenever an item is added, removed or replaced.

```javascript
// import ObservableList using Browserify syntax
var ObservableList = require('jide/base/ObservableList');

// create a new observable list
var items = new ObservableList();

// subscribe to changes
items.on('change', function(event) {
    // event contains many changes if possible
    var changes = event.enumerator();
    // iterate over all changes
    while(changes.moveNext()) {
        // get the current change
        var change = changes.current;
        // act based on its type
        if(change.isUpdate) {
            console.log('Update ('+change.index+'): '+change.oldValue+' -> '+change.newValue);
        } else if(change.isInsert) {
            console.log('Insert ('+change.index+'): '+change.newValue);
        } else if(change.isDelete) {
            console.log('Delete ('+change.index+'): '+change.newValue);
        }
    }
});

// add an item
items.add('test');
// $> Insert (0): test

// remove an item
items.remove('test');
// $> Delete (0): test
```

{@link module:jidejs/base/ObservableList ObservableList} inherits from {@link module:jidejs/base/Collection Collection}
and offers many useful methods such as `filter`, `map` and `sort` that provide live updating collections based on your
original list.

## Data Binding

Observable values themselves are pretty nice to have on their own, however, they unleash their full potential if you add
data binding to them.

Data binding allows you to keep two observable values in sync or to push changes to one of them to another. We'll use a
simplified example to introduce the data binding API. You'll start to use them soon, when you learn how to use
**jide.js** controls.

### One way

A one way binding can be used to update the value of an observable when another observable changes but not the other way
around.

```javascript
// import Observable using AMD syntax
require(['jidejs/base/Observable'], function(Observable) {
    // create some observables
    var a = Observable(),
        b = Observable();
    // bind the value of b to a so that a is updated whenever b is updated
    a.bind(b);
    b.set(5);
    console.log(a.get()); // $> 5

    // the binding is one way only
    a.set(10);
    console.log(b.get()); // $> 5
});
```

### Bidirectional

A bidirectional binding can be used to keep the values of two observables in sync. If one of them changes the other one
changes, too.

```javascript
// import Observable using AMD syntax
require(['jidejs/base/Observable'], function(Observable) {
    // create some observables
    var a = Observable(),
        b = Observable();
    // bind the value of b to a so that a is updated whenever b is updated
    a.bindBidirectional(b);
    b.set(5);
    console.log(a.get()); // $> 5

    // the binding is bidirectional
    a.set(10);
    console.log(b.get()); // $> 10
});
```