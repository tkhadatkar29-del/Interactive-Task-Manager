// js/storage.js

const STORAGE_KEY = "tasks_v1";
const THEME_KEY = "task_theme_v1";

export function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function clearTasks() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportTasks(tasks) {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importTasksFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) {
          reject(new Error("Invalid tasks file"));
        } else {
          resolve(data);
        }
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.readAsText(file);
  });
}

// Theme persistence

export function loadTheme() {
  return localStorage.getItem(THEME_KEY) || "light";
}

export function saveTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
