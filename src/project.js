// A named group of todo items. Todo items refer to a project by its
// projectId.
export default class Project {
  constructor(projectId, projectName) {
    this.projectId = projectId;
    this.projectName = projectName;
  }
  editProjectName(newProjectName) {
    this.projectName = newProjectName;
  }
}
