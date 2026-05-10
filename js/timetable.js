// =============================================
// FOCUSDESK CALENDAR ENGINE v2
// Optimized Architecture
// =============================================

import { Storage } from "./storage.js";

// =============================================
// CONSTANTS
// =============================================

const HOURS = Array.from(
  { length: 18 },
  (_, i) => i + 6
);

const SHORT_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat"
];

const START_HOUR = 6;
const PIXELS_PER_MINUTE = 1.2;

// =============================================
// DOM HELPERS
// =============================================

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  document.querySelectorAll(selector);

// =============================================
// GLOBAL STATE
// =============================================

const state = {

  currentDate:
    new Date(),

  currentView:
    "week",

  editingEventId:
    null,

  theme:
    localStorage.getItem("theme") ||
    "dark",

  events:
    Storage.get(
      Storage.KEYS.CALENDAR_EVENTS,
      []
    ),

  tasks:
    Storage.get(
      Storage.KEYS.TASKS,
      []
    ),

  exams:
    Storage.get(
      Storage.KEYS.EXAMS,
      []
    )
};

// =============================================
// UTILS
// =============================================

function formatDate(date) {

  return date
    .toISOString()
    .split("T")[0];
}

function generateId() {

  return crypto.randomUUID();
}

function formatHour(hour) {

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const formatted =
    hour > 12
      ? hour - 12
      : hour;

  return `${formatted} ${suffix}`;
}

function getWeekDates(baseDate) {

  const date =
    new Date(baseDate);

  const day =
    date.getDay();

  const sunday =
    new Date(date);

  sunday.setDate(
    date.getDate() - day
  );

  return Array.from(
    { length: 7 },
    (_, i) => {

      const d =
        new Date(sunday);

      d.setDate(
        sunday.getDate() + i
      );

      return d;
    }
  );
}

function getMinutes(time) {

  const [hours, minutes] =
    time.split(":");

  return (
    Number(hours) * 60 +
    Number(minutes)
  );
}

// =============================================
// STATE MANAGEMENT
// =============================================

function setState(updates = {}) {

  Object.assign(
    state,
    updates
  );
}

function saveEvents() {

  Storage.set(
    Storage.KEYS.CALENDAR_EVENTS,
    state.events
  );
}

// =============================================
// TOAST
// =============================================

function showToast(
  message,
  type = "success"
) {

  const container =
    $("#toastContainer");

  if (!container) return;

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast ${type}`;

  toast.textContent =
    message;

  container.appendChild(
    toast
  );

  setTimeout(() => {

    toast.classList.add(
      "show"
    );
  }, 50);

  setTimeout(() => {

    toast.classList.remove(
      "show"
    );

    setTimeout(() => {

      toast.remove();
    }, 300);

  }, 3000);
}

// =============================================
// THEME
// =============================================

function applyTheme() {

  document.body.dataset.theme =
    state.theme;
}

function toggleTheme() {

  const nextTheme =
    state.theme === "dark"
      ? "light"
      : "dark";

  setState({
    theme: nextTheme
  });

  localStorage.setItem(
    "theme",
    nextTheme
  );

  applyTheme();
}

// =============================================
// CLOCK
// =============================================

function initClock() {

  const clock =
    $("#liveClock");

  if (!clock) return;

  function updateClock() {

    const now =
      new Date();

    clock.textContent =
      now.toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      );
  }

  updateClock();

  setInterval(
    updateClock,
    1000
  );
}

// =============================================
// TOOLBAR DATE
// =============================================

function renderToolbarDate() {

  const range =
    $("#calendarCurrentRange");

  if (!range) return;

  range.textContent =
    state.currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric"
      }
    );
}

// =============================================
// MINI CALENDAR
// =============================================

function renderMiniCalendar() {

  const grid =
    $("#miniCalendarGrid");

  if (!grid) return;

  grid.innerHTML = "";

  const fragment =
    document.createDocumentFragment();

  const year =
    state.currentDate.getFullYear();

  const month =
    state.currentDate.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const totalDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "mini-calendar-empty";

    fragment.appendChild(
      empty
    );
  }

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "mini-calendar-day";

    button.textContent =
      day;

    const today =
      new Date();

    const isToday =
      day === today.getDate() &&
      month ===
        today.getMonth() &&
      year ===
        today.getFullYear();

    if (isToday) {

      button.classList.add(
        "today"
      );
    }

    button.addEventListener(
      "click",
      () => {

        setState({
          currentDate:
            new Date(
              year,
              month,
              day
            )
        });

        rerender({
          calendar: true
        });
      }
    );

    fragment.appendChild(
      button
    );
  }

  grid.appendChild(
    fragment
  );
}

// =============================================
// TIME AXIS
// =============================================

function renderTimeAxis() {

  const container =
    $("#calendarTimeSlots");

  if (!container) return;

  container.innerHTML = "";

  const fragment =
    document.createDocumentFragment();

  HOURS.forEach(hour => {

    const slot =
      document.createElement(
        "div"
      );

    slot.className =
      "calendar-time-slot";

    slot.textContent =
      formatHour(hour);

    fragment.appendChild(
      slot
    );
  });

  container.appendChild(
    fragment
  );
}

// =============================================
// DAY HEADERS
// =============================================

function renderDayHeaders() {

  const container =
    $("#calendarDaysHeader");

  if (!container) return;

  container.innerHTML = "";

  const dates =
    getWeekDates(
      state.currentDate
    );

  const fragment =
    document.createDocumentFragment();

  dates.forEach(date => {

    const item =
      document.createElement(
        "div"
      );

    item.className =
      "calendar-day-header";

    const today =
      formatDate(date) ===
      formatDate(
        new Date()
      );

    if (today) {

      item.classList.add(
        "today"
      );
    }

    const day =
      document.createElement(
        "span"
      );

    day.className =
      "calendar-day-name";

    day.textContent =
      SHORT_DAYS[
        date.getDay()
      ];

    const number =
      document.createElement(
        "span"
      );

    number.className =
      "calendar-day-date";

    number.textContent =
      date.getDate();

    item.appendChild(day);

    item.appendChild(number);

    fragment.appendChild(item);
  });

  container.appendChild(
    fragment
  );
}

// =============================================
// EVENT POSITION
// =============================================

function calculateEventPosition(
  startTime,
  endTime
) {

  const start =
    getMinutes(
      startTime
    );

  const end =
    getMinutes(
      endTime
    );

  return {

    top:
      (
        start -
        START_HOUR * 60
      ) *
      PIXELS_PER_MINUTE,

    height:
      (
        end -
        start
      ) *
      PIXELS_PER_MINUTE
  };
}

// =============================================
// EVENT CONFLICTS
// =============================================

function eventsOverlap(a, b) {

  return (
    getMinutes(
      a.startTime
    ) <
      getMinutes(
        b.endTime
      ) &&
    getMinutes(
      a.endTime
    ) >
      getMinutes(
        b.startTime
      )
  );
}

// =============================================
// EVENT CARD
// =============================================

function createEventCard(event) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    `calendar-event ${event.type}`;

  card.dataset.id =
    event.id;

  const {
    top,
    height
  } =
    calculateEventPosition(
      event.startTime,
      event.endTime
    );

  card.style.top =
    `${top}px`;

  card.style.height =
    `${height}px`;

  // Badge

  const badge =
    document.createElement(
      "span"
    );

  badge.className =
    "calendar-event-badge";

  badge.textContent =
    event.type;

  // Title

  const title =
    document.createElement(
      "h4"
    );

  title.className =
    "calendar-event-title";

  title.textContent =
    event.title;

  // Time

  const time =
    document.createElement(
      "p"
    );

  time.className =
    "calendar-event-time";

  time.textContent =
    `${event.startTime} - ${event.endTime}`;

  // Resize Handle

  const resize =
    document.createElement(
      "div"
    );

  resize.className =
    "resize-handle";

  card.appendChild(
    badge
  );

  card.appendChild(
    title
  );

  card.appendChild(
    time
  );

  card.appendChild(
    resize
  );

  // Edit

  card.addEventListener(
    "click",
    () => {

      openEditModal(
        event.id
      );
    }
  );

  return card;
}

// =============================================
// CALENDAR GRID
// =============================================

function renderCalendarGrid() {

  const grid =
    $("#calendarDaysGrid");

  if (!grid) return;

  grid.innerHTML = "";

  const dates =
    getWeekDates(
      state.currentDate
    );

  const fragment =
    document.createDocumentFragment();

  // Pre-group events

  const groupedEvents =
    {};

  state.events.forEach(
    event => {

      if (
        !groupedEvents[
          event.date
        ]
      ) {

        groupedEvents[
          event.date
        ] = [];
      }

      groupedEvents[
        event.date
      ].push(event);
    }
  );

  dates.forEach(date => {

    const column =
      document.createElement(
        "div"
      );

    column.className =
      "calendar-day-column";

    const dateString =
      formatDate(date);

    const events =
      groupedEvents[
        dateString
      ] || [];

    // Hour lines

    const lines =
      document.createElement(
        "div"
      );

    lines.className =
      "calendar-hour-lines";

    HOURS.forEach(() => {

      const line =
        document.createElement(
          "div"
        );

      line.className =
        "calendar-hour-line";

      lines.appendChild(line);
    });

    column.appendChild(
      lines
    );

    // Events

    events.forEach(event => {

      column.appendChild(
        createEventCard(
          event
        )
      );
    });

    fragment.appendChild(
      column
    );
  });

  grid.appendChild(
    fragment
  );

  updateCurrentTimeLine();
}

// =============================================
// CURRENT TIME LINE
// =============================================

function updateCurrentTimeLine() {

  const line =
    $("#currentTimeLine");

  if (!line) return;

  const now =
    new Date();

  const minutes =
    now.getHours() * 60 +
    now.getMinutes();

  if (
    minutes <
    START_HOUR * 60
  ) {

    line.style.display =
      "none";

    return;
  }

  const top =
    (
      minutes -
      START_HOUR * 60
    ) *
    PIXELS_PER_MINUTE;

  line.style.display =
    "flex";

  line.style.top =
    `${top}px`;
}

// =============================================
// TASKS
// =============================================

function renderTasks() {

  const container =
    $("#calendarTaskList");

  if (!container) return;

  container.innerHTML = "";

  if (
    state.tasks.length === 0
  ) {

    renderEmptyState(
      container,
      "No tasks found"
    );

    return;
  }

  const fragment =
    document.createDocumentFragment();

  state.tasks.forEach(task => {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "calendar-task-card";

    const title =
      document.createElement(
        "h4"
      );

    title.textContent =
      task.title;

    const subject =
      document.createElement(
        "p"
      );

    subject.textContent =
      task.subject ||
      "General";

    card.appendChild(title);

    card.appendChild(subject);

    fragment.appendChild(
      card
    );
  });

  container.appendChild(
    fragment
  );
}

// =============================================
// EXAMS
// =============================================

function renderExams() {

  const container =
    $("#examList");

  if (!container) return;

  container.innerHTML = "";

  if (
    state.exams.length === 0
  ) {

    renderEmptyState(
      container,
      "No exams scheduled"
    );

    return;
  }

  const fragment =
    document.createDocumentFragment();

  state.exams.forEach(exam => {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "exam-card";

    const title =
      document.createElement(
        "h4"
      );

    title.textContent =
      exam.title;

    const date =
      document.createElement(
        "p"
      );

    date.textContent =
      exam.date;

    card.appendChild(title);

    card.appendChild(date);

    fragment.appendChild(
      card
    );
  });

  container.appendChild(
    fragment
  );
}

// =============================================
// AGENDA
// =============================================

function renderAgenda() {

  const container =
    $("#agendaFeed");

  if (!container) return;

  container.innerHTML = "";

  const sorted =
    [...state.events].sort(
      (a, b) => {

        return (
          new Date(
            `${a.date} ${a.startTime}`
          ) -
          new Date(
            `${b.date} ${b.startTime}`
          )
        );
      }
    );

  if (sorted.length === 0) {

    renderEmptyState(
      container,
      "No scheduled events"
    );

    return;
  }

  const fragment =
    document.createDocumentFragment();

  sorted.forEach(event => {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "agenda-card";

    const time =
      document.createElement(
        "div"
      );

    time.className =
      "agenda-time";

    time.textContent =
      event.startTime;

    const content =
      document.createElement(
        "div"
      );

    content.className =
      "agenda-content";

    const title =
      document.createElement(
        "h4"
      );

    title.textContent =
      event.title;

    const date =
      document.createElement(
        "p"
      );

    date.textContent =
      event.date;

    content.appendChild(
      title
    );

    content.appendChild(
      date
    );

    card.appendChild(time);

    card.appendChild(content);

    fragment.appendChild(
      card
    );
  });

  container.appendChild(
    fragment
  );
}

// =============================================
// EMPTY STATE
// =============================================

function renderEmptyState(
  container,
  text
) {

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "task-empty-state";

  const paragraph =
    document.createElement(
      "p"
    );

  paragraph.textContent =
    text;

  wrapper.appendChild(
    paragraph
  );

  container.appendChild(
    wrapper
  );
}

// =============================================
// MODAL
// =============================================

function openModal() {

  $("#eventModal")
    ?.classList.add(
      "show"
    );
}

function closeModal() {

  $("#eventModal")
    ?.classList.remove(
      "show"
    );

  clearModal();
}

function clearModal() {

  $("#eventTitle").value =
    "";

  $("#eventDate").value =
    "";

  $("#eventStartTime").value =
    "";

  $("#eventEndTime").value =
    "";

  $("#eventNotes").value =
    "";

  state.editingEventId =
    null;
}

// =============================================
// EVENT CRUD
// =============================================

function saveEvent() {

  const title =
    $("#eventTitle")
      .value
      .trim();

  const type =
    $("#eventType").value;

  const date =
    $("#eventDate").value;

  const startTime =
    $("#eventStartTime")
      .value;

  const endTime =
    $("#eventEndTime")
      .value;

  const notes =
    $("#eventNotes")
      .value;

  if (
    !title ||
    !date ||
    !startTime ||
    !endTime
  ) {

    showToast(
      "Please fill all fields",
      "error"
    );

    return;
  }

  const eventData = {

    id:
      state.editingEventId ||
      generateId(),

    title,

    type,

    date,

    startTime,

    endTime,

    notes
  };

  if (
    state.editingEventId
  ) {

    state.events =
      state.events.map(
        event => {

          return event.id ===
            state.editingEventId
            ? eventData
            : event;
        }
      );

  } else {

    state.events.push(
      eventData
    );
  }

  saveEvents();

  rerender({
    calendar: true,
    agenda: true
  });

  closeModal();

  showToast(
    "Event saved"
  );
}

function deleteEvent() {

  if (
    !state.editingEventId
  ) return;

  state.events =
    state.events.filter(
      event =>
        event.id !==
        state.editingEventId
    );

  saveEvents();

  rerender({
    calendar: true,
    agenda: true
  });

  closeModal();

  showToast(
    "Event deleted"
  );
}

function openEditModal(id) {

  const event =
    state.events.find(
      e => e.id === id
    );

  if (!event) return;

  state.editingEventId =
    id;

  openModal();

  $("#eventTitle").value =
    event.title;

  $("#eventType").value =
    event.type;

  $("#eventDate").value =
    event.date;

  $("#eventStartTime").value =
    event.startTime;

  $("#eventEndTime").value =
    event.endTime;

  $("#eventNotes").value =
    event.notes || "";
}

// =============================================
// RERENDER ENGINE
// =============================================

function rerender({
  calendar = false,
  agenda = false,
  tasks = false,
  exams = false
}) {

  if (calendar) {

    renderToolbarDate();

    renderMiniCalendar();

    renderDayHeaders();

    renderCalendarGrid();
  }

  if (agenda)
    renderAgenda();

  if (tasks)
    renderTasks();

  if (exams)
    renderExams();
}

// =============================================
// TABS
// =============================================

function initTabs() {

  $$(".calendar-tab-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          $$(".calendar-tab-btn")
            .forEach(btn => {

              btn.classList.remove(
                "active"
              );
            });

          $$(".calendar-tab-content")
            .forEach(content => {

              content.classList.remove(
                "active"
              );
            });

          button.classList.add(
            "active"
          );

          $(
            `#${button.dataset.tab}Tab`
          )?.classList.add(
            "active"
          );
        }
      );
    });
}

// =============================================
// NAVIGATION
// =============================================

function initNavigation() {

  $("#prevCalendarBtn")
    ?.addEventListener(
      "click",
      () => {

        state.currentDate.setDate(
          state.currentDate.getDate() - 7
        );

        rerender({
          calendar: true
        });
      }
    );

  $("#nextCalendarBtn")
    ?.addEventListener(
      "click",
      () => {

        state.currentDate.setDate(
          state.currentDate.getDate() + 7
        );

        rerender({
          calendar: true
        });
      }
    );

  $("#todayBtn")
    ?.addEventListener(
      "click",
      () => {

        setState({
          currentDate:
            new Date()
        });

        rerender({
          calendar: true
        });
      }
    );
}

// =============================================
// MODAL EVENTS
// =============================================

function initModalEvents() {

  $("#openEventModal")
    ?.addEventListener(
      "click",
      openModal
    );

  $("#closeEventModal")
    ?.addEventListener(
      "click",
      closeModal
    );

  $("#cancelEventModal")
    ?.addEventListener(
      "click",
      closeModal
    );

  $("#saveEventBtn")
    ?.addEventListener(
      "click",
      saveEvent
    );

  $("#deleteEventBtn")
    ?.addEventListener(
      "click",
      deleteEvent
    );

  $("#eventModal")
    ?.addEventListener(
      "click",
      e => {

        if (
          e.target.id ===
          "eventModal"
        ) {

          closeModal();
        }
      }
    );
}

// =============================================
// SIDEBAR
// =============================================

function initSidebar() {

  const sidebar =
    $("#sidebar");

  const overlay =
    $("#sidebarOverlay");

  $("#sidebarToggle")
    ?.addEventListener(
      "click",
      () => {

        sidebar.classList.toggle(
          "collapsed"
        );
      }
    );

  $("#mobileMenuBtn")
    ?.addEventListener(
      "click",
      () => {

        sidebar.classList.add(
          "mobile-open"
        );

        overlay.classList.add(
          "show"
        );
      }
    );

  overlay?.addEventListener(
    "click",
    () => {

      sidebar.classList.remove(
        "mobile-open"
      );

      overlay.classList.remove(
        "show"
      );
    }
  );
}

// =============================================
// SHORTCUTS
// =============================================

function initShortcuts() {

  document.addEventListener(
    "keydown",
    e => {

      // Ignore typing

      if (
        document.activeElement.tagName ===
          "INPUT" ||
        document.activeElement.tagName ===
          "TEXTAREA"
      ) {

        return;
      }

      switch (e.key.toLowerCase()) {

        case "n":

          openModal();

          break;

        case "escape":

          closeModal();

          break;

        case "t":
          $("#themeToggle")?.click();
          break;
      }
    }
  );
}

// =============================================
// INIT
// =============================================

function init() {

  // applyTheme(); // Handled by app.js

  renderToolbarDate();

  renderMiniCalendar();

  renderTimeAxis();

  renderDayHeaders();

  renderCalendarGrid();

  renderTasks();

  renderExams();

  renderAgenda();

  // initClock(); // Handled by app.js

  initTabs();

  initNavigation();

  initModalEvents();

  // initSidebar(); // Handled by app.js

  initShortcuts();

  // Theme toggle listener handled by app.js

  setInterval(
    updateCurrentTimeLine,
    60000
  );
}

document.addEventListener(
  "DOMContentLoaded",
  init
);