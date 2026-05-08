// ══════════════════════════════════════════════
// FOCUSDESK — main.js
// Handles: clock, theme, pomodoro, tasks,
//          habits, notes autosave, modals
// ══════════════════════════════════════════════


// ── LIVE CLOCK ─────────────────────────────────
function updateClock() {
  var clockEl = document.getElementById("liveClock");
  if (!clockEl) return;
  var now = new Date();
  var h = String(now.getHours()).padStart(2, "0");
  var m = String(now.getMinutes()).padStart(2, "0");
  var s = String(now.getSeconds()).padStart(2, "0");
  clockEl.textContent = h + ":" + m + ":" + s;
}

setInterval(updateClock, 1000);
updateClock();


// ── CURRENT DATE ───────────────────────────────
function setCurrentDate() {
  var el = document.getElementById("currentDate");
  if (!el) return;
  var days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var now = new Date();
  el.textContent = days[now.getDay()] + ", " + now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();
}

setCurrentDate();


// ── GREETING ───────────────────────────────────
function setGreeting() {
  var el = document.getElementById("greetingText");
  if (!el) return;
  var h = new Date().getHours();
  var greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  el.textContent = greeting + ", Rahul.";
}

setGreeting();


// ── DARK / LIGHT THEME TOGGLE ──────────────────
var themeBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
  } else {
    document.body.classList.remove("light");
  }
}

// Load saved theme
var savedTheme = localStorage.getItem("fd-theme") || "dark";
applyTheme(savedTheme);

if (themeBtn) {
  themeBtn.addEventListener("click", function() {
    var isLight = document.body.classList.contains("light");
    var next = isLight ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("fd-theme", next);
  });
}


// ── POMODORO TIMER ─────────────────────────────
var pomoDurations = { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
var pomoMode      = "focus";
var pomoTimeLeft  = pomoDurations.focus;
var pomoRunning   = false;
var pomoInterval  = null;
var pomoSession   = 1;
var pomoTotal     = pomoDurations.focus;

var pomoDisplay = document.getElementById("pomodoroDisplay");
var pomoRing    = document.getElementById("pomodoroRing");
var pomoStart   = document.getElementById("pomodoroStart");
var pomoReset   = document.getElementById("pomodoroReset");
var pomoSess    = document.getElementById("pomodoroSession");
var pomoPhase   = document.getElementById("pomodoroPhase");

var circumference = 2 * Math.PI * 52; // r=52

function updatePomoDisplay() {
  if (!pomoDisplay) return;
  var m = Math.floor(pomoTimeLeft / 60);
  var s = pomoTimeLeft % 60;
  pomoDisplay.textContent = String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");

  if (pomoRing) {
    var progress = pomoTimeLeft / pomoTotal;
    var offset   = circumference * (1 - progress);
    pomoRing.style.strokeDasharray  = circumference;
    pomoRing.style.strokeDashoffset = offset;
  }
}

function pomoTick() {
  if (pomoTimeLeft <= 0) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    if (pomoStart) pomoStart.textContent = "▶ Start";
    // Auto-switch after focus session
    if (pomoMode === "focus") {
      if (pomoSession < 4) {
        pomoSession++;
        switchPomoMode("short");
      } else {
        pomoSession = 1;
        switchPomoMode("long");
      }
      if (pomoSess) pomoSess.textContent = pomoSession;
    } else {
      switchPomoMode("focus");
    }
    return;
  }
  pomoTimeLeft--;
  updatePomoDisplay();
}

function switchPomoMode(mode) {
  pomoMode     = mode;
  pomoTimeLeft = pomoDurations[mode];
  pomoTotal    = pomoDurations[mode];
  var labels   = { focus: "Focus time", short: "Short break", long: "Long break" };
  if (pomoPhase) pomoPhase.textContent = labels[mode];
  updatePomoDisplay();
}

if (pomoStart) {
  pomoStart.addEventListener("click", function() {
    if (pomoRunning) {
      clearInterval(pomoInterval);
      pomoRunning = false;
      pomoStart.textContent = "▶ Start";
    } else {
      pomoInterval = setInterval(pomoTick, 1000);
      pomoRunning  = true;
      pomoStart.textContent = "⏸ Pause";
    }
  });
}

if (pomoReset) {
  pomoReset.addEventListener("click", function() {
    clearInterval(pomoInterval);
    pomoRunning  = false;
    pomoTimeLeft = pomoDurations[pomoMode];
    if (pomoStart) pomoStart.textContent = "▶ Start";
    updatePomoDisplay();
  });
}

var pomoTabs = document.querySelectorAll(".pomo-tab");
pomoTabs.forEach(function(tab) {
  tab.addEventListener("click", function() {
    pomoTabs.forEach(function(t) { t.classList.remove("active"); });
    tab.classList.add("active");
    clearInterval(pomoInterval);
    pomoRunning = false;
    if (pomoStart) pomoStart.textContent = "▶ Start";
    switchPomoMode(tab.getAttribute("data-mode"));
  });
});

updatePomoDisplay();


// ── QUICK TASK CHECKBOXES ─────────────────────
var taskCheckboxes = document.querySelectorAll(".task-cb");

taskCheckboxes.forEach(function(cb) {
  cb.addEventListener("change", function() {
    var li = cb.closest(".quick-task");
    if (!li) return;
    if (cb.checked) {
      li.classList.add("done");
    } else {
      li.classList.remove("done");
    }
  });
});


// ── ADD QUICK TASK ─────────────────────────────
var addTaskInput = document.getElementById("addTaskInput");
var addTaskBtn   = document.getElementById("addTaskBtn");
var quickList    = document.getElementById("quickTaskList");

function addQuickTask() {
  if (!addTaskInput || !quickList) return;
  var val = addTaskInput.value.trim();
  if (!val) return;

  var li = document.createElement("li");
  li.className = "quick-task";
  li.setAttribute("data-priority", "medium");

  var cbId = "qt-" + Date.now();
  li.innerHTML =
    '<input type="checkbox" class="task-cb" id="' + cbId + '" />' +
    '<label for="' + cbId + '" class="task-cb-label"></label>' +
    '<div class="task-text-wrap">' +
      '<span class="task-text">' + val + '</span>' +
      '<span class="task-due">No deadline</span>' +
    '</div>' +
    '<span class="task-priority-dot medium"></span>';

  quickList.appendChild(li);

  // Bind checkbox
  var newCb = li.querySelector(".task-cb");
  newCb.addEventListener("change", function() {
    if (newCb.checked) {
      li.classList.add("done");
    } else {
      li.classList.remove("done");
    }
  });

  addTaskInput.value = "";
}

if (addTaskBtn) {
  addTaskBtn.addEventListener("click", addQuickTask);
}

if (addTaskInput) {
  addTaskInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") addQuickTask();
  });
}


// ── HABIT TRACKER TOGGLE ──────────────────────
var habitItems = document.querySelectorAll(".habit-item");

habitItems.forEach(function(item) {
  var btn = item.querySelector(".habit-check");
  if (!btn) return;
  btn.addEventListener("click", function() {
    var isDone = item.classList.contains("done");
    if (isDone) {
      item.classList.remove("done");
      btn.textContent = "○";
      btn.setAttribute("data-done", "false");
    } else {
      item.classList.add("done");
      btn.textContent = "✓";
      btn.setAttribute("data-done", "true");
    }
    updateHabitBadge();
  });
});

function updateHabitBadge() {
  var badge = document.getElementById("habitBadge");
  if (!badge) return;
  var total = document.querySelectorAll(".habit-item").length;
  var done  = document.querySelectorAll(".habit-item.done").length;
  badge.textContent = done + "/" + total + " done";
}


// ── QUICK NOTE AUTOSAVE ────────────────────────
var quickNote = document.getElementById("quickNoteArea");
var noteSaveStatus = document.getElementById("quickNoteSaveStatus");

if (quickNote) {
  var savedNote = localStorage.getItem("fd-quicknote");
  if (savedNote) quickNote.value = savedNote;

  var saveTimeout;
  quickNote.addEventListener("input", function() {
    if (noteSaveStatus) noteSaveStatus.textContent = "Saving...";
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() {
      localStorage.setItem("fd-quicknote", quickNote.value);
      if (noteSaveStatus) noteSaveStatus.textContent = "Auto-saved";
    }, 1000);
  });
}


// ── TASK PAGE: ADD TASK MODAL ─────────────────
var openAddTask    = document.getElementById("openAddTask");
var addTaskModal   = document.getElementById("addTaskModal");
var closeAddTask   = document.getElementById("closeAddTask");
var cancelAddTask  = document.getElementById("cancelAddTask");
var confirmAddTask = document.getElementById("confirmAddTask");

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("open");
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
}

if (openAddTask) {
  openAddTask.addEventListener("click", function() { openModal(addTaskModal); });
}

if (closeAddTask) {
  closeAddTask.addEventListener("click", function() { closeModal(addTaskModal); });
}

if (cancelAddTask) {
  cancelAddTask.addEventListener("click", function() { closeModal(addTaskModal); });
}

if (addTaskModal) {
  addTaskModal.addEventListener("click", function(e) {
    if (e.target === addTaskModal) closeModal(addTaskModal);
  });
}

if (confirmAddTask) {
  confirmAddTask.addEventListener("click", function() {
    var title    = document.getElementById("newTaskTitle");
    var desc     = document.getElementById("newTaskDesc");
    var subject  = document.getElementById("newTaskSubject");
    var priority = document.getElementById("newTaskPriority");
    var due      = document.getElementById("newTaskDue");

    if (!title || !title.value.trim()) {
      title.style.borderColor = "var(--red)";
      return;
    }

    var colBody = document.getElementById("colBodyTodo");
    if (!colBody) { closeModal(addTaskModal); return; }

    var p  = priority ? priority.value : "medium";
    var s  = subject  ? subject.value  : "General";
    var d  = due && due.value ? "📅 " + due.value : "📅 No deadline";
    var ds = desc && desc.value.trim() ? desc.value.trim() : "";

    var card = document.createElement("article");
    card.className = "task-card priority-" + p;
    card.setAttribute("draggable", "true");
    card.innerHTML =
      '<div class="task-card-top">' +
        '<span class="task-subject-tag">' + s + '</span>' +
        '<span class="priority-tag ' + p + '">' + p.charAt(0).toUpperCase() + p.slice(1) + '</span>' +
      '</div>' +
      '<h4 class="task-card-title">' + title.value.trim() + '</h4>' +
      (ds ? '<p class="task-card-desc">' + ds + '</p>' : '') +
      '<div class="task-card-footer">' +
        '<span class="task-card-due">' + d + '</span>' +
        '<div class="task-card-actions">' +
          '<button class="tca-btn" aria-label="Edit">✎</button>' +
          '<button class="tca-btn tca-done" aria-label="Mark done">✓</button>' +
        '</div>' +
      '</div>';

    colBody.appendChild(card);

    // Update count
    var countEl = document.getElementById("countTodo");
    if (countEl) countEl.textContent = parseInt(countEl.textContent || 0) + 1;

    // Reset
    if (title) title.value = "";
    if (desc)  desc.value  = "";
    if (due)   due.value   = "";
    closeModal(addTaskModal);
  });
}


// ── TASK PAGE: MARK DONE BUTTONS ──────────────
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("tca-done")) {
    var card = e.target.closest(".task-card");
    if (!card) return;
    card.classList.toggle("done");
  }
});


// ── TASK FILTER BUTTONS ───────────────────────
var filterBtns = document.querySelectorAll(".filter-btn");

filterBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    filterBtns.forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
  });
});


// ── TIMETABLE: ADD SLOT MODAL ─────────────────
var openAddSlot   = document.getElementById("openAddSlot");
var addSlotModal  = document.getElementById("addSlotModal");
var closeAddSlot  = document.getElementById("closeAddSlot");
var cancelAddSlot = document.getElementById("cancelAddSlot");

if (openAddSlot) {
  openAddSlot.addEventListener("click", function() { openModal(addSlotModal); });
}

if (closeAddSlot) {
  closeAddSlot.addEventListener("click", function() { closeModal(addSlotModal); });
}

if (cancelAddSlot) {
  cancelAddSlot.addEventListener("click", function() { closeModal(addSlotModal); });
}

if (addSlotModal) {
  addSlotModal.addEventListener("click", function(e) {
    if (e.target === addSlotModal) closeModal(addSlotModal);
  });
}


// ── VIEW TOGGLE (week/day) ─────────────────────
var viewBtns = document.querySelectorAll(".view-btn:not(.add-slot-btn)");

viewBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    viewBtns.forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
  });
});


// ── NOTES: FILTER TABS ────────────────────────
var noteFilters = document.querySelectorAll(".notes-filter");

noteFilters.forEach(function(btn) {
  btn.addEventListener("click", function() {
    noteFilters.forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
  });
});


// ── NOTES: CLICK TO OPEN ──────────────────────
var noteItems = document.querySelectorAll(".note-item");

noteItems.forEach(function(item) {
  item.addEventListener("click", function() {
    noteItems.forEach(function(n) { n.classList.remove("active"); });
    item.classList.add("active");
  });
});


// ── NOTES: FORMAT TOOLBAR ─────────────────────
var fmtBtns = document.querySelectorAll(".fmt-btn");

fmtBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    var cmd = btn.getAttribute("data-cmd");
    if (!cmd) return;
    if (cmd === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (cmd === "blockquote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else {
      document.execCommand(cmd, false, null);
    }
    document.getElementById("noteEditor") && document.getElementById("noteEditor").focus();
  });
});


// ── NOTES: AUTOSAVE ───────────────────────────
var noteEditor     = document.getElementById("noteEditor");
var noteSaveSt     = document.getElementById("noteSaveStatus");
var noteTitleInput = document.getElementById("noteTitleInput");

if (noteEditor) {
  var noteTimeout;
  noteEditor.addEventListener("input", function() {
    if (noteSaveSt) noteSaveSt.textContent = "Saving...";
    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(function() {
      if (noteSaveSt) noteSaveSt.textContent = "Saved";
    }, 1200);
  });
}

if (noteTitleInput) {
  noteTitleInput.addEventListener("input", function() {
    if (noteSaveSt) noteSaveSt.textContent = "Unsaved changes";
  });
}


// ── ANALYTICS: PERIOD TABS ────────────────────
var periodBtns = document.querySelectorAll(".period-btn");

periodBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    periodBtns.forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
  });
});


// ── SIDEBAR TOGGLE (mobile) ───────────────────
var sidebarToggle = document.getElementById("sidebarToggle");
var sidebar       = document.getElementById("sidebar");

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener("click", function() {
    sidebar.classList.toggle("mobile-open");
  });
}


// ── EXAM COUNTDOWN: live days ─────────────────
var examDates = [
  { id: "examDays1", date: "2025-05-03" },
];

examDates.forEach(function(exam) {
  var el = document.getElementById(exam.id);
  if (!el) return;
  var target = new Date(exam.date);
  var now    = new Date();
  var diff   = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  el.textContent = diff > 0 ? diff : 0;
});


// ── STREAK COUNTER from localStorage ──────────
var streakEl = document.getElementById("streakCount");
if (streakEl) {
  var streak = localStorage.getItem("fd-streak") || 7;
  streakEl.textContent = streak;
}


// ── TASKS TODAY counter ───────────────────────
var tasksTodayEl = document.getElementById("tasksToday");
if (tasksTodayEl) {
  var pending = document.querySelectorAll(".quick-task:not(.done)").length;
  tasksTodayEl.textContent = pending + " task" + (pending !== 1 ? "s" : "");
}
