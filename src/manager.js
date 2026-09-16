import TodoItem from "./todoItem.js";
import Project from "./project.js";

// Holds every todo item and project in the app, and is the single place
// that adds, removes and looks them up.
export default class Manager {
  constructor(todoList = [], projectList = []) {
    this.todoList = todoList;
    this.projectList = projectList;
    this.createInitialDefaultProject();
  }
  createInitialDefaultProject() {
    // The default project every todo item starts in, and falls back to if
    // its project is removed.
    const defaultProject = new Project("defaultProjectId", "default");
    this.projectList.push(defaultProject);
  }
  createTodoItem(todoItemId, title, description, completionStatus, priority, duedate, projectId) {
    if (!projectId) projectId = "defaultProjectId";
    const todoItem = new TodoItem(todoItemId, title, description, completionStatus, priority, duedate, projectId);
    this.todoList.push(todoItem);
  }
  removeTodoItem(todoItemId) {
    const index = this.todoList.findIndex((element) => element.todoItemId === todoItemId);
    if (index !== -1) this.todoList = this.todoList.toSpliced(index, 1);
  }
  createProject(projectId, projectName) {
    const project = new Project(projectId, projectName);
    this.projectList.push(project);
  }
  // Removes a project and moves its todo items to the default project, so
  // no todo item is left pointing at a project that no longer exists.
  removeProject(projectId) {
    const index = this.projectList.findIndex((element) => element.projectId === projectId);
    if (index !== -1) this.projectList = this.projectList.toSpliced(index, 1);

    this.todoList = this.todoList.map((element) => {
      // The id "defaultProjectId" must match the one used in
      // createInitialDefaultProject.
      if (element.projectId === projectId) element.projectId = "defaultProjectId";
      return element;
    });
  }
  getTodoItemById(todoItemId) {
    const todoItem = this.todoList.find((element) => {
      return element.todoItemId === todoItemId;
    });
    return todoItem;
  }
  getProjectById(projectId) {
    const project = this.projectList.find((element) => {
      return element.projectId === projectId;
    });
    return project;
  }
}
