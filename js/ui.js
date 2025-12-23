// js/ui.js
import { formatDate } from "./utils.js";

export function renderTasks(tasks, { filter, search }, containers) {
  const { listEl, emptyEl } = containers;

  const normalizedSearch = search.trim().toLowerCase();

  let filtered = tasks;
  if (filter === "active") {
    filtered = filtered.filter((t) => !t.completed);
  } else if (filter === "completed") {
    filtered = filtered.filter((t) => t.completed);
  }
  if (normalizedSearch) {
    filtered = filtered.filter((t) =>
      t.text.toLowerCase().includes(normalizedSearch)
    );
  }

  listEl.innerHTML = "";

  if (!filtered.length) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";

  filtered
    .sort((a, b) => a.order - b.order)
    .forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item${task.completed ? " completed" : ""}`;
      li.draggable = true;
      li.dataset.id = task.id;

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.className = "task-checkbox";
      li.appendChild(checkbox);

      // Main
      const main = document.createElement("div");
      main.className = "task-main";

      const spanText = document.createElement("span");
      spanText.className = "task-text";
      spanText.textContent = task.text;
      spanText.title = "Double click to edit";
      main.appendChild(spanText);

      const meta = document.createElement("div");
      meta.className = "task-meta";
      meta.textContent = `Due: ${formatDate(task.dueDate)} · Created: ${formatDate(
        task.createdAt
      )}`;
      main.appendChild(meta);

      li.appendChild(main);

      // Priority
      const priorityBadge = document.createElement("span");
      priorityBadge.className = `task-priority priority-${task.priority}`;
      priorityBadge.textContent = task.priority;
      li.appendChild(priorityBadge);

      // Actions
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "icon-btn";
      editBtn.textContent = "✏️";
      editBtn.title = "Edit task";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "icon-btn";
      deleteBtn.textContent = "🗑";
      deleteBtn.title = "Delete task";

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      li.appendChild(actions);

      listEl.appendChild(li);
    });
}

export function updateStats(tasks, statEls) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  statEls.total.textContent = total;
  statEls.completed.textContent = completed;
  statEls.active.textContent = active;
}

export function setActiveFilterButton(filterButtons, currentFilter) {
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}
