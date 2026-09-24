// A named group of tasks. Tasks refer to a project by its projectId. The
// colour is a hex string such as "#7c5cbf", used for the project's dot and
// pill.
export default class Project {
  constructor(projectId, projectName, colour) {
    this.projectId = projectId;
    this.projectName = projectName;
    this.colour = colour;
  }
  editProjectName(newProjectName) {
    this.projectName = newProjectName;
  }
  editColour(newColour) {
    this.colour = newColour;
  }
}
