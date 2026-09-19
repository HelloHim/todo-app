// A named group of tasks. Tasks refer to a project by its projectId.
export default class Project {
  constructor(projectId, projectName) {
    this.projectId = projectId;
    this.projectName = projectName;
  }
  editProjectName(newProjectName) {
    this.projectName = newProjectName;
  }
}
