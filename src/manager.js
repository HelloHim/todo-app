import Task from "./task.js";
import Project from "./project.js";
import { saveToLocalStorage, loadFromLocalStorage } from "./storage.js";

// Holds every task and project in the app, and is the single place that
// adds, removes and looks them up. The DOM code reads from it and never
// keeps its own copy of the data.
export default class Manager {
  constructor() {
    const loadedTodoData = loadFromLocalStorage();

    if (loadedTodoData) {
      // JSON.parse only gives back plain objects, not real Task and Project
      // instances, so they would be missing methods like editTitle(). Build
      // a proper instance for each one from its saved fields.
      this.taskList = loadedTodoData.taskList.map((task) => {
        return new Task(task.taskId, task.title, task.description, task.completionStatus, task.priority, task.dueDate, task.projectId);
      });
      this.projectList = loadedTodoData.projectList.map((project) => {
        return new Project(project.projectId, project.projectName, project.colour);
      });
    } else {
      this.taskList = [];
      this.projectList = [];
      this.createInitialDefaultProject();
    }
  }
  createInitialDefaultProject() {
    // The default, invisible project every task starts in, and falls back
    // to if its project is removed.
    const defaultProject = new Project("defaultProjectId", "default");
    this.projectList.push(defaultProject);
  }
  createTask(taskId, title, description, completionStatus, priority, duedate, projectId) {
    if (!projectId) projectId = "defaultProjectId";
    const task = new Task(taskId, title, description, completionStatus, priority, duedate, projectId);
    this.taskList.push(task);
    saveToLocalStorage(this.taskList, this.projectList);
  }
  removeTask(taskId) {
    const index = this.taskList.findIndex((element) => element.taskId === taskId);
    if (index !== -1) this.taskList = this.taskList.toSpliced(index, 1);
    saveToLocalStorage(this.taskList, this.projectList);
  }
  createProject(projectId, projectName, colour) {
    const project = new Project(projectId, projectName, colour);
    this.projectList.push(project);
    saveToLocalStorage(this.taskList, this.projectList);
  }
  // Saves the form's new details to an existing task. Does not touch
  // completionStatus, which is handled separately by editTaskCompletion.
  editTask(taskId, title, description, priority, duedate, projectId) {
    const task = this.getTaskById(taskId);
    task.editTitle(title);
    task.editDescription(description);
    task.editPriority(priority);
    task.editDueDate(duedate);
    task.editProject(projectId);
    saveToLocalStorage(this.taskList, this.projectList);
  }
  editTaskCompletion(taskId, completionStatus) {
    const task = this.getTaskById(taskId);
    task.editCompletionStatus(completionStatus);
    saveToLocalStorage(this.taskList, this.projectList);
  }
  editProject(projectId, projectName, colour) {
    const project = this.getProjectById(projectId);
    project.editProjectName(projectName);
    project.editColour(colour);
    saveToLocalStorage(this.taskList, this.projectList);
  }
  // Removes a project and moves its tasks to the default, invisible project,
  // so no task is left pointing at a project that no longer exists.
  removeProject(projectId) {
    const index = this.projectList.findIndex((element) => element.projectId === projectId);
    if (index !== -1) this.projectList = this.projectList.toSpliced(index, 1);

    this.taskList = this.taskList.map((element) => {
      // The id "defaultProjectId" must match the one used in
      // createInitialDefaultProject.
      if (element.projectId === projectId) element.projectId = "defaultProjectId";
      return element;
    });
    saveToLocalStorage(this.taskList, this.projectList);
  }
  getTaskById(taskId) {
    const task = this.taskList.find((element) => {
      return element.taskId === taskId;
    });
    return task;
  }
  getTasksByProjectId(projectId) {
    const matchingTasks = this.taskList.filter((task) => {
      return task.projectId === projectId;
    });
    return matchingTasks;
  }
  getProjectById(projectId) {
    const project = this.projectList.find((element) => {
      return element.projectId === projectId;
    });
    return project;
  }
}
