import { Storage }
from "./storage.js";

const MODES = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

let currentMode = "focus";

let timer =
  MODES[currentMode];

let interval = null;

// ===============================
// TIMER UI
// ===============================

function renderTimer() {

  const display =
    document.getElementById(
      "pomodoroDisplay"
    );

  if (!display) return;

  const mins = String(
    Math.floor(timer / 60)
  ).padStart(2, "0");

  const secs = String(
    timer % 60
  ).padStart(2, "0");

  display.textContent =
    `${mins}:${secs}`;
}

// ===============================
// START TIMER
// ===============================

function startTimer() {

  if (interval) return;

  document.body.classList.add(
    "is-running"
  );

  interval = setInterval(() => {

    timer--;

    renderTimer();

    if (timer <= 0) {

      clearInterval(interval);

      interval = null;

      document.body.classList.remove(
        "is-running"
      );

      alert("Session complete!");
    }

  }, 1000);
}

// ===============================
// RESET TIMER
// ===============================

function resetTimer() {

  clearInterval(interval);

  interval = null;

  timer =
    MODES[currentMode];

  renderTimer();

  document.body.classList.remove(
    "is-running"
  );
}

// ===============================
// MODE TABS
// ===============================

function initPomodoroTabs() {

  document
    .querySelectorAll(".pomo-tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".pomo-tab")
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );

          tab.classList.add(
            "active"
          );

          currentMode =
            tab.dataset.mode;

          timer =
            MODES[currentMode];

          renderTimer();
        }
      );
    });
}

// ===============================
// QUICK NOTES
// ===============================

function initQuickNotes() {

  const noteArea =
    document.getElementById(
      "quickNoteArea"
    );

  const saveStatus =
    document.getElementById(
      "quickNoteSaveStatus"
    );

  if (!noteArea) return;

  noteArea.value =
    Storage.get(
      Storage.KEYS.NOTES,
      noteArea.value
    );

  noteArea.addEventListener(
    "input",
    () => {

      Storage.set(
        Storage.KEYS.NOTES,
        noteArea.value
      );

      saveStatus.textContent =
        "Saving...";

      setTimeout(() => {

        saveStatus.textContent =
          "Auto-saved";

      }, 500);
    }
  );
}

// ===============================
// QUICK TASKS
// ===============================

function initQuickTasks() {

  document
    .querySelectorAll(".task-cb")
    .forEach(cb => {

      cb.addEventListener(
        "change",
        () => {

          cb.closest(".quick-task")
            .classList.toggle(
              "done"
            );
        }
      );
    });
}

// ===============================
// HABITS
// ===============================

function initHabits() {

  document
    .querySelectorAll(".habit-check")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const habitItem =
            button.closest(
              ".habit-item"
            );

          habitItem.classList.toggle(
            "done"
          );

          const isDone =
            habitItem.classList.contains(
              "done"
            );

          button.textContent =
            isDone ? "✓" : "○";
        }
      );
    });
}

// ===============================
// INIT
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (
      !document.body.classList.contains(
        "page-dashboard"
      )
    ) return;

    renderTimer();

    document
      .getElementById(
        "pomodoroStart"
      )
      ?.addEventListener(
        "click",
        startTimer
      );

    document
      .getElementById(
        "pomodoroReset"
      )
      ?.addEventListener(
        "click",
        resetTimer
      );

    initPomodoroTabs();

    initQuickNotes();

    initQuickTasks();

    initHabits();
  }
);