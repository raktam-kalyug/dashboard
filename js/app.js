const qs = (selector) =>
  document.querySelector(selector);

// ===============================
// LIVE CLOCK
// ===============================

function initClock() {

  const liveClock =
    qs("#liveClock");

  if (!liveClock) return;

  function updateClock() {

    const now = new Date();

    liveClock.textContent =
      now.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      );
  }

  updateClock();

  setInterval(updateClock, 1000);
}

// ===============================
// THEME TOGGLE
// ===============================

function initThemeToggle() {

  const themeBtn =
    qs("#themeToggle");

  if (!themeBtn) return;

  const savedTheme =
    localStorage.getItem(
      "spd_theme"
    );

  if (savedTheme === "dark") {
    document.body.classList.add(
      "dark"
    );
  }

  themeBtn.addEventListener(
    "click",
    () => {

      document.body.classList.toggle(
        "dark"
      );

      const isDark =
        document.body.classList.contains(
          "dark"
        );

      localStorage.setItem(
        "spd_theme",
        isDark ? "dark" : "light"
      );
    }
  );
}

// ===============================
// SIDEBAR
// ===============================

function initSidebar() {

  const sidebar =
    qs("#sidebar");

  const sidebarToggle =
    qs("#sidebarToggle");

  if (!sidebar ||
      !sidebarToggle) return;

  sidebarToggle.addEventListener(
    "click",
    () => {

      sidebar.classList.toggle(
        "collapsed"
      );
    }
  );
}

// ===============================
// INIT
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initClock();
    initThemeToggle();
    initSidebar();
  }
);