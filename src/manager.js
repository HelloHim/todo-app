import Task from "./task.js";
import Project from "./project.js";

// Holds every task and project in the app, and is the single place that
// adds, removes and looks them up. The DOM code reads from it and never
// keeps its own copy of the data.
export default class Manager {
  constructor(taskList = [], projectList = []) {
    this.taskList = taskList;
    this.projectList = projectList;
    this.createInitialDefaultProject();
  }
  createInitialDefaultProject() {
    // The default project every task starts in, and falls back to if
    // its project is removed.
    const defaultProject = new Project("defaultProjectId", "default");
    this.projectList.push(defaultProject);
  }
  createTask(taskId, title, description, completionStatus, priority, duedate, projectId) {
    if (!projectId) projectId = "defaultProjectId";
    const task = new Task(taskId, title, description, completionStatus, priority, duedate, projectId);
    this.taskList.push(task);
  }
  removeTask(taskId) {
    const index = this.taskList.findIndex((element) => element.taskId === taskId);
    if (index !== -1) this.taskList = this.taskList.toSpliced(index, 1);
  }
  createProject(projectId, projectName) {
    const project = new Project(projectId, projectName);
    this.projectList.push(project);
  }
  // Removes a project and moves its tasks to the default project, so no task
  // is left pointing at a project that no longer exists.
  removeProject(projectId) {
    const index = this.projectList.findIndex((element) => element.projectId === projectId);
    if (index !== -1) this.projectList = this.projectList.toSpliced(index, 1);

    this.taskList = this.taskList.map((element) => {
      // The id "defaultProjectId" must match the one used in
      // createInitialDefaultProject.
      if (element.projectId === projectId) element.projectId = "defaultProjectId";
      return element;
    });
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
