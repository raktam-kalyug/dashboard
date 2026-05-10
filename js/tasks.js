import { Storage } from "./storage.js";

const TASK_KEY = Storage.KEYS.TASKS;
const STATUSES = ["todo", "inprogress", "done"];
const PRIORITY_ORDER = {
  high: 1,
  medium: 2,
  low: 3
};

let draggedTaskId = null;
let activeFilter = "all";
let activeSort = "date";
let editingTaskId = null;

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

function toDateInput(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function getDefaultTasks() {
  return [
    {
      id: "task-1",
      title: "Linear Algebra - Assignment 3",
      desc: "Complete problem set on eigenvalues and eigenvectors. Q1-Q12.",
      subject: "Mathematics",
      priority: "high",
      due: toDateInput(-1),
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-2",
      title: "Lab Report - Experiment 06",
      desc: "Write up the JavaScript lab report with screenshots and explanation.",
      subject: "Web Design",
      priority: "high",
      due: toDateInput(0),
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-3",
      title: "Revise Graph Traversal (BFS/DFS)",
      desc: "Exam in 3 days. Cover BFS, DFS, shortest path algorithms.",
      subject: "Algorithms",
      priority: "medium",
      due: toDateInput(3),
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-4",
      title: "Update GitHub portfolio README",
      desc: "Add new projects and fix broken image links.",
      subject: "Personal",
      priority: "low",
      due: "",
      status: "todo",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-5",
      title: "FocusDesk - HTML Phase 1",
      desc: "Build HTML structure for all 5 pages of the dashboard project.",
      subject: "Project",
      priority: "high",
      due: toDateInput(1),
      status: "inprogress",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-6",
      title: "Practice - Linked Lists in C",
      desc: "Implement singly and doubly linked list, insertion and deletion.",
      subject: "Data Structures",
      priority: "medium",
      due: toDateInput(5),
      status: "inprogress",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-7",
      title: "Assignment 2 - File I/O and OOP",
      desc: "Finish remaining 4 questions on file handling and class design.",
      subject: "Python",
      priority: "medium",
      due: toDateInput(7),
      status: "inprogress",
      createdAt: new Date().toISOString()
    },
    {
      id: "task-8",
      title: "Portfolio - CSS Lab 3 (Animations)",
      desc: "Implemented Grid, Flexbox, gradients, keyframe animations.",
      subject: "Web Design",
      priority: "low",
      due: toDateInput(-4),
      status: "done",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    },
    {
      id: "task-9",
      title: "Assignment 2 - Vector Spaces",
      desc: "All questions on subspaces and basis completed and submitted.",
      subject: "Mathematics",
      priority: "medium",
      due: toDateInput(-6),
      status: "done",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    },
    {
      id: "task-10",
      title: "Lab 5 - Pointers and Arrays",
      desc: "Completed all exercises, submitted report with output screenshots.",
      subject: "C Programming",
      priority: "low",
      due: toDateInput(-8),
      status: "done",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
  ];
}

function readTasks() {
  try {
    const rawTasks = localStorage.getItem(TASK_KEY);

    if (!rawTasks) {
      const defaults = getDefaultTasks();
      Storage.set(TASK_KEY, defaults);
      return defaults;
    }

    const tasks = JSON.parse(rawTasks);
    return Array.isArray(tasks) ? tasks.map(normalizeTask) : [];
  } catch {
    const defaults = getDefaultTasks();
    Storage.set(TASK_KEY, defaults);
    return defaults;
  }
}

function saveTasks(tasks) {
  Storage.set(TASK_KEY, tasks.map(normalizeTask));
}

function normalizeTask(task) {
  return {
    id: task.id || Date.now().toString(),
    title: task.title || "Untitled task",
    desc: task.desc || "",
    subject: task.subject || "Personal",
    priority: ["high", "medium", "low"].includes(task.priority)
      ? task.priority
      : "medium",
    due: task.due || "",
    status: STATUSES.includes(task.status) ? task.status : "todo",
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completedAt || ""
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "No deadline";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function isToday(value) {
  return value === toDateInput(0);
}

function isOverdue(task) {
  return Boolean(
    task.due &&
    task.due < toDateInput(0) &&
    task.status !== "done"
  );
}

function getFilteredTasks(tasks) {
  return tasks.filter((task) => {
    if (activeFilter === "today") return isToday(task.due);
    if (activeFilter === "pending") return task.status !== "done";
    if (activeFilter === "done") return task.status === "done";
    if (activeFilter === "high") return task.priority === "high";
    return true;
  });
}

function getSortedTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (activeSort === "priority") {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    }

    if (activeSort === "subject") {
      return a.subject.localeCompare(b.subject);
    }

    const aDue = a.due || "9999-12-31";
    const bDue = b.due || "9999-12-31";
    return aDue.localeCompare(bDue);
  });
}

function createTaskCard(task) {
  const card = document.createElement("article");
  const isDone = task.status === "done";
  const dueText = isDone && task.completedAt
    ? `Completed ${formatDate(task.completedAt.slice(0, 10))}`
    : `Due: ${formatDate(task.due)}`;

  card.className = [
    "task-card",
    `priority-${task.priority}`,
    isDone ? "done is-done" : "",
    isOverdue(task) ? "is-overdue" : ""
  ].filter(Boolean).join(" ");

  card.draggable = true;
  card.dataset.id = task.id;

  card.innerHTML = `
    <div class="task-card-top">
      <span class="task-subject-tag">${escapeHtml(task.subject)}</span>
      ${isDone
        ? `<span class="done-check">✓</span>`
        : `<span class="priority-tag ${escapeHtml(task.priority)}">${escapeHtml(task.priority)}</span>`}
    </div>
    <h4 class="task-card-title">${escapeHtml(task.title)}</h4>
    ${task.desc ? `<p class="task-card-desc">${escapeHtml(task.desc)}</p>` : ""}
    <div class="task-card-footer">
      <span class="task-card-due ${isDone ? "done-label" : ""}">${escapeHtml(dueText)}</span>
      <div class="task-card-actions">
        <button class="tca-btn tca-edit" type="button" data-action="edit" aria-label="Edit">✎</button>
        <button class="tca-btn tca-done" type="button" data-action="done" aria-label="Mark done">${isDone ? "↺" : "✓"}</button>
        <button class="tca-btn tca-delete" type="button" data-action="delete" aria-label="Delete">✕</button>
      </div>
    </div>
  `;

  return card;
}

function renderBoard() {
  const allTasks = readTasks();
  const visibleTasks = getSortedTasks(getFilteredTasks(allTasks));
  const columns = {
    todo: qs("#colBodyTodo"),
    inprogress: qs("#colBodyInProgress"),
    done: qs("#colBodyDone")
  };

  const visibleCounts = {
    todo: 0,
    inprogress: 0,
    done: 0
  };

  Object.values(columns).forEach((column) => {
    if (column) column.innerHTML = "";
  });

  visibleTasks.forEach((task) => {
    const column = columns[task.status];

    if (!column) return;

    visibleCounts[task.status] += 1;
    column.appendChild(createTaskCard(task));
  });

  Object.entries(visibleCounts).forEach(([status, count]) => {
    const id = status === "inprogress" ? "countInProgress" : `count${capitalize(status)}`;
    const countEl = document.getElementById(id);

    if (countEl) countEl.textContent = count;
  });

  renderEmptyStates(columns);
  updateOverview(allTasks);
}

function renderEmptyStates(columns) {
  Object.values(columns).forEach((column) => {
    if (!column || column.children.length > 0) return;

    const empty = document.createElement("p");
    empty.className = "task-empty-state";
    empty.textContent = "No tasks here";
    column.appendChild(empty);
  });
}

function updateOverview(tasks) {
  const total = tasks.length;
  const done = tasks.filter((task) => task.status === "done").length;
  const overdue = tasks.filter(isOverdue).length;
  const pending = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  setText("#ovTotal", total);
  setText("#ovDone", done);
  setText("#ovPending", pending);
  setText("#ovOverdue", overdue);
  setText(".task-ov-pct", `${pct}% complete`);
  qs("#ovFill")?.style.setProperty("--pct", `${pct}%`);
}

function setText(selector, value) {
  const element = qs(selector);

  if (element) element.textContent = value;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function updateTaskStatus(id, status) {
  const tasks = readTasks();
  const task = tasks.find((item) => String(item.id) === String(id));

  if (!task || !STATUSES.includes(status)) return;

  task.status = status;
  task.completedAt = status === "done" ? new Date().toISOString() : "";
  saveTasks(tasks);
  renderBoard();
}

function toggleTaskStatus(id) {
  const tasks = readTasks();
  const task = tasks.find((item) => String(item.id) === String(id));

  if (!task) return;

  task.status = task.status === "done" ? "todo" : "done";
  task.completedAt = task.status === "done" ? new Date().toISOString() : "";
  saveTasks(tasks);
  renderBoard();
}

function deleteTask(id) {
  const tasks = readTasks().filter((task) => String(task.id) !== String(id));
  saveTasks(tasks);
  renderBoard();
}

function openTaskModal(task = null) {
  const modal = qs("#addTaskModal");
  const modalTitle = qs(".modal-title");
  const confirmBtn = qs("#confirmAddTask");

  editingTaskId = task?.id || null;

  if (modalTitle) modalTitle.textContent = task ? "Edit Task" : "Add New Task";
  if (confirmBtn) confirmBtn.textContent = task ? "Save Task" : "Add Task";

  qs("#newTaskTitle").value = task?.title || "";
  qs("#newTaskDesc").value = task?.desc || "";
  qs("#newTaskSubject").value = task?.subject || "Mathematics";
  qs("#newTaskPriority").value = task?.priority || "medium";
  qs("#newTaskDue").value = task?.due || "";

  modal?.classList.add("show");
  qs("#newTaskTitle")?.focus();
}

function closeTaskModal() {
  qs("#addTaskModal")?.classList.remove("show");
  editingTaskId = null;
  clearForm();
}

function clearForm() {
  qs("#newTaskTitle").value = "";
  qs("#newTaskDesc").value = "";
  qs("#newTaskSubject").value = "Mathematics";
  qs("#newTaskPriority").value = "medium";
  qs("#newTaskDue").value = "";
}

function saveTaskFromForm() {
  const titleInput = qs("#newTaskTitle");
  const title = titleInput?.value.trim();

  if (!title) {
    titleInput?.focus();
    titleInput?.classList.add("input-error");
    return;
  }

  titleInput.classList.remove("input-error");

  const tasks = readTasks();
  const payload = {
    title,
    desc: qs("#newTaskDesc")?.value.trim() || "",
    subject: qs("#newTaskSubject")?.value || "Personal",
    priority: qs("#newTaskPriority")?.value || "medium",
    due: qs("#newTaskDue")?.value || ""
  };

  if (editingTaskId) {
    const task = tasks.find((item) => String(item.id) === String(editingTaskId));

    if (task) {
      Object.assign(task, payload);
    }
  } else {
    tasks.push({
      id: Date.now().toString(),
      ...payload,
      status: "todo",
      createdAt: new Date().toISOString(),
      completedAt: ""
    });
  }

  saveTasks(tasks);
  closeTaskModal();
  renderBoard();
}

function initBoardEvents() {
  const board = qs("#taskBoard");

  board?.addEventListener("dragstart", (event) => {
    const card = event.target.closest(".task-card");

    if (!card) return;

    draggedTaskId = card.dataset.id;
    card.classList.add("is-dragging");
  });

  board?.addEventListener("dragend", (event) => {
    event.target.closest(".task-card")?.classList.remove("is-dragging");
    draggedTaskId = null;
  });

  board?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    const card = event.target.closest(".task-card");

    if (!button || !card) return;

    const action = button.dataset.action;
    const taskId = card.dataset.id;

    if (action === "done") toggleTaskStatus(taskId);
    if (action === "delete") deleteTask(taskId);
    if (action === "edit") {
      const task = readTasks().find((item) => String(item.id) === String(taskId));
      if (task) openTaskModal(task);
    }
  });

  qsa(".task-col-body").forEach((column) => {
    const status = getColumnStatus(column);

    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", () => {
      if (draggedTaskId && status) {
        updateTaskStatus(draggedTaskId, status);
      }
    });
  });
}

function getColumnStatus(column) {
  if (column.id === "colBodyTodo") return "todo";
  if (column.id === "colBodyInProgress") return "inprogress";
  if (column.id === "colBodyDone") return "done";
  return "";
}

function initFilters() {
  qsa(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";

      qsa(".filter-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderBoard();
    });
  });
}

function initSorting() {
  qs("#taskSort")?.addEventListener("change", (event) => {
    activeSort = event.target.value;
    renderBoard();
  });
}

function initTaskModal() {
  qs("#openAddTask")?.addEventListener("click", () => openTaskModal());
  qs("#closeAddTask")?.addEventListener("click", closeTaskModal);
  qs("#cancelAddTask")?.addEventListener("click", closeTaskModal);
  qs("#confirmAddTask")?.addEventListener("click", saveTaskFromForm);
  qs("#addTaskModal")?.addEventListener("click", (event) => {
    if (event.target.id === "addTaskModal") closeTaskModal();
  });
  qs("#newTaskTitle")?.addEventListener("input", (event) => {
    event.target.classList.remove("input-error");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("page-tasks")) return;

  initBoardEvents();
  initFilters();
  initSorting();
  initTaskModal();
  renderBoard();
});
