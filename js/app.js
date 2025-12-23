// js/app.js
import {
  loadTasks,
  saveTasks,
  exportTasks,
  importTasksFromFile,
  loadTheme,
  saveTheme,
} from "./storge.js";
import { createId, isCtrlShiftC } from "./utils.js";
import { renderTasks, updateStats, setActiveFilterButton } from "./ui.js";

class TaskManager {
  constructor() {
    this.tasks = [];
    this.filter = "all";
    this.search = "";
    this.draggedId = null;

    this.cacheElements();
    this.bindEvents();
    this.initTheme();
    this.loadInitialTasks();
    this.render();
  }

  cacheElements() {
    this.body = document.body;
    this.form = document.getElementById("taskForm");
    this.input = document.getElementById("taskInput");
    this.dueInput = document.getElementById("taskDue");
    this.prioritySelect = document.getElementById("taskPriority");
    this.formError = document.getElementById("formError");

    this.filterButtons = Array.from(
      document.querySelectorAll(".filter-btn")
    );
    this.searchInput = document.getElementById("searchInput");
    this.clearCompletedBtn = document.getElementById("clearCompletedBtn");

    this.taskList = document.getElementById("taskList");
    this.emptyState = document.getElementById("emptyState");

    this.totalEl = document.getElementById("totalTasks");
    this.activeEl = document.getElementById("activeTasks");
    this.completedEl = document.getElementById("completedTasks");

    this.exportBtn = document.getElementById("exportBtn");
    this.importFile = document.getElementById("importFile");
    this.themeToggle = document.getElementById("themeToggle");
  }

  bindEvents() {
    // Add task
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAddTask();
    });

    // Filters
    this.filterButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        this.filter = btn.dataset.filter;
        setActiveFilterButton(this.filterButtons, this.filter);
        this.render();
      })
    );

    // Search
    this.searchInput.addEventListener("input", () => {
      this.search = this.searchInput.value;
      this.render();
    });

    // Clear completed
    this.clearCompletedBtn.addEventListener("click", () => {
      this.tasks = this.tasks.filter((t) => !t.completed);
      this.persistAndRender();
    });

    // Delegated events for list: checkbox, edit, delete, drag
    this.taskList.addEventListener("click", (e) => {
      const li = e.target.closest(".task-item");
      if (!li) return;
      const id = li.dataset.id;

      if (e.target.matches(".task-checkbox")) {
        this.toggleComplete(id, e.target.checked);
      } else if (e.target.textContent === "🗑") {
        this.deleteTask(id);
      } else if (e.target.textContent === "✏️") {
        this.editTask(id);
      }
    });

    this.taskList.addEventListener("dblclick", (e) => {
      const li = e.target.closest(".task-item");
      if (!li) return;
      if (e.target.classList.contains("task-text")) {
        this.editTask(li.dataset.id);
      }
    });

    // Drag & drop
    this.taskList.addEventListener("dragstart", (e) => {
      const li = e.target.closest(".task-item");
      if (!li) return;
      this.draggedId = li.dataset.id;
      li.classList.add("dragging");
    });

    this.taskList.addEventListener("dragend", (e) => {
      const li = e.target.closest(".task-item");
      if (li) li.classList.remove("dragging");
      this.draggedId = null;
    });

    this.taskList.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = this.getDragAfterElement(e.clientY);
      const draggingEl = this.taskList.querySelector(".dragging");
      if (!draggingEl) return;

      if (afterElement == null) {
        this.taskList.appendChild(draggingEl);
      } else {
        this.taskList.insertBefore(draggingEl, afterElement);
      }
    });

    this.taskList.addEventListener("drop", () => {
      this.updateOrderFromDOM();
      this.persistAndRender(false); // already re-ordered visually
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (isCtrlShiftC(e)) {
        e.preventDefault();
        this.tasks = this.tasks.filter((t) => !t.completed);
        this.persistAndRender();
      }
    });

    // Backup / restore
    this.exportBtn.addEventListener("click", () => {
      exportTasks(this.tasks);
    });

    this.importFile.addEventListener("change", async () => {
      const file = this.importFile.files[0];
      if (!file) return;
      try {
        const imported = await importTasksFromFile(file);
        this.tasks = imported.map((t) => ({
          id: t.id || createId(),
          text: String(t.text || "").trim(),
          completed: Boolean(t.completed),
          createdAt: t.createdAt || new Date().toISOString(),
          dueDate: t.dueDate || null,
          priority: t.priority || "medium",
          order: typeof t.order === "number" ? t.order : Date.now(),
        }));
        this.persistAndRender();
      } catch (err) {
        alert(err.message);
      } finally {
        this.importFile.value = "";
      }
    });

    // Theme toggle
    this.themeToggle.addEventListener("click", () => {
      const isDark = this.body.classList.toggle("dark-theme");
      if (isDark) {
        this.body.classList.remove("light-theme");
        this.themeToggle.textContent = "☀️";
        saveTheme("dark");
      } else {
        this.body.classList.add("light-theme");
        this.themeToggle.textContent = "🌙";
        saveTheme("light");
      }
    });
  }

  initTheme() {
    const stored = loadTheme();
    if (stored === "dark") {
      this.body.classList.add("dark-theme");
      this.themeToggle.textContent = "☀️";
    } else {
      this.body.classList.add("light-theme");
      this.themeToggle.textContent = "🌙";
    }
  }

  loadInitialTasks() {
    const loaded = loadTasks();
    this.tasks =
      loaded && Array.isArray(loaded)
        ? loaded.map((t, index) => ({
            id: t.id || createId(),
            text: t.text || "",
            completed: Boolean(t.completed),
            createdAt: t.createdAt || new Date().toISOString(),
            dueDate: t.dueDate || null,
            priority: t.priority || "medium",
            order:
              typeof t.order === "number"
                ? t.order
                : index,
          }))
        : [];
  }

  handleAddTask() {
    const text = this.input.value.trim();
    const due = this.dueInput.value || null;
    const priority = this.prioritySelect.value;

    if (text.length < 3) {
      this.formError.textContent = "Task must be at least 3 characters.";
      this.input.focus();
      return;
    }
    this.formError.textContent = "";

    const task = {
      id: createId(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: due,
      priority,
      order: this.tasks.length ? Math.max(...this.tasks.map((t) => t.order)) + 1 : 0,
    };

    this.tasks.push(task);
    this.input.value = "";
    this.dueInput.value = "";
    this.prioritySelect.value = priority;
    this.persistAndRender();
  }

  toggleComplete(id, isCompleted) {
    this.tasks = this.tasks.map((t) =>
      t.id === id ? { ...t, completed: isCompleted } : t
    );
    this.persistAndRender();
  }

  deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.persistAndRender();
  }

  editTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    const nextText = prompt("Edit task:", task.text);
    if (nextText === null) return;
    const trimmed = nextText.trim();
    if (!trimmed) {
      alert("Task text cannot be empty.");
      return;
    }
    this.tasks = this.tasks.map((t) =>
      t.id === id ? { ...t, text: trimmed } : t
    );
    this.persistAndRender();
  }

  getDragAfterElement(y) {
    const draggableElements = [
      ...this.taskList.querySelectorAll(".task-item:not(.dragging)"),
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  updateOrderFromDOM() {
    const idsInOrder = [...this.taskList.children].map(
      (li) => li.dataset.id
    );
    this.tasks = this.tasks.map((t) => ({
      ...t,
      order: idsInOrder.indexOf(t.id),
    }));
  }

  persistAndRender(reorder = true) {
    saveTasks(this.tasks);
    if (reorder) {
      this.tasks.sort((a, b) => a.order - b.order);
    }
    this.render();
  }

  render() {
    renderTasks(
      this.tasks,
      { filter: this.filter, search: this.search },
      {
        listEl: this.taskList,
        emptyEl: this.emptyState,
      }
    );
    updateStats(this.tasks, {
      total: this.totalEl,
      active: this.activeEl,
      completed: this.completedEl,
    });
  }
}

// Boot
window.addEventListener("DOMContentLoaded", () => {
  new TaskManager();
});
