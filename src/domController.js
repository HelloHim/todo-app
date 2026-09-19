export default function domController(manager) {
  // The container that every project list item is appended to.
  const content = document.getElementById("content");

  const renderPage = function () {
    // Clear all existing child elements so the content area can be re-rendered from scratch.
    content.replaceChildren();

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
  };

  // Create a task when the new task button is clicked, then re-render the page.
  const newTask = document.getElementById("new-task");
  newTask.addEventListener("click", () => {
    manager.createTask(
      "task6",
      "Call the dentist",
      "Book a check-up appointment",
      false,
      "medium",
      "2026-09-22",
      "homeProjectId",
    );
    renderPage();
  });

  renderPage();
}
