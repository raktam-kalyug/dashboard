import { Storage }
from "./storage.js";

const MODES = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

let currentMode = "focus";
let timer = MODES[currentMode];
let interval = null;
let sessionsCompleted = 0;

// SVG Ring constants
const RING_RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ===============================
// TIMER UI
// ===============================

function renderTimer() {
  const display = document.getElementById("pomodoroDisplay");
  const ring = document.getElementById("pomodoroRing");
  const sessionLabel = document.getElementById("pomodoroSession");
  const phaseLabel = document.getElementById("pomodoroPhase");

  if (!display) return;

  // Update Text
  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");
  display.textContent = `${mins}:${secs}`;

  // Update Ring
  if (ring) {
    const total = MODES[currentMode];
    const progress = timer / total;
    const offset = CIRCUMFERENCE * (1 - progress);
    ring.style.strokeDasharray = CIRCUMFERENCE;
    ring.style.strokeDashoffset = offset;
  }

  // Update Labels
  if (sessionLabel) sessionLabel.textContent = (sessionsCompleted % 4) + 1;
  if (phaseLabel) {
    const labels = { focus: "Focus time", short: "Short break", long: "Long break" };
    phaseLabel.textContent = labels[currentMode];
  }
}

// ===============================
// SESSION LOGGING
// ===============================

function logSession() {
  if (currentMode !== "focus") return;

  const sessions = Storage.get(Storage.KEYS.SESSIONS, []);
  sessions.push({
    type: "focus",
    duration: MODES.focus,
    timestamp: new Date().toISOString()
  });
  Storage.set(Storage.KEYS.SESSIONS, sessions);
  
  sessionsCompleted++;
}

// ===============================
// NOTIFICATIONS
// ===============================

function notify() {
  // Visual feedback
  document.body.classList.add("session-complete-flash");
  setTimeout(() => document.body.classList.remove("session-complete-flash"), 1000);

  // Audio feedback (using a clean system-like ping)
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  audio.volume = 0.4;
  audio.play().catch(() => console.log("Audio play blocked by browser"));
}

// ===============================
// START / STOP / TRANSITION
// ===============================

function startTimer() {
  if (interval) {
    pauseTimer();
    return;
  }

  const startBtn = document.getElementById("pomodoroStart");
  if (startBtn) startBtn.textContent = "⏸ Pause";
  
  document.body.classList.add("is-running");

  interval = setInterval(() => {
    timer--;
    renderTimer();

    if (timer <= 0) {
      handleSessionEnd();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(interval);
  interval = null;
  
  const startBtn = document.getElementById("pomodoroStart");
  if (startBtn) startBtn.textContent = "▶ Start";
  
  document.body.classList.remove("is-running");
}

function handleSessionEnd() {
  pauseTimer();
  notify();
  logSession();

  // Automatic transition
  if (currentMode === "focus") {
    if (sessionsCompleted % 4 === 0) {
      switchMode("long");
    } else {
      switchMode("short");
    }
  } else {
    switchMode("focus");
  }
}

function resetTimer() {
  pauseTimer();
  timer = MODES[currentMode];
  renderTimer();
}

function switchMode(mode) {
  currentMode = mode;
  timer = MODES[currentMode];
  
  // Update Tabs UI
  document.querySelectorAll(".pomo-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  renderTimer();
}

// ===============================
// INITIALIZATION
// ===============================

function initPomodoro() {
  const startBtn = document.getElementById("pomodoroStart");
  const resetBtn = document.getElementById("pomodoroReset");
  const tabs = document.querySelectorAll(".pomo-tab");

  startBtn?.addEventListener("click", startTimer);
  resetBtn?.addEventListener("click", resetTimer);

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      switchMode(tab.dataset.mode);
    });
  });

  renderTimer();
}

function initQuickNotes() {
  const noteArea = document.getElementById("quickNoteArea");
  const saveStatus = document.getElementById("quickNoteSaveStatus");

  if (!noteArea) return;

  noteArea.value = Storage.get(Storage.KEYS.NOTES, noteArea.value);

  let saveTimeout;
  noteArea.addEventListener("input", () => {
    saveStatus.textContent = "Saving...";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      Storage.set(Storage.KEYS.NOTES, noteArea.value);
      saveStatus.textContent = "Auto-saved";
    }, 1000);
  });
}

function renderQuickTasks() {
  const list = document.getElementById("quickTaskList");
  if (!list) return;

  const tasks = Storage.get(Storage.KEYS.TASKS, []);
  // Only show the top 5 most recent incomplete tasks + recent completed ones
  const displayedTasks = tasks.slice(-5); 

  list.innerHTML = displayedTasks.map(task => `
    <li class="quick-task ${task.status === 'done' ? 'done' : ''}" data-id="${task.id}">
      <input type="checkbox" class="task-cb" id="cb-${task.id}" ${task.status === 'done' ? 'checked' : ''} />
      <label for="cb-${task.id}" class="task-cb-label"></label>
      <div class="task-text-wrap">
        <span class="task-text">${task.title}</span>
        <span class="task-due">${task.due || 'No deadline'}</span>
      </div>
      <span class="task-priority-dot ${task.priority || 'medium'}"></span>
    </li>
  `).join("");

  // Re-bind events
  list.querySelectorAll(".task-cb").forEach(cb => {
    cb.addEventListener("change", (e) => {
      const id = e.target.closest(".quick-task").dataset.id;
      toggleTaskStatus(id);
    });
  });
}

function toggleTaskStatus(id) {
  const tasks = Storage.get(Storage.KEYS.TASKS, []);
  const task = tasks.find(t => String(t.id) === String(id));
  if (task) {
    task.status = task.status === "done" ? "todo" : "done";
    Storage.set(Storage.KEYS.TASKS, tasks);
    renderQuickTasks();
    updateTasksCounter();
    updateTaskStats();
  }
}

function addQuickTask() {
  const input = document.getElementById("addTaskInput");
  const title = input?.value.trim();
  if (!title) return;

  const tasks = Storage.get(Storage.KEYS.TASKS, []);
  const newTask = {
    id: Date.now(),
    title: title,
    status: "todo",
    priority: "medium",
    due: "Today",
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  Storage.set(Storage.KEYS.TASKS, tasks);
  
  input.value = "";
  renderQuickTasks();
  updateTasksCounter();
  updateTaskStats();
}

function updateTasksCounter() {
  const counter = document.getElementById("tasksToday");
  if (!counter) return;
  const tasks = Storage.get(Storage.KEYS.TASKS, []);
  const pending = tasks.filter(t => t.status !== "done").length;
  counter.textContent = `${pending} task${pending !== 1 ? 's' : ''}`;
}

function updateTaskStats() {
  const tasks = Storage.get(Storage.KEYS.TASKS, []);
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const statNumber = document.querySelector("#statTasksDone .stat-number");
  const statTrend = document.querySelector("#statTasksDone .stat-trend");
  const statBar = document.querySelector("#statTasksDone .stat-bar-fill");

  if (statNumber) statNumber.textContent = `${pct}%`;
  if (statTrend) statTrend.textContent = `${done}/${total} done`;
  if (statBar) statBar.style.setProperty("--pct", `${pct}%`);
}

function initQuickTasks() {
  const addBtn = document.getElementById("addTaskBtn");
  const input = document.getElementById("addTaskInput");

  addBtn?.addEventListener("click", addQuickTask);
  input?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addQuickTask();
  });

  renderQuickTasks();
  updateTasksCounter();
  updateTaskStats();
}


function renderHabits() {
  const list = document.getElementById("habitList");
  if (!list) return;

  let habits = Storage.get("spd_habits", null);
  if (!habits) {
    habits = [
      { id: 1, name: "Morning revision", streak: 7, done: true },
      { id: 2, name: "30 min physical activity", streak: 4, done: true },
      { id: 3, name: "Read for 20 minutes", streak: 12, done: true },
      { id: 4, name: "No phone before 9 AM", streak: 3, done: true },
      { id: 5, name: "Drink 2L water", streak: 0, done: false }
    ];
    Storage.set("spd_habits", habits);
  }

  list.innerHTML = habits.map(habit => `
    <li class="habit-item ${habit.done ? 'done' : ''}" data-id="${habit.id}">
      <button class="habit-check" aria-label="Toggle">${habit.done ? '✓' : '○'}</button>
      <div class="habit-info">
        <span class="habit-name">${habit.name}</span>
        <span class="habit-streak">${habit.streak > 0 ? `🔥 ${habit.streak} days` : '— 0 days'}</span>
      </div>
    </li>
  `).join("");

  // Bind events
  list.querySelectorAll(".habit-check").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".habit-item").dataset.id;
      toggleHabit(id);
    });
  });

  updateHabitStats(habits);
}

function toggleHabit(id) {
  const habits = Storage.get("spd_habits", []);
  const habit = habits.find(h => String(h.id) === String(id));
  if (habit) {
    habit.done = !habit.done;
    if (habit.done) habit.streak++;
    else habit.streak = Math.max(0, habit.streak - 1);
    
    Storage.set("spd_habits", habits);
    renderHabits();
  }
}

function updateHabitStats(habits) {
  const badge = document.getElementById("habitBadge");
  const statVal = document.querySelector("#statHabits .stat-number");
  const statBar = document.querySelector("#statHabits .stat-bar-fill");

  const total = habits.length;
  const done = habits.filter(h => h.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  if (badge) badge.textContent = `${done}/${total} done`;
  if (statVal) statVal.textContent = `${pct}%`;
  if (statBar) statBar.style.setProperty("--pct", `${pct}%`);
}

function initHabits() {
  renderHabits();
}

function renderDashSubjects() {
  const list = document.getElementById("dashSyllabusList");
  if (!list) return;

  function countProgress(node) {
    if (!node.children || node.children.length === 0) {
      return { total: 1, done: node.done ? 1 : 0 };
    }
    let t = 0; let d = 0;
    node.children.forEach(c => {
      const res = countProgress(c);
      t += res.total;
      d += res.done;
    });
    return { total: t, done: d };
  }

  let subjects = Storage.get("spd_subjects", null);
  if (!subjects) {
    subjects = [
      { 
        id: 101, name: "Data Structures", 
        children: [
          { id: "c1", name: "Arrays", done: true, children: [] },
          { id: "c2", name: "Linked Lists", done: true, children: [] },
          { id: "c3", name: "Trees & Graphs", done: false, children: [] }
        ] 
      },
      { 
        id: 102, name: "Web Engineering", 
        children: [
          { id: "c4", name: "HTML/CSS Basics", done: true, children: [] },
          { id: "c5", name: "JavaScript DOM", done: true, children: [] },
          { id: "c6", name: "React Framework", done: false, children: [] }
        ] 
      }
    ];
    Storage.set("spd_subjects", subjects);
  }

  if(subjects.length === 0) {
    list.innerHTML = "<p class='page-sub'>No subjects tracked.</p>";
    return;
  }

  list.innerHTML = subjects.map(subj => {
    let t = 0; let d = 0;
    if (subj.children && subj.children.length > 0) {
      subj.children.forEach(c => {
        const res = countProgress(c);
        t += res.total;
        d += res.done;
      });
    } else {
       // Support legacy format if it exists during transition
       if (subj.topics) {
         t = subj.topics.length;
         d = subj.topics.filter(x => x.done).length;
       }
    }
    const pct = t > 0 ? Math.round((d / t) * 100) : 0;
    
    return `
      <div class="calendar-panel" style="padding: 12px; background: var(--panel-soft); border-radius: var(--radius-sm); border: 1px solid var(--line);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <strong style="font-size: 0.95rem;">${subj.name}</strong>
          <span style="font-size: 0.85rem; color: var(--muted);">${d}/${t}</span>
        </div>
        <div style="height: 6px; background: var(--line); border-radius: 99px; overflow: hidden;">
          <div style="height: 100%; width: ${pct}%; background: var(--accent); border-radius: 99px;"></div>
        </div>
      </div>
    `;
  }).join("");
}


document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("page-dashboard")) return;

  initPomodoro();
  initQuickNotes();
  initQuickTasks();
  initHabits();
  renderDashSubjects();
});
