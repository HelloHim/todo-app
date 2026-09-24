import { parseISO, format } from "date-fns";

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

// Builds a rounded label showing a project's dot and name in its colour.
// Used on each task row, and in bigger form above the task list.
const createProjectPill = function (project) {
  const pill = document.createElement("span");
  pill.classList.add("project-pill");
  // The text uses the project's colour. Adding "14" to the end of a hex
  // colour makes it about 8% see-through, so on the white page the
  // background shows as a very light version of the same colour.
  pill.style.color = project.colour;
  pill.style.backgroundColor = project.colour + "14";
  const pillDot = document.createElement("span");
  pillDot.classList.add("project-dot");
  pillDot.style.backgroundColor = project.colour;
  pill.appendChild(pillDot);
  const pillLabel = document.createElement("span");
  pillLabel.textContent = project.projectName;
  pill.appendChild(pillLabel);
  return pill;
};

// Wires the manager's data to the page: renders the project and task lists
// and handles the buttons that create new tasks and projects. Every change
// to the data is followed by a full re-render rather than patching the DOM.
export default function domController(manager) {
  // The container that every project list item is appended to.
  const projectList = document.getElementById("project-list");
  // The container that every task list item is appended to.
  const taskList = document.getElementById("task-list");
  // The modal form, shared by adding and editing a task.
  const taskDialog = document.getElementById("task-dialog");
  const taskForm = document.getElementById("task-form");
  const taskDialogTitle = document.getElementById("task-dialog-title");
  const submitTask = document.getElementById("submit-task");
  const projectSelect = document.getElementById("task-project-input");
  const projectDot = document.getElementById("task-project-dot");
  // The row above the task list showing which projects are picked.
  const filterPills = document.getElementById("filter-pills");

  // The id of the task the form is editing, or null when it is adding a new
  // task. The submit handler checks this to know which one to do.
  let editingTaskId = null;

  // The ids of the projects picked in the sidebar. Only their tasks are
  // shown, or every task when the list is empty.
  let selectedProjectIds = [];

  // The inbox button shows every task, so it is only highlighted when no
  // projects are picked.
  const inboxButton = document.getElementById("view-inbox");

  // Re-renders everything that depends on the manager's data.
  const renderPage = function () {
    renderProjectView();
    renderFilterView();
    renderTaskView();
  };

  // Rebuilds the row of picked project pills above the task list. When no
  // projects are picked the row is left empty, and the CSS hides it.
  const renderFilterView = function () {
    filterPills.replaceChildren();
    selectedProjectIds.forEach((projectId) => {
      const project = manager.getProjectById(projectId);
      filterPills.appendChild(createProjectPill(project));
    });
  };

  // Rebuilds the sidebar's project list from the manager's projects.
  const renderProjectView = function () {
    // Clear all existing child elements so the project list can be
    // re-rendered from scratch.
    projectList.replaceChildren();

    inboxButton.classList.toggle("active", selectedProjectIds.length === 0);

    // Render one list item per project.
    manager.projectList.forEach((project) => {
      const projectDiv = document.createElement("div");
      projectDiv.classList.add("nav-item");

      // Give a picked project a light background in its own colour. Adding
      // "26" to the end of a hex colour makes it about 15% see-through.
      if (selectedProjectIds.includes(project.projectId)) {
        projectDiv.classList.add("selected");
        projectDiv.style.backgroundColor = project.colour + "26";
      }

      // Clicking a project picks it, or un-picks it if it was already picked.
      projectDiv.addEventListener("click", () => {
        if (selectedProjectIds.includes(project.projectId)) {
          selectedProjectIds = selectedProjectIds.filter((id) => id !== project.projectId);
        } else {
          selectedProjectIds.push(project.projectId);
        }
        renderPage();
      });

      const dot = document.createElement("span");
      dot.classList.add("project-dot");
      dot.style.backgroundColor = project.colour;
      projectDiv.appendChild(dot);

      const label = document.createElement("span");
      label.classList.add("project-name");
      label.textContent = project.projectName;
      projectDiv.appendChild(label);

      const editButton = createIconButton("edit-project", editIconPath);
      editButton.addEventListener("click", (event) => {
        // Stop the click reaching the row, so editing does not also pick
        // or un-pick the project.
        event.stopPropagation();
        openProjectDialog(project);
      });
      projectDiv.appendChild(editButton);

      projectList.appendChild(projectDiv);
    });
  };

  // Formats an ISO date string (e.g. "2026-09-22") as "Tue, Sep 22, 2026".
  // parseISO reads a bare date as local midnight, so it shows on the right day.
  const formatDueDate = function (dueDate) {
    const formattedDueDate = format(parseISO(dueDate), "EEE, MMM dd, yyyy");
    return formattedDueDate;
  };

  // Rebuilds the main panel's task rows from the manager's tasks.
  const renderTaskView = function () {
    // Clear all existing child elements so the task list can be re-rendered
    // from scratch.
    taskList.replaceChildren();

    // Render one row per task.
    manager.taskList.forEach((task) => {
      // Skip tasks that are not in a picked project. When no projects are
      // picked, every task is shown.
      if (selectedProjectIds.length > 0 && !selectedProjectIds.includes(task.projectId)) return;

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

      // The due date is optional in the task form, so only show it if set.
      if (task.dueDate) {
        const dueDate = document.createElement("span");
        dueDate.classList.add("task-due");
        dueDate.textContent = formatDueDate(task.dueDate);
        meta.appendChild(dueDate);
      }

      const priority = document.createElement("span");
      priority.classList.add("task-priority");
      priority.textContent = task.priority;
      meta.appendChild(priority);

      main.appendChild(meta);

      const pill = createProjectPill(project);

      const actions = document.createElement("div");
      actions.classList.add("task-actions");
      const editButton = createIconButton("edit-task", editIconPath);
      editButton.addEventListener("click", () => openTaskDialog(task));
      actions.appendChild(editButton);
      // Deletes the task straight away. There is no confirmation step or undo.
      const deleteButton = createIconButton("delete-task", trashIconPath);
      deleteButton.addEventListener("click", () => {
        manager.removeTask(task.taskId);
        renderPage();
      });
      actions.appendChild(deleteButton);

      row.appendChild(checkbox);
      row.appendChild(main);
      row.appendChild(pill);
      row.appendChild(actions);
      taskList.appendChild(row);
    });
  };

  // Fills the project dropdown with one option per project. It is rebuilt
  // each time the form opens so newly created projects are included.
  const renderProjectOptions = function () {
    projectSelect.replaceChildren();
    manager.projectList.forEach((project) => {
      const option = document.createElement("option");
      option.value = project.projectId;
      // Tasks without a project live in the default project, which the
      // design calls "Inbox".
      option.textContent = project.projectId === "defaultProjectId" ? "Inbox" : project.projectName;
      projectSelect.appendChild(option);
    });
  };

  // Shows a hollow dot beside the project select when the inbox is chosen,
  // and one filled with the project's colour for a real project, as a native
  // select cannot show icons inside itself.
  const updateProjectDot = function () {
    const isInbox = projectSelect.value === "defaultProjectId";
    projectDot.classList.toggle("inbox", isInbox);

    if (isInbox) {
      // Clear the colour so the hollow inbox style from the CSS shows.
      projectDot.style.backgroundColor = "";
    } else {
      const project = manager.getProjectById(projectSelect.value);
      projectDot.style.backgroundColor = project.colour;
    }
  };
  projectSelect.addEventListener("change", updateProjectDot);

  // Opens the task form as a modal. Given a task, the form is filled with its
  // details and saving updates it. Without one, the form starts empty and
  // saving creates a new task.
  const openTaskDialog = function (task) {
    taskForm.reset();
    renderProjectOptions();

    if (task) {
      editingTaskId = task.taskId;
      taskDialogTitle.textContent = "Edit Task";
      submitTask.textContent = "Save";
      taskForm.elements.title.value = task.title;
      taskForm.elements.description.value = task.description;
      taskForm.elements.dueDate.value = task.dueDate;
      taskForm.elements.priority.value = task.priority;
      taskForm.elements.projectId.value = task.projectId;
    } else {
      editingTaskId = null;
      taskDialogTitle.textContent = "Add Task";
      submitTask.textContent = "Add Task";
    }

    updateProjectDot();
    taskDialog.showModal();
  };

  // Un-pick every project when the inbox is clicked, so all tasks show again.
  inboxButton.addEventListener("click", () => {
    selectedProjectIds = [];
    renderPage();
  });

  // Open the task form when the new task button is clicked.
  const newTask = document.getElementById("add-task");
  newTask.addEventListener("click", () => openTaskDialog());

  // Close the task form without saving when cancel is clicked. Pressing
  // Escape also closes it, which the dialog element handles itself.
  const cancelTask = document.getElementById("cancel-task");
  cancelTask.addEventListener("click", () => taskDialog.close());

  // Save the form's values to the task being edited, or create a new task
  // from them, then close the form and re-render. The browser only fires
  // submit once the title passes the input's required and non-blank pattern
  // checks.
  taskForm.addEventListener("submit", (event) => {
    // Stop the form from reloading the page, which would lose all the data.
    event.preventDefault();
    const formData = new FormData(taskForm);
    const title = formData.get("title").trim();
    const description = formData.get("description").trim();
    const priority = formData.get("priority");
    const dueDate = formData.get("dueDate");
    const projectId = formData.get("projectId");

    if (editingTaskId) {
      const task = manager.getTaskById(editingTaskId);
      task.editTitle(title);
      task.editDescription(description);
      task.editPriority(priority);
      task.editDueDate(dueDate);
      task.editProject(projectId);
    } else {
      // Generate a unique id for this task using the Crypto API, and limit it
      // to 5 characters to keep it short.
      const taskId = crypto.randomUUID().substring(0, 5);
      manager.createTask(taskId, title, description, false, priority, dueDate, projectId);
    }

    taskDialog.close();
    renderPage();
  });

  // The modal form, shared by adding and editing a project.
  const projectDialog = document.getElementById("project-dialog");
  const projectForm = document.getElementById("project-form");
  const projectDialogTitle = document.getElementById("project-dialog-title");
  const submitProject = document.getElementById("submit-project");

  // The id of the project the form is editing, or null when it is adding a
  // new project. Works the same way as editingTaskId.
  let editingProjectId = null;

  // Opens the project form as a modal. Given a project, the form is filled
  // with its details and saving updates it. Without one, the form starts
  // empty and saving creates a new project.
  const openProjectDialog = function (project) {
    projectForm.reset();

    if (project) {
      editingProjectId = project.projectId;
      projectDialogTitle.textContent = "Edit Project";
      submitProject.textContent = "Save";
      projectForm.elements.projectName.value = project.projectName;
      projectForm.elements.colour.value = project.colour;
    } else {
      editingProjectId = null;
      projectDialogTitle.textContent = "Add Project";
      submitProject.textContent = "Add Project";
    }

    projectDialog.showModal();
  };

  // Open the project form when the new project button is clicked.
  const newProject = document.getElementById("add-project");
  newProject.addEventListener("click", () => openProjectDialog());

  // Close the project form without saving when cancel is clicked.
  const cancelProject = document.getElementById("cancel-project");
  cancelProject.addEventListener("click", () => projectDialog.close());

  // Save the form's name and colour to the project being edited, or create a
  // new project from them, then close the form and re-render. Like the task
  // title, the browser only fires submit once the name is not blank.
  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(projectForm);
    const projectName = formData.get("projectName").trim();
    const colour = formData.get("colour");

    if (editingProjectId) {
      const project = manager.getProjectById(editingProjectId);
      project.editProjectName(projectName);
      project.editColour(colour);
    } else {
      // Generate a unique id the same way as for tasks.
      const projectId = crypto.randomUUID().substring(0, 5);
      manager.createProject(projectId, projectName, colour);
    }

    projectDialog.close();
    renderPage();
  });

  // Render the initial state so existing data shows before any click.
  renderPage();
}
