// A single to-do item. projectId links it to a Project held by the manager,
// rather than storing the project itself.
export default class Task {
  constructor(taskId, title, description, completionStatus, priority, dueDate, projectId) {
    this.taskId = taskId;
    this.title = title;
    this.description = description;
    this.completionStatus = completionStatus;
    this.priority = priority;
    this.dueDate = dueDate;
    this.projectId = projectId;
  }
  editTitle(newTitle) {
    this.title = newTitle;
  }
  editDescription(newDescription) {
    this.description = newDescription;
  }
  editCompletionStatus(newCompletionStatus) {
    this.completionStatus = newCompletionStatus;
  }
  editPriority(newPriority) {
    this.priority = newPriority;
  }
  editDueDate(newDueDate) {
    this.dueDate = newDueDate;
  }
  editProject(newProject) {
    this.projectId = newProject;
  }
}
