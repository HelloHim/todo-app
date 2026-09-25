export function saveToLocalStorage(taskList, projectList) {
  const dataToSave = {
    taskList: taskList,
    projectList: projectList,
  };
  localStorage.setItem("todoData", JSON.stringify(dataToSave));
}

export function loadFromLocalStorage() {
  try {
    const rawTodoData = localStorage.getItem("todoData");
    // If localStorage is empty, nothing is returned.
    if (!rawTodoData) return null;

    const todoDataToLoad = JSON.parse(rawTodoData);

    // Confirm each field is really an array (not null/string/etc.), and has at least
    // one item in it so we don't misread corrupted saved data as valid.
    const hasTasks = Array.isArray(todoDataToLoad.taskList) && todoDataToLoad.taskList.length > 0;
    const hasProjects = Array.isArray(todoDataToLoad.projectList) && todoDataToLoad.projectList.length > 0;

    if (!hasTasks && !hasProjects) return null;

    return todoDataToLoad;
  } catch (e) {
    console.error("Failed to load from localStorage", e);
    return null
  }
}
