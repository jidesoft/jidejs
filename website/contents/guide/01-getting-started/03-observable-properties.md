---
title: Observable Properties
template: chapter.html
---

# Defining Observable Properties

{@link jidejs/base/ObservableProperty} is an extension to the concept of {@link jidejs/base/Observable}. Often, a single
variable isn't enough to contain all of your data model. Instead, you will probably want to define objects that have
observable properties.

**jide.js** offers a convenient way to define such objects:

```javascript
require(['jidejs/base/ObservableProperty'], function(ObservableProperty) {
    function Person(firstName, lastName) {
        installer(this);
        this.firstName = firstName;
        this.lastName = lastName;
    }
    var installer = ObservableProperty.install(Person, 'firstName', 'lastName');
});
```

The above code will setup the following fields on `Person` objects:

- firstName (get; set)
- firstNameProperty ({@link jidejs/base/ObservableProperty})
- lastName (get; set)
- lastNameProperty ({@link jidejs/base/ObservableProperty})

The `firstName` and `lastName` fields act as standard object fields. You can use them as you would use any other object
field, however, modifications to them are propagated to their respective properties and events are dispatched accordingly.

# Listening to changes

Every object that defines its properties as shown above, automatically implements {@link jidejs/base/EventEmitter} since
the properties delegate event dispatching and event listening to the object. It is still possible to register listeners
using the `subscribe` method of the property but its also possible to listen to events on the object itself:

```javascript
// one way
myPerson.firstNameProperty.subscribe(function(event) {
    console.log('First name changed from '+event.oldValue+' to '+event.value);
});
// alternative
myPerson.on('change:firstName', function(event) {
    console.log('First name changed from '+event.oldValue+' to '+event.value);
});
```

Both options are equivalent and do the exact same thing. The property allows data binding and passing the property to
functions while the EventEmitter option is more in line with native events and is useful when using **jide.js** controls.

# Event Bubbling

Properties defined on {@link jidejs/ui/Component} and subclasses of it fire events that bubble, just like native DOM events.
This feature is not available for standard classes, though.