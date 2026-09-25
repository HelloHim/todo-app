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
  const projectButton = document.getElementById("task-project-button");
  const projectLabel = document.getElementById("task-project-label");
  const projectInput = document.getElementById("task-project-input");
  const projectDropdown = document.getElementById("task-project-list");
  const projectDot = document.getElementById("task-project-dot");
  // The row above the task list showing which projects are picked.
  const filterPills = document.getElementById("filter-pills");
  // The heading and helper line above the task list, which change with
  // whichever of the three views is picked.
  const pageTitle = document.getElementById("page-title");
  const headerHelper = document.getElementById("header-helper");

  // The id of the task the form is editing, or null when it is adding a new
  // task. The submit handler checks this to know which one to do.
  let editingTaskId = null;

  // The ids of the projects picked in the sidebar. Only their tasks are
  // shown, or every task when the list is empty.
  let selectedProjectIds = [];

  // Which of the three view menu buttons is picked: "inbox" shows every
  // task, "today" only those due today, and "upcoming" only those due after
  // today. The project filter above still applies on top of this.
  let currentView = "inbox";

  const inboxButton = document.getElementById("view-inbox");
  const todayButton = document.getElementById("view-today");
  const upcomingButton = document.getElementById("view-upcoming");

  // Re-renders everything that depends on the manager's data.
  const renderPage = function () {
    renderHeaderText();
    renderProjectView();
    renderFilterView();
    renderTaskView();
  };

  // Updates the heading and helper line above the task list to match
  // whichever of the three views is picked.
  const renderHeaderText = function () {
    if (currentView === "today") {
      pageTitle.textContent = "Inbox - Today";
      headerHelper.textContent = "Everything due today";
    } else if (currentView === "upcoming") {
      pageTitle.textContent = "Inbox - Upcoming";
      headerHelper.textContent = "What's coming up next";
    } else {
      pageTitle.textContent = "Inbox";
      headerHelper.textContent = "Your tasks, all in one place";
    }
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

    // The inbox button shows every task, so it is only highlighted when no
    // projects are picked either.
    inboxButton.classList.toggle("active", currentView === "inbox" && selectedProjectIds.length === 0);
    todayButton.classList.toggle("active", currentView === "today");
    upcomingButton.classList.toggle("active", currentView === "upcoming");

    // Render one list item per project. The default project is invisible to
    // the user, not a real project they made, only a fallback for tasks
    // with none picked, so it never shows up here.
    manager.projectList.forEach((project) => {
      if (project.projectId === "defaultProjectId") return;

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

    // Today's date as an ISO string (e.g. "2026-09-25"), the same format
    // task.dueDate is stored in, so the two can be compared directly.
    const today = format(new Date(), "yyyy-MM-dd");

    // Render one row per task.
    manager.taskList.forEach((task) => {
      // Skip tasks that are not in a picked project. When no projects are
      // picked, every task is shown.
      if (selectedProjectIds.length > 0 && !selectedProjectIds.includes(task.projectId)) return;

      // The Today and Upcoming views only show tasks with a due date, so a
      // task with none never appears in either.
      if (currentView === "today" && task.dueDate !== today) return;
      if (currentView === "upcoming" && task.dueDate <= today) return;

      const row = document.createElement("div");
      row.classList.add("task-row");

      const checkbox = document.createElement("button");
      checkbox.classList.add("task-checkbox");
      if (task.completionStatus) checkbox.classList.add("completed");
      // Flips done/not done, then re-renders so the tick mark updates.
      checkbox.addEventListener("click", () => {
        manager.editTaskCompletion(task.taskId, !task.completionStatus);
        renderPage();
      });

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
      // task.priority is "low", "medium" or "high", which doubles as the
      // modifier class that colour-codes it in styles.css.
      priority.classList.add("task-priority", task.priority);
      priority.textContent = task.priority;
      meta.appendChild(priority);

      main.appendChild(meta);

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
      // A task with no real project shows no pill at all, as the default
      // project is invisible to the user, only a fallback that should
      // never appear in the UI.
      if (task.projectId !== "defaultProjectId") {
        const project = manager.getProjectById(task.projectId);
        row.appendChild(createProjectPill(project));
      }
      row.appendChild(actions);
      taskList.appendChild(row);
    });
  };

  // Fills the project dropdown with one row per project, plus a "+ New
  // project" row at the bottom. Rebuilt each time the form opens so newly
  // created projects are included. The default project is left out, as it
  // is invisible to the user: not a real project a task can be filed under
  // on purpose, only a fallback for tasks with no project chosen.
  const renderProjectOptions = function () {
    projectDropdown.replaceChildren();

    // Lets the user pick no project at all, same as leaving the field
    // untouched. Has no dot, as it is not standing in for a real project.
    const noneRow = document.createElement("div");
    noneRow.classList.add("project-dropdown-item");
    noneRow.textContent = "(none)";
    noneRow.addEventListener("click", () => selectProject("defaultProjectId"));
    projectDropdown.appendChild(noneRow);

    manager.projectList.forEach((project) => {
      if (project.projectId === "defaultProjectId") return;

      const row = document.createElement("div");
      row.classList.add("project-dropdown-item");

      const dot = document.createElement("span");
      dot.classList.add("project-dot");
      dot.style.backgroundColor = project.colour;
      row.appendChild(dot);

      const label = document.createElement("span");
      label.textContent = project.projectName;
      row.appendChild(label);

      row.addEventListener("click", () => selectProject(project.projectId));
      projectDropdown.appendChild(row);
    });

    const newProjectRow = document.createElement("div");
    newProjectRow.classList.add("project-dropdown-item", "new-project");
    newProjectRow.textContent = "+ New project";
    newProjectRow.addEventListener("click", () => {
      projectDropdown.classList.remove("open");
      openProjectDialog();
    });
    projectDropdown.appendChild(newProjectRow);
  };

  // Shows "Select Project" with no dot when nothing is chosen yet, and
  // "(none)" with no dot when the default project is chosen, either by
  // picking that row or because the task already had no real project. Both
  // end up saving the task to the default, invisible project, which never
  // shows up in the UI under its own name.
  const updateProjectDisplay = function () {
    const hasRealProject = projectInput.value && projectInput.value !== "defaultProjectId";
    projectButton.classList.toggle("unselected", !hasRealProject);

    if (!projectInput.value) {
      projectLabel.textContent = "Select Project";
    } else if (projectInput.value === "defaultProjectId") {
      projectLabel.textContent = "(none)";
    } else {
      const project = manager.getProjectById(projectInput.value);
      projectDot.style.backgroundColor = project.colour;
      projectLabel.textContent = project.projectName;
    }
  };

  // Picks a project from the dropdown: stores its id in the hidden input the
  // form submits, updates the button to show it, then closes the dropdown.
  const selectProject = function (projectId) {
    projectInput.value = projectId;
    updateProjectDisplay();
    projectDropdown.classList.remove("open");
  };

  // Opens and closes the dropdown when its button is clicked.
  projectButton.addEventListener("click", () => {
    projectDropdown.classList.toggle("open");
  });

  // Closes the dropdown when clicking anywhere else on the page.
  document.addEventListener("click", (event) => {
    if (!projectButton.contains(event.target) && !projectDropdown.contains(event.target)) {
      projectDropdown.classList.remove("open");
    }
  });

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
      projectInput.value = task.projectId;
    } else {
      editingTaskId = null;
      taskDialogTitle.textContent = "Add Task";
      submitTask.textContent = "Add Task";
      // No project is picked yet. If none is picked before saving,
      // Manager.createTask falls back to the default, invisible project
      // itself.
      projectInput.value = "";
    }

    updateProjectDisplay();
    taskDialog.showModal();
  };

  // Un-pick every project when the inbox is clicked, so all tasks show again.
  inboxButton.addEventListener("click", () => {
    selectedProjectIds = [];
    currentView = "inbox";
    renderPage();
  });

  // Switch to the Today and Upcoming views. The project filter is left as
  // it is, so it can still narrow down either view.
  todayButton.addEventListener("click", () => {
    currentView = "today";
    renderPage();
  });

  upcomingButton.addEventListener("click", () => {
    currentView = "upcoming";
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
      manager.editTask(editingTaskId, title, description, priority, dueDate, projectId);
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
  const deleteProject = document.getElementById("delete-project");
  // Hidden until a project is actually being edited, set in openProjectDialog.
  deleteProject.style.display = "none";

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
      // Only an existing project can be deleted, not one still being added.
      deleteProject.style.display = "";
    } else {
      editingProjectId = null;
      projectDialogTitle.textContent = "Add Project";
      submitProject.textContent = "Add Project";
      deleteProject.style.display = "none";
    }

    projectDialog.showModal();
  };

  // Open the project form when the new project button is clicked.
  const newProject = document.getElementById("add-project");
  newProject.addEventListener("click", () => openProjectDialog());

  // Deletes the project being edited. Manager.removeProject already moves
  // its tasks to the default, invisible project, so none of them are left
  // pointing at a project that no longer exists.
  deleteProject.addEventListener("click", () => {
    manager.removeProject(editingProjectId);
    projectDialog.close();
    renderPage();
  });

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
      manager.editProject(editingProjectId, projectName, colour);
    } else {
      // Generate a unique id the same way as for tasks.
      const projectId = crypto.randomUUID().substring(0, 5);
      manager.createProject(projectId, projectName, colour);

      // The "+ New project" row in the task dialog opens this same form, so
      // if the task dialog is still open behind it, pick the project just
      // created rather than leaving the old one selected.
      if (taskDialog.open) {
        renderProjectOptions();
        selectProject(projectId);
      }
    }

    projectDialog.close();
    renderPage();
  });

  // Render the initial state so existing data shows before any click.
  renderPage();
}
