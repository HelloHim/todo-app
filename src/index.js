import Manager from "./manager.js";
import domController from "./domController.js";
import "./styles.css";

const manager = new Manager();

// The default project is always in projectList but is never shown to the
// user, so a real (visible) project is one whose id is not "defaultProjectId".
const hasVisibleProjects = manager.projectList.some((project) => project.projectId !== "defaultProjectId");

// This dummy data is only for testing the manager during development. It
// only runs when the app has nothing saved yet, so it never overwrites or
// duplicates real data the user has already added.
if (manager.taskList.length === 0 && !hasVisibleProjects) {
  manager.createProject("workProjectId", "Work", "#3f72af");
  manager.createProject("homeProjectId", "Home", "#4e8a4c");
  manager.createTask(
    "task1",
    "Finish report",
    "Wrap up the quarterly report",
    false,
    "high",
    "2026-09-25",
    "workProjectId",
  );
  manager.createTask("task2", "Email client", "Send follow-up email", false, "medium", "2026-09-20", "workProjectId");
  manager.createTask("task3", "Buy groceries", "Milk, eggs, bread", false, "low", "2026-09-19", "homeProjectId");
  manager.createTask("task4", "Walk the dog", "", true, "low", "2026-09-18", "homeProjectId");
  manager.createTask("task5", "Read a book", "No project assigned, goes to default", false, "medium", "2026-09-30");
}

domController(manager);

window.manager = manager;
