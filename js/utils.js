// js/utils.js

export function createId() {
  return Date.now() + Math.random().toString(16).slice(2);
}

export function formatDate(iso) {
  if (!iso) return "No due date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "No due date";
  return d.toLocaleDateString();
}

export function isCtrlShiftC(event) {
  return event.ctrlKey && event.shiftKey && (event.key === "c" || event.key === "C");
}
