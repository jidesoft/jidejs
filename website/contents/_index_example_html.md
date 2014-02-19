---
title: HTML part of the index example
view: none
----

```xml
<div id="front_page_example">
    <template>
        <h2>Recent Blog Posts</h2>
        <ul bind="foreach: component.posts" class="row-fluid">
            <template>
                <li class="span4">
                    <h3><a bind="
                        content: title,
                        attr: { href: url }
                    "></a></h3>
                    <p bind="content: excerpt"></p>
                    <p>
                        <a class="btn" bind="
                            attr: { href: url }
                        ">Read more</a>
                    </p>
                </li>
            </template>
        </ul>
    </template>
</div>
```