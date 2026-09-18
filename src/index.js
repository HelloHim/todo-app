import Manager from "./manager.js";
import domController from "./domController.js";

const manager = new Manager();

// Dummy data for testing the manager during development.
manager.createProject("workProjectId", "Work");
manager.createProject("homeProjectId", "Home");
manager.createTodoItem(
  "todo1",
  "Finish report",
  "Wrap up the quarterly report",
  false,
  "high",
  "2026-09-25",
  "workProjectId",
);
manager.createTodoItem("todo2", "Email client", "Send follow-up email", false, "medium", "2026-09-20", "workProjectId");
manager.createTodoItem("todo3", "Buy groceries", "Milk, eggs, bread", false, "low", "2026-09-19", "homeProjectId");
manager.createTodoItem("todo4", "Walk the dog", "", true, "low", "2026-09-18", "homeProjectId");
manager.createTodoItem("todo5", "Read a book", "No project assigned, goes to default", false, "medium", "2026-09-30");

domController(manager);

window.manager = manager;
