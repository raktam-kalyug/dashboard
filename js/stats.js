import { Storage } from "./storage.js";

// ===============================
// DATA CALCULATIONS
// ===============================

function getFocusData() {
  const sessions = Storage.get(Storage.KEYS.SESSIONS, []);
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekSessions = sessions.filter(s => new Date(s.timestamp) >= startOfWeek);
  const dailyTotals = [0, 0, 0, 0, 0, 0, 0];
  let totalMinutes = 0;

  weekSessions.forEach(s => {
    const d = new Date(s.timestamp);
    let dayIdx = d.getDay() - 1;
    if (dayIdx === -1) dayIdx = 6;
    const mins = s.duration / 60;
    dailyTotals[dayIdx] += mins;
    totalMinutes += mins;
  });

  return { dailyTotals, totalMinutes };
}

function getTaskStats() {
  const tasks = Storage.get(Storage.KEYS.TASKS, []);
  const completed = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  return { completed, total };
}

function getHabitStats() {
  const habits = Storage.get("spd_habits", []);
  if (habits.length === 0) return 0;
  const done = habits.filter(h => h.done).length;
  return Math.round((done / habits.length) * 100);
}

// ===============================
// UI UPDATES
// ===============================

function updateStatsCards(focusMins, tasks, habitPct) {
  // Focus Time Card
  const focusCard = document.querySelector(".stat-card:nth-child(1) .stat-number");
  if (focusCard) {
    const h = Math.floor(focusMins / 60);
    const m = Math.round(focusMins % 60);
    focusCard.textContent = `${h}h ${m}m`;
  }

  // Tasks Card
  const taskCard = document.querySelector(".stat-card:nth-child(2) .stat-number");
  if (taskCard) {
    taskCard.textContent = `${tasks.completed} / ${tasks.total}`;
    const taskBar = document.querySelector(".stat-card:nth-child(2) .stat-bar-fill");
    if (taskBar) taskBar.style.setProperty("--pct", `${(tasks.completed / (tasks.total || 1)) * 100}%`);
  }

  // Habits Card
  const habitCard = document.querySelector(".stat-card:nth-child(3) .stat-number");
  if (habitCard) {
    habitCard.textContent = `${habitPct}%`;
    const habitBar = document.querySelector(".stat-card:nth-child(3) .stat-bar-fill");
    if (habitBar) habitBar.style.setProperty("--pct", `${habitPct}%`);
  }
}

function updateFocusChart(dailyTotals) {
  const bars = document.querySelectorAll("#focusBarChart .bar");
  const maxMins = Math.max(...dailyTotals, 300);

  bars.forEach((bar, idx) => {
    const mins = dailyTotals[idx];
    const pct = (mins / maxMins) * 100;
    bar.style.height = `${Math.max(pct, 5)}%`;
    const valLabel = bar.querySelector(".bar-val");
    if (valLabel) {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      valLabel.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
  });
}

// ===============================
// INIT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  if (!document.body.classList.contains("page-stats")) return;

  const { dailyTotals, totalMinutes } = getFocusData();
  const tasks = getTaskStats();
  const habitPct = getHabitStats();
  
  updateStatsCards(totalMinutes, tasks, habitPct);
  updateFocusChart(dailyTotals);
  
  // Original animations for trend bars (attendance table etc)
  document.querySelectorAll(".trend-bar").forEach(bar => {
    bar.style.width = bar.style.getPropertyValue("--w");
  });

  document.querySelectorAll(".period-btn").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".period-btn").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
});
