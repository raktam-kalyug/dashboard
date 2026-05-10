export const Storage = {

  // ===============================
  // STORAGE KEYS
  // ===============================

  KEYS: {

    // Tasks
    TASKS: "spd_daily_todo",

    // Notes
    NOTES: "spd_notes",

    // Calendar System
    CALENDAR_EVENTS:
      "spd_calendar_events",

    TIMETABLE:
      "spd_timetable",

    EXAMS:
      "spd_exams",

    // Analytics
    SESSIONS:
      "spd_sessions",

    // User
    USER:
      "spd_user"
  },

  // ===============================
  // GET
  // ===============================

  get(
    key,
    fallback = null
  ) {

    try {

      const data =
        localStorage.getItem(
          key
        );

      return data
        ? JSON.parse(data)
        : fallback;

    } catch (error) {

      console.error(
        `Storage GET error: ${key}`,
        error
      );

      return fallback;
    }
  },

  // ===============================
  // SET
  // ===============================

  set(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.error(
        `Storage SET error: ${key}`,
        error
      );

      return false;
    }
  },

  // ===============================
  // REMOVE
  // ===============================

  remove(key) {

    try {

      localStorage.removeItem(
        key
      );

      return true;

    } catch (error) {

      console.error(
        `Storage REMOVE error: ${key}`,
        error
      );

      return false;
    }
  },

  // ===============================
  // CLEAR
  // ===============================

  clear() {

    try {

      localStorage.clear();

      return true;

    } catch (error) {

      console.error(
        "Storage CLEAR error:",
        error
      );

      return false;
    }
  }
};