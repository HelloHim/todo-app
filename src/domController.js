export default function domController(manager) {
  // The container that every project list item is appended to.
  const content = document.getElementById("content");

  // Render one list item per project.
  manager.projectList.forEach((project) => {
    const projectLi = document.createElement("li");
    projectLi.textContent = project.projectName;

    // Nest a list item for each todo belonging to this project.
    const projectTodoItems = manager.getTodoItemsByProjectId(project.projectId);
    projectTodoItems.forEach((todoItem) => {
      const todoLi = document.createElement("li");
      todoLi.textContent = todoItem.title;
      projectLi.appendChild(todoLi);
    });

    content.appendChild(projectLi);
  });
}
