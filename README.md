
Project Overview
The Interactive Task Manager is a browser‑based web application that helps users capture, organize, and track daily tasks using a clean, responsive interface. Its main objectives are to practice core JavaScript fundamentals (DOM manipulation, events, array methods, and localStorage) and to provide a practical tool for managing tasks with filters, statistics, drag‑and‑drop ordering, and dark/light theme support.​

Setup Instructions
Clone the repository

bash
git clone https://github.com/<tkhadatkar29-del>/Interactive-Task-Manager.git
cd Interactive-Task-Manager
Open the project

Option A: Open index.html directly in your browser (double‑click the file).

Option B: Open the folder in VS Code → install Live Server → right‑click index.html → Open with Live Server to get auto‑reload on save.​

Using a Node.js static server 

bash
npx serve .
# or
npx http-server -c-1 -o
Then open the provided http://localhost:... URL in your browser.​

Code Structure

interactive-task-manager/
│── index.html          # Main HTML layout and containers
│── css/
│   ├── style.css       # Layout, components, responsive design
│   └── theme.css       # Dark/light theme overrides via CSS variables
│── js/
│   ├── app.js          # TaskManager class, event wiring, app logic (ES module)
│   ├── storage.js      # localStorage + export/import + theme persistence
│   ├── ui.js           # DOM rendering for tasks, filters, statistics
│   └── utils.js        # Helpers (ID generation, date formatting, keyboard)
│── README.md           # Project documentation
└── .gitignore          # Ignored files (node_modules, system files)

Visual Documentation (Screenshots)

screenshots/01-main-light.png – Main view in light theme with several tasks.

screenshots/02-completed-filter.png – Completed filter showing done tasks.

screenshots/03-drag-drop.png – Drag‑and‑drop reordering in progress.

screenshots/04-dark-theme.png – Dark mode view with tasks and statistics visible.

## Visual Documentation

Main dashboard (light theme):

![Task Manager - Light](screenshots/01-main-light.png)

Completed tasks filter:

![Task Manager - Completed](screenshots/02-completed-filter.png)

Drag and drop reordering:

![Task Manager - Drag & Drop](screenshots/03-drag-drop.png)

Dark theme:

![Task Manager - Dark](screenshots/04-dark-theme.png)​

Technical Details
Architecture

Pure front‑end application (no backend), built with HTML, CSS, and vanilla JavaScript.

Uses ES modules: app.js is the entry point and imports storage.js, ui.js, and utils.js.​

All state is kept in an in‑memory tasks array and synchronized to localStorage for persistence across reloads.​

Data structures

Each task is stored as a plain object:

js
{
  id: string,               // unique identifier
  text: string,             // task description
  completed: boolean,       // completion flag
  createdAt: string,        // ISO timestamp
  dueDate: string | null,   // optional ISO date
  priority: "low" | "medium" | "high",
  order: number             // used for drag-and-drop ordering
}
Tasks are saved as a JSON array under a single key in localStorage (e.g., "tasks_v1"). Filtering and searching are implemented using array methods (filter, sort, map), and the UI is updated by re‑rendering the list using DOM APIs (createElement, appendChild).​

Algorithms / behavior

Filtering: filter by completed flag (All, Active, Completed) and optional text search (case‑insensitive substring match on text).

Ordering: drag‑and‑drop reordering updates the order field based on list position; tasks are sorted by order before rendering.

Theme: dark/light theme uses CSS custom properties; the current theme is persisted in localStorage and reapplied on load.​

Testing Evidence (Examples of Test Cases)

## Testing Evidence

Below are sample manual test cases used to validate core functionality.

1. Add Task – Valid Input  
   - **Precondition:** App is open, input field is empty.  
   - **Steps:**  
     1. Type "Buy groceries" into the task input.  
     2. Select priority "High".  
     3. Click "Add Task" or press Enter.  
   - **Expected Result:**  
     - New task appears in the list with text "Buy groceries".  
     - Task is marked as active (checkbox unchecked).  
     - Total count increases by 1; Active count increases by 1; Completed is unchanged.

2. Add Task – Invalid Short Text  
   - **Precondition:** App is open.  
   - **Steps:**  
     1. Type "Hi" into the task input (less than 3 characters).  
     2. Click "Add Task".  
   - **Expected Result:**  
     - Task is not added to the list.  
     - An error message is shown below the form (e.g., "Task must be at least 3 characters.").  
     - Statistics remain unchanged.

3. Mark Task as Completed  
   - **Precondition:** At least one active task exists.  
   - **Steps:**  
     1. Click the checkbox of an active task.  
   - **Expected Result:**  
     - Task text shows strike‑through styling.  
     - Completed count increases by 1; Active count decreases by 1.  
     - Task remains visible in the "All" filter and in the "Completed" filter.

4. Filter Tasks (Active / Completed)  
   - **Precondition:** List has at least one active and one completed task.  
   - **Steps:**  
     1. Click "Active" filter.  
     2. Click "Completed" filter.  
     3. Click "All" filter.  
   - **Expected Result:**  
     - "Active": only tasks with checkbox unchecked are shown.  
     - "Completed": only tasks with checkbox checked are shown.  
     - "All": both active and completed tasks are shown.

5. Drag & Drop Reordering  
   - **Precondition:** At least three tasks exist.  
   - **Steps:**  
     1. Drag the third task and drop it at the top of the list.  
     2. Refresh the page.  
   - **Expected Result:**  
     - Task appears at the top immediately after drop.  
     - After refresh, the order is preserved (dragged task is still first).

6. Theme Toggle Persistence  
   - **Precondition:** App is open in default (light) theme.  
   - **Steps:**  
     1. Click the theme toggle to switch to dark mode.  
     2. Refresh the page.  
   - **Expected Result:**  
     - Dark theme remains active after reload.  
     - Text and controls keep readable contrast in dark mode.

7. localStorage Persistence  
   - **Precondition:** No tasks or a known set of tasks.  
   - **Steps:**  
     1. Add two tasks.  
     2. Mark one as completed.  
     3. Close the tab and reopen the app.  
   - **Expected Result:**  
     - Both tasks are still present.  
     - Completed/active state is preserved.  
     - Statistics match the previous state.

8. Clear Completed Tasks  
   - **Precondition:** At least one completed task and at least one active task exist.  
   - **Steps:**  
     1. Click "Clear Completed".  
   - **Expected Result:**  
     - All completed tasks are removed from the list and from localStorage.  
     - Active tasks remain unchanged.  
     - Completed count becomes 0; Total count decreases accordingly.
