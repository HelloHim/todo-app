// SVG path data for the task row action icons. The edit icon is a pencil
// above an underline, drawn by hand to match the design. The delete icon is
// lucide's "trash".
const editIconPath = ["M15.5 3.5a2.12 2.12 0 0 1 3 3L8.5 16.5 5 17l.5-3.5z", "M4 21h16"];
const trashIconPath = ["M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"];

// Builds an icon-only button for a task row action. SVG elements must be
// created with createElementNS, as createElement would make plain HTML
// elements that the browser does not draw.
const createIconButton = function (className, pathData) {
  const button = document.createElement("button");
  button.classList.add("icon-button", className);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  // currentColor lets CSS set the icon colour through the button's color.
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.classList.add("preview-icon");
  pathData.forEach((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  });
  button.appendChild(svg);
  return button;
};

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

  // Formats an ISO date string (e.g. "2026-09-22") as "Thu, Sep 22, 2026".
  const formatDueDate = function (dueDate) {
    return new Date(dueDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Rebuilds the main panel's task rows from the manager's tasks.
  const renderTaskView = function () {
    // Clear all existing child elements so the task list can be re-rendered
    // from scratch.
    taskList.replaceChildren();

    // Render one row per task.
    manager.taskList.forEach((task) => {
      const project = manager.getProjectById(task.projectId);

      const row = document.createElement("div");
      row.classList.add("task-row");

      const checkbox = document.createElement("button");
      checkbox.classList.add("task-checkbox");
      if (task.completionStatus) checkbox.classList.add("completed");

      // Groups the title with its date and priority line. The row's CSS grid
      // lays these children out directly (display: contents), so the wrapper
      // only exists to keep the markup readable.
      const main = document.createElement("div");
      main.classList.add("task-main");

      const title = document.createElement("p");
      title.classList.add("task-title");
      title.textContent = task.title;
      main.appendChild(title);

      const meta = document.createElement("div");
      meta.classList.add("task-meta");

      const dueDate = document.createElement("span");
      dueDate.classList.add("task-due");
      dueDate.textContent = formatDueDate(task.dueDate);
      meta.appendChild(dueDate);

      const priority = document.createElement("span");
      priority.classList.add("task-priority");
      priority.textContent = task.priority;
      meta.appendChild(priority);

      main.appendChild(meta);

      const pill = document.createElement("span");
      pill.classList.add("project-pill");
      const pillDot = document.createElement("span");
      pillDot.classList.add("project-dot");
      pill.appendChild(pillDot);
      const pillLabel = document.createElement("span");
      pillLabel.textContent = project.projectName;
      pill.appendChild(pillLabel);

      const actions = document.createElement("div");
      actions.classList.add("task-actions");
      actions.appendChild(createIconButton("edit-task", editIconPath));
      actions.appendChild(createIconButton("delete-task", trashIconPath));

      row.appendChild(checkbox);
      row.appendChild(main);
      row.appendChild(pill);
      row.appendChild(actions);
      taskList.appendChild(row);
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
