export const Storage = {

  KEYS: {
    TASKS: "spd_daily_todo",
    NOTES: "spd_notes",
    EVENTS: "spd_events",
    USER: "spd_user",
    SESSIONS: "spd_sessions"
  },

  get(key, fallback = null) {

    const data =
      localStorage.getItem(key);

    return data
      ? JSON.parse(data)
      : fallback;
  },

  set(key, value) {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  }
};