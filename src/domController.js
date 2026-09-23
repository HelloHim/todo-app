// Wires the manager's data to the page: renders the project and task lists
// and handles the buttons that create new tasks and projects. Every change
// to the data is followed by a full re-render rather than patching the DOM.
export default function domController(manager) {
  // The container that every project list item is appended to.
  const projectList = document.getElementById("project-list");
  // The container that every task list item is appended to.
  const taskList = document.getElementById("task-list");

  // Re-renders everything that depends on the manager's data.
  const renderPage = function () {
    renderProjectView();
    renderTaskView();
  };

  // Rebuilds the sidebar's project list from the manager's projects.
  const renderProjectView = function () {
    // Clear all existing child elements so the project list can be
    // re-rendered from scratch.
    projectList.replaceChildren();

    // Render one list item per project.
    manager.projectList.forEach((project) => {
      const projectDiv = document.createElement("div");
      projectDiv.classList.add("nav-item");

      const dot = document.createElement("span");
      dot.classList.add("project-dot");
      projectDiv.appendChild(dot);

      const label = document.createElement("span");
      label.textContent = project.projectName;
      projectDiv.appendChild(label);

      projectList.appendChild(projectDiv);
    });
  };

  // Rebuilds the task list from the manager's tasks.
  const renderTaskView = function () {
    // Clear all existing child elements so the task list can be re-rendered
    // from scratch.
    taskList.replaceChildren();

    // Render one list item per task.
    manager.taskList.forEach((task) => {
      const taskLi = document.createElement("div");
      taskLi.textContent = task.title;
      taskList.appendChild(taskLi);
    });
  };

  // Create a task when the new task button is clicked, then re-render the page.
  // The task details are hard-coded placeholders for now. The fixed task ID
  // means every click creates a task with the same ID.
  const newTask = document.getElementById("add-task");
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

  // Create a project when the new project button is clicked, then re-render
  // the page. The project details are hard-coded placeholders for now.
  const newProject = document.getElementById("add-project");
  newProject.addEventListener("click", () => {
    manager.createProject("fitnessProjectId", "Fitness");
    renderPage();
  });

  // Render the initial state so existing data shows before any click.
  renderPage();
}
