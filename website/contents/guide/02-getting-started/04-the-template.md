---
title: The Template
template: chapter.html
---

# The Template

Now that we have our models in place, it is time to define what we want our application to look like. Thus we need to
specify a template. Place the following template into `app/view/AppTemplate.html`.

```xml
<template>
    <h1>todos</h1>
    <div class="todo-view">
        <header>
            <input type="text" pseudo="x-editor" bind="
                is: 'jidejs/ui/control/TextField',
                on: {
                    action: insertNewTask.bind($item)
                }
            ">
        </header>
        <ul bind="
            foreach: tasks
        ">
            <template>
                <li><input type="checkbox" bind="
                    attr: {
                        checked: $item.done ? 'checked' : null
                    },
                    on: {
                        change: $parent.updateCheckedState.bind($parent)
                    }
                "><span bind="text: $item.title"></span></li>
            </template>
        </ul>
        <footer>
            <span bind="text: component.openTasks + ' items left'"></span>
            <div pseudo="x-filter-options" bind="
                is: 'jidejs/ui/control/ListView',
                items: availableFilters,
                selectionModel: filterOptionsSelectionModel,
                orientation: 'horizontal'
            "></div>
            <span pseudo="x-clear-completed" bind="
                is: 'jidejs/ui/control/Button',
                text: 'Clear completed ('+(component.tasks.length - component.openTasks)+')',
                on: {
                    action: clearCompleted.bind($item)
                }
            "></span>
        </footer>
    </div>
</template>
```

**jide.js** relies on the new `template` tag to define its templates. We could've used a
{@link module:jidejs/ui/control/ListView ListView} to render the tasks but for the sake of this example (and because
of the very narrow scope of this sample project), we'll use simple template bindings to create our task view.
The `pseudo` attributes will make it easier to access these elements within the Skin we'll define later on.

One thing that might look odd is the `$parent.updateCheckedState` reference. When inside a `foreach` binding, the scope
is changed to the iterated item. Accessing the `$parent` variable allows us to reference the original scope again.
Take a look at the [Template Binding](/guide/01-core-concepts/05-template-binding.html) chapter to learn more about
the available template bindings.

When looking at the template above, it becomes clear that our Skin will need a list of tasks that is different from the
one specified by the TodoApp control since we want it to be filtered.

There are certain parts that we'll want to be actual **jide.js** controls to leverage their advanced features. For
example, the list of filters is a perfect fit for the ListView control since we need selection, the editor to insert
new tasks should be a TextField control and the button for clearing the completed tasks can benefit from being a Button.