---
title: jidejs/base
template: chapter.html
---
# jidejs/base Introduction

This tutorial is intended to help you understand how to use the jidejs/base module and the classes it defines.
You will learn how to create classes, add observable properties to them and create data bindings between them.

## Defining classes

jide.js doesn't require the use of a class framework and only comes with a small utility package ({@link module:jidejs/base/Class})
to assist you in defining classes. You can use any framework you want or rely on native Javascript capabilities instead.

Basic example:

```javascript
define('demo/Person', ['jidejs/base/Class'], function(Class) {
    // create a standard constructor function
    function Person(firstName, lastName, salary, gender) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.salary = salary;
        this.gender = gender;
    }
    // configure it using jidejs/base/Class
    Class(Person).def({ // define the prototype of the constructor
        get fullName() { // create a read-only property
            return this.firstName + ' ' + this.lastName;
        }
    });
    return Person;
});
```

You can also define inheritance schemes using {@link module:jidejs/base/Class}.

```javascript
define('demo/Manager', ['jidejs/base/Class', 'demo/Person'], function(Class, Person) {
    function Manager(firstName, lastName, salary, gender, employees) {
        // invoke parent constructor
        Person.call(this, firstName, lastName, salary, gender);
        this.employees = employees;
    }
    // configure class
    Class(Manager)
        .extends(Person) // Manager inherits from Person
        .def({
            hireEmployee: function(employee) {
                this.employees.push(employee);
            },
            fireEmployee: function(employee) {
                this.employees.splice(this.employees.indexOf(employee), 1);
            }
        });
});
```

Sometimes it is useful to make members of one object available to another but the inheritance chain is already set up
and using the _extends_ method is not possible. jide.js allows this type of inheritance under the name *mixin*. One of
its most often used Mixins is {@link module:jidejs/base/EventEmitter}.

In the example below, we modify the _Manager_ class to be an EventEmitter as well.

```javascript
define('demo/Manager', [
    'jidejs/base/Class', 'jidejs/base/EventEmitter', 'demo/Person'
], function(Class, Observable, Person) {
    function Manager(firstName, lastName, salary, gender, employees) {
        // invoke parent constructor
        Person.call(this, firstName, lastName, salary, gender);
        EventEmitter.call(this); // make this object an EventEmitter
        this.employees = employees;
    }
    // configure class
    Class(Manager)
        .extends(Person) // Manager inherits from Person
        .mixin(EventEmitter) // mixin methods and fields from EventEmitter
        .def({
            hireEmployee: function(employee) {
                this.employees.push(employee);
                this.emit('hired', employee); // invoke a method from EventEmitter
            },
            fireEmployee: function(employee) {
                this.employees.splice(this.employees.indexOf(employee), 1);
                this.emit('fired', employee);
            }
        });
});
```

Some Mixins will require to call their constructor to set up their internal properties while others will require certain
methods to be implemented.

Note that it is not possible to test whether an object is an instance of such a mixin.

## Properties

Perhaps the most important concept of jide.js is that of properties and data binding. Both significantly simplify the
development of applications.

A {@link module:jidejs/base/Property} is an observable data field of an object. Its value can either be specified manually
({@link module:jidejs/base/ObservableProperty}) or it can be calculated based on other properties
({@link module:jidejs/base/DependencyProperty}).

The {@link module:jidejs/base/ObservableProperty} class can automatically add EcmaScript 5 compatible get and set methods
that rely on the observable property as a backing field for easier, more natural, assignment and retrieval of the properties
data.

In the example below, we modify the previously defined Person class to use properties instead of simple fields.

```javascript
define('demo/Person', [
    'jidejs/base/Class', 'jidejs/base/ObservableProperty', 'jidejs/base/DependencyProperty'
], function(Class, ObservableProperty, DependencyProperty) {
    // create a standard constructor function
    function Person(firstName, lastName, salary, gender) {
        installer(this);
        this.firstName = firstName;
        this.lastName = lastName;
        this.salary = salary;
        this.gender = gender;
        // we can replace the old manually written 'get fullName()' accessor with a DependencyProperty
        this.fullNameProperty = new DependencyProperty(this, 'fullName', function() {
            // calculate the value of the property, invoked whenever one of the
            // bound properties is modified and its value is requested.
            return this.firstName + ' ' + this.lastName;
        });
    }
    // configure it using jidejs/base/Class
    Class(Person).def({ // define the prototype of the constructor
        get fullName() { // create a read-only property
            return this.fullNameProperty.get(); // retrieve the value of the fullNameProperty.
        }
    });
    var installer = ObservableProperty.install(Person, 'firstName', 'lastName', 'salary', 'gender');
    return Person;
});
```

The advantage of defining the _fullName_ field as a property is that it allows users of the class to listen to changes
of both names with one listener and is highly useful for data binding.

To listen to changes to a property, we only need to add a listener to it:

```javascript
myPerson.salaryProperty.subscribe(function(newSalary, evt) {
    console.log('The salary of ' + myPerson.fullName + ' was changed from $' + evt.oldValue + ' to $' + newSalary);
});
```

## Standard property modification methods

There is an even simpler way to define the previously shown _fullNameProperty_ that can be used:

```javascript
this.fullNameProperty = this.firstNameProperty.concat(' ', this.lastNameProperty);
```

This implementation relies on the {@link module:jidejs/base/Property~concat} method to create a new
{@link module:jidejs/base/DependencyProperty} that concatenates the given properties and places a whitespace between them.

{@link module:jidejs/base/Property} defines many of these highly useful methods. It is encouraged to look at
the documentation to learn about the other ways to create modified observable properties.

## Using ObservableList
{@link module:jidejs/base/ObservableList} is intended to be used as a replacement for Javascript arrays whenever an
observable collection of items is needed.

In the example below, we modify the _Manager_ class to use an {@link module:jidejs/base/ObservableList} to store its
employees instead of a standard array.

```javascript
define('demo/Manager', [
    'jidejs/base/Class', 'jidejs/base/EventEmitter', 'jidejs/base/ObservableList', 'demo/Person'
], function(Class, EventEmitter, ObservableList, Person) {
    function Manager(firstName, lastName, salary, gender, employees) {
        // invoke parent constructor
        Person.call(this, firstName, lastName, salary, gender);
        // make this object an EventEmitter
        EventEmitter.call(this);
        // cast an array to ObservableList or return the given ObservableList
        this.employees = ObservableList(employees);
    }
    // configure class
    Class(Manager)
        .extends(Person) // Manager inherits from Person
        .mixin(EventEmitter) // mixin methods and fields from EventEmitter
        .def({
            hireEmployee: function(employee) {
                this.employees.push(employee);
                this.emit('hired', employee); // invoke a method from EventEmitter
            },
            fireEmployee: function(employee) {
                this.employees.splice(this.employees.indexOf(employee), 1);
                this.emit('fired', employee);
            }
        });
});
```

This allows clients of this class to listen to changes to the employees of the manager.

```javascript
// listen to changes to the employees
myManager.employees.on('change', function(evt) {
    var changes = event.enumerator();
    while(changes.moveNext()) {
        var change = changes.current;
        if(change.newValue) {
            console.log('hired: '+change.newValue.fullName);
        }
        if(change.oldValue) {
            console.log('fired: '+change.oldValue.fullName);
        }
    }
});
```

## Data Binding

Data binding in jide.js is based on properties and allows to copy, possible converted, values from one property to another.
This feature is highly useful in UI applications as it simplifies a lot of their code and removes otherwise unnecessary
boilerplate code.

To explain how and why this is so useful, we'll skip ahead slightly and utilize a {@link module:jidejs/ui/control/TextField}
control. {@link module:jidejs/ui/control/TextField} defines a _text_ property whose value will be shown to the user
and updates when the user modifies its value.

```javascript
// bind a persons firstName to the textfield text
myTextField.textProperty.bind(myPerson.firstNameProperty);
```

The above example establishes a data binding between the textfields _text_ property and the persons _firstName_ property.
This type of binding automatically updates the value of the textfield whenever the first name of the person changes
but doesn't update the first name when the text of the textfield changes.

It is mostly used when you want to update the data model only when the user applies his changes or if you don't want him
to be able to modify the data manually at all - i.e. if the data is bound to a visual but not modifiable state, like
a background color.

To create a bidirectional binding, i.e. one where updates to one of the properties are pushed to the other, so that the
binding works both ways, you can use the {@link module:jidejs/base/Property~bindBidirectional} method.

```javascript
// bind a person first name to the textfields text, works both ways
myTextField.bindBidirectional(myPerson.firstNameProperty);
```

This modification will update the _text_ of the textfield whenever the _firstName_ of the person changes but it will
also directly update the _firstName_ of the person when the user changes the _text_ of the textfield.

## Working with Promises
Sometimes the return value of a method can not be calculated right away and needs to be delayed to a later time.
Traditionally, this meant the use of callback functions that, when stacked deep enough, became complicated to manage
and hard to read. An alternative to the use of callbacks is the use of a promise.

jide.js implements this concept with its {@link module:jidejs/base/Deferred} module. Below, we will explain the basic
usage of promises based on an animation.

```javascript
require(['jidejs/base/Animation'], function(Animation) {
    // get the element that should be moved from the document
    var element = document.getElementById('myMoveable');
    // start the animation
    Animation.cssTransition({
        element: element,
        prop: 'left',
        target: '500',
        unit: 'px'
    }).then(function() {
        // the previous animation was completed successfully, start the next one
        Animation.cssTransition({
            element: element,
            prop: 'top',
            target: '500',
            unit: 'px'
        }).then(function() {
            console.log('element was moved successfully');
        });
    }, function() {
        // failure handler
        console.log('Animation was not possible.');
    });
});
```