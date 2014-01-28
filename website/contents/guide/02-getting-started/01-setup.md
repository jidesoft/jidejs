---
title: Setup
template: chapter.html
---

# Setup

The first step when creating a **jide.js** app is to setup a new project. For the purpose of this guide, we'll create
a simple Todo application using the Bower, require.js and Grunt. Please make sure to first read the
[Yeoman Quickstart](/guide/00-installation/03-with-yeoman.html) to understand how to create a **jide.js** project using
Yeoman.

## Creating the project

Open your terminal and navigate to the directory where you want to create your new application, then use the following
command to create your project:

```
yo jidejs
```

You can choose any name you like, I'll use `todo.app`.

Once Yeoman has finished the application, start the server with

```
grunt serve
```