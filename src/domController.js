export default function domController(manager) {
  // The container that every project list item is appended to.
  const content = document.getElementById("content");

  // Render one list item per project.
  manager.projectList.forEach((project) => {
    const projectLi = document.createElement("li");
    projectLi.textContent = project.projectName;

    // Nest a list item for each task belonging to this project.
    const projectTasks = manager.getTasksByProjectId(project.projectId);
    projectTasks.forEach((task) => {
      const taskLi = document.createElement("li");
      taskLi.textContent = task.title;
      projectLi.appendChild(taskLi);
    });

    content.appendChild(projectLi);
  });
}
