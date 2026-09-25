# Todo App

A full-featured to-do list app built with HTML, CSS, and JavaScript as part of [The Odin Project](https://www.theodinproject.com/lessons/node-path-javascript-todo-list) JavaScript course.

## Features

- Create, edit, and delete tasks with a title, description, due date, and priority
- Organise tasks into custom projects, each with its own colour
- Inbox, Today, and Upcoming views for filtering tasks by due date
- Filter tasks by one or more projects at once
- Colour-coded priority labels (low, medium, high)
- Data persists between sessions using local storage
- Responsive, minimalist sidebar layout

## Concepts Practised

- Separating data (`Task`, `Project`, `Manager`) from DOM rendering (`domController`)
- Factory-style classes for creating and editing tasks and projects
- Persisting and rehydrating application state with `localStorage`, rebuilding class instances from plain saved data
- Working with dates using `date-fns`
- Modular JavaScript bundled with webpack

## Built With

- HTML
- CSS
- Vanilla JavaScript (ES modules, classes)
- [date-fns](https://date-fns.org/) for date handling
- Webpack for bundling

## Assignment

[The Odin Project: Todo List](https://www.theodinproject.com/lessons/node-path-javascript-todo-list)
