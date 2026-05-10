import { Storage } from "./storage.js";

// ===============================
// MODULE STATE
// ===============================

let currentNoteId = null;
let saveTimer = null;

// ===============================
// DEFAULT NOTES
// ===============================

function getDefaultNotes() {

  return [
    {
      id: "1",
      title: "CSS Grid — Key Concepts",
      content: `
        <h2>CSS Grid — Key Concepts</h2>
        <p>The CSS Grid Layout Module offers a grid-based layout system.</p>
      `,
      category: "web",
      createdAt: "2025-04-29T00:00:00.000Z",
      updatedAt: "2025-04-29T00:00:00.000Z"
    },
    {
      id: "2",
      title: "Graph Traversal — BFS & DFS",
      content: `
        <h2>Graph Traversal — BFS & DFS</h2>
        <p>BFS uses queue, DFS uses recursion/stack.</p>
      `,
      category: "algo",
      createdAt: "2025-04-28T00:00:00.000Z",
      updatedAt: "2025-04-28T00:00:00.000Z"
    }
  ];
}

// ===============================
// STORAGE
// ===============================

function getNotes() {

  const notes =
    Storage.get(
      Storage.KEYS.NOTES,
      null
    );

  if (
    !notes ||
    !Array.isArray(notes)
  ) {

    const defaults =
      getDefaultNotes();

    saveNotes(defaults);

    return defaults;
  }

  return notes;
}

function saveNotes(notes) {

  Storage.set(
    Storage.KEYS.NOTES,
    notes
  );
}

// ===============================
// HELPERS
// ===============================

function getPreviewText(content) {

  const text =
    content
      .replace(/<[^>]*>/g, "")
      .trim();

  return text.length > 60
    ? text.substring(0, 60) + "..."
    : text;
}

function updateWordCount() {

  const editor =
    document.getElementById(
      "noteEditor"
    );

  const wordCount =
    document.getElementById(
      "noteWordcount"
    );

  if (!editor || !wordCount)
    return;

  const text =
    editor.textContent.trim();

  const words =
    text.length > 0
      ? text.split(/\s+/).length
      : 0;

  wordCount.textContent =
    `Word count: ${words}`;
}

function updateLastEdited(date) {

  const el =
    document.getElementById(
      "noteLastEdited"
    );

  if (!el) return;

  el.textContent =
    "Last edited: " +
    new Date(date)
      .toLocaleString("en-IN");
}

function setSaveStatus(text) {

  const saveStatus =
    document.getElementById(
      "noteSaveStatus"
    );

  if (!saveStatus) return;

  saveStatus.textContent =
    text;
}

// ===============================
// CREATE NOTE
// ===============================

function createNewNote() {

  const now =
    new Date().toISOString();

  return {
    id: "note-" + Date.now(),
    title: "Untitled Note",
    content:
      "<p>Start writing...</p>",
    category: "other",
    createdAt: now,
    updatedAt: now
  };
}

// ===============================
// RENDER NOTES
// ===============================

function renderNotes(
  filter = "all",
  search = ""
) {

  const notesList =
    document.getElementById(
      "notesList"
    );

  if (!notesList) return;

  notesList.innerHTML = "";

  const notes =
    getNotes();

  const categoryLabels = {
    web: "Web Design",
    maths: "Mathematics",
    algo: "Algorithms",
    other: "Other"
  };

  notes.forEach(note => {

    const matchesFilter =
      filter === "all" ||
      note.category === filter;

    const matchesSearch =
      note.title
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    if (
      !matchesFilter ||
      !matchesSearch
    ) {
      return;
    }

    const li =
      document.createElement("li");

    li.className =
      "note-item";

    if (
      note.id === currentNoteId
    ) {

      li.classList.add(
        "active"
      );
    }

    li.setAttribute(
      "data-noteid",
      note.id
    );

    const date =
      new Date(note.createdAt)
        .toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric"
          }
        );

    li.innerHTML = `
      <div class="note-item-top">
        <span class="note-item-cat ${note.category}">
          ${categoryLabels[note.category]}
        </span>

        <span class="note-item-date">
          ${date}
        </span>
      </div>

      <h4 class="note-item-title">
        ${note.title}
      </h4>

      <p class="note-item-preview">
        ${getPreviewText(note.content)}
      </p>
    `;

    li.addEventListener(
      "click",
      () => loadNote(note.id)
    );

    notesList.appendChild(li);
  });

  showEmptyState();
}

// ===============================
// LOAD NOTE
// ===============================

function loadNote(noteId) {

  const notes =
    getNotes();

  const note =
    notes.find(
      n => n.id === noteId
    );

  if (!note) return;

  currentNoteId = noteId;

  document
    .querySelectorAll(".note-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.getAttribute(
          "data-noteid"
        ) === noteId
      );
    });

  const titleInput =
    document.getElementById(
      "noteTitleInput"
    );

  const categorySelect =
    document.getElementById(
      "noteCatSelect"
    );

  const editor =
    document.getElementById(
      "noteEditor"
    );

  if (titleInput)
    titleInput.value =
      note.title;

  if (categorySelect)
    categorySelect.value =
      note.category;

  if (editor)
    editor.innerHTML =
      note.content;

  updateWordCount();

  updateLastEdited(
    note.updatedAt
  );
}

// ===============================
// SAVE CURRENT NOTE
// ===============================

function saveCurrentNote() {

  if (!currentNoteId) return;

  const notes =
    getNotes();

  const note =
    notes.find(
      n => n.id === currentNoteId
    );

  if (!note) return;

  const titleInput =
    document.getElementById(
      "noteTitleInput"
    );

  const categorySelect =
    document.getElementById(
      "noteCatSelect"
    );

  const editor =
    document.getElementById(
      "noteEditor"
    );

  note.title =
    titleInput.value ||
    "Untitled Note";

  note.category =
    categorySelect.value;

  note.content =
    editor.innerHTML;

  note.updatedAt =
    new Date().toISOString();

  saveNotes(notes);

  setSaveStatus("Saved");

  updateLastEdited(
    note.updatedAt
  );

  const activeFilter =
    document.querySelector(
      ".notes-filter.active"
    );

  const search =
    document.getElementById(
      "notesSearch"
    ).value;

  renderNotes(
    activeFilter.dataset.cat,
    search
  );
}

// ===============================
// EMPTY STATE
// ===============================

function showEmptyState() {

  const notesList =
    document.getElementById(
      "notesList"
    );

  if (!notesList) return;

  const items =
    notesList.querySelectorAll(
      ".note-item"
    );

  let empty =
    notesList.querySelector(
      ".empty-notes"
    );

  if (items.length === 0) {

    if (!empty) {

      empty =
        document.createElement(
          "div"
        );

      empty.className =
        "empty-notes";

      empty.textContent =
        "No notes found.";

      notesList.appendChild(
        empty
      );
    }

  } else if (empty) {

    empty.remove();
  }
}

// ===============================
// NEW NOTE
// ===============================

function initNewNote() {

  const btn =
    document.getElementById(
      "newNoteBtn"
    );

  if (!btn) return;

  btn.addEventListener(
    "click",
    () => {

      const notes =
        getNotes();

      const note =
        createNewNote();

      notes.unshift(note);

      saveNotes(notes);

      currentNoteId =
        note.id;

      renderNotes();

      loadNote(note.id);
    }
  );
}

// ===============================
// DELETE NOTE
// ===============================

function initDeleteNote() {

  const btn =
    document.getElementById(
      "deleteNoteBtn"
    );

  if (!btn) return;

  btn.addEventListener(
    "click",
    () => {

      if (!currentNoteId)
        return;

      const confirmDelete =
        confirm(
          "Delete this note?"
        );

      if (!confirmDelete)
        return;

      let notes =
        getNotes();

      notes =
        notes.filter(
          note =>
            note.id !==
            currentNoteId
        );

      if (notes.length === 0) {

        const newNote =
          createNewNote();

        notes.push(newNote);
      }

      saveNotes(notes);

      currentNoteId =
        notes[0].id;

      renderNotes();

      loadNote(
        currentNoteId
      );
    }
  );
}

// ===============================
// AUTOSAVE
// ===============================

function initAutosave() {

  const editor =
    document.getElementById(
      "noteEditor"
    );

  const titleInput =
    document.getElementById(
      "noteTitleInput"
    );

  const categorySelect =
    document.getElementById(
      "noteCatSelect"
    );

  if (!editor) return;

  function triggerSave() {

    setSaveStatus(
      "Saving..."
    );

    clearTimeout(
      saveTimer
    );

    saveTimer =
      setTimeout(
        saveCurrentNote,
        400
      );
  }

  editor.addEventListener(
    "input",
    () => {

      updateWordCount();

      triggerSave();
    }
  );

  titleInput.addEventListener(
    "input",
    triggerSave
  );

  categorySelect.addEventListener(
    "change",
    triggerSave
  );
}

// ===============================
// SEARCH
// ===============================

function initSearch() {

  const searchInput =
    document.getElementById(
      "notesSearch"
    );

  if (!searchInput)
    return;

  searchInput.addEventListener(
    "input",
    () => {

      const activeFilter =
        document.querySelector(
          ".notes-filter.active"
        );

      renderNotes(
        activeFilter.dataset.cat,
        searchInput.value
      );
    }
  );
}

// ===============================
// FILTERS
// ===============================

function initFilters() {

  const filters =
    document.querySelectorAll(
      ".notes-filter"
    );

  filters.forEach(btn => {

    btn.addEventListener(
      "click",
      () => {

        filters.forEach(f =>
          f.classList.remove(
            "active"
          )
        );

        btn.classList.add(
          "active"
        );

        const search =
          document.getElementById(
            "notesSearch"
          ).value;

        renderNotes(
          btn.dataset.cat,
          search
        );
      }
    );
  });
}

// ===============================
// FORMATTING
// ===============================

function initFormatting() {

  document
    .querySelectorAll(
      ".fmt-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const cmd =
            button.dataset.cmd;

          const editor =
            document.getElementById(
              "noteEditor"
            );

          editor.focus();

          if (cmd === "h2") {

            document.execCommand(
              "formatBlock",
              false,
              "h2"
            );

            return;
          }

          if (
            cmd === "blockquote"
          ) {

            document.execCommand(
              "formatBlock",
              false,
              "blockquote"
            );

            return;
          }

          document.execCommand(
            cmd,
            false,
            null
          );
        }
      );
    });
}

// ===============================
// TABS
// ===============================

function initTabs() {
  const tabs = document.querySelectorAll(".page-tab-btn");
  const contents = document.querySelectorAll(".page-tab-content");

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.style.display = "none");

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      document.getElementById(targetId).style.display = "block";
    });
  });
}

// ===============================
// HABIT MANAGEMENT
// ===============================

function initHabitManager() {
  const input = document.getElementById("newHabitInput");
  const addBtn = document.getElementById("addHabitBtn");
  const list = document.getElementById("manageHabitList");

  if (!input || !addBtn || !list) return;

  function render() {
    const habits = Storage.get("spd_habits", []);
    list.innerHTML = "";
    if(habits.length === 0) {
      list.innerHTML = "<p class='page-sub'>No habits tracked yet.</p>";
      return;
    }
    habits.forEach(h => {
      const li = document.createElement("li");
      li.style = "display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--panel-soft); border: 1px solid var(--line); border-radius: var(--radius-sm);";
      li.innerHTML = `
        <span style="font-weight: 600;">${h.name}</span>
        <div>
          <span style="margin-right: 14px; font-size: 0.85rem; color: var(--muted);">Streak: ${h.streak || 0}</span>
          <button class="editor-btn delete-habit" data-id="${h.id}" style="color: var(--red); border:none; background:transparent; cursor:pointer;">🗑</button>
        </div>
      `;
      list.appendChild(li);
    });

    list.querySelectorAll(".delete-habit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const newHabits = habits.filter(x => String(x.id) !== String(id));
        Storage.set("spd_habits", newHabits);
        render();
      });
    });
  }

  addBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;
    const habits = Storage.get("spd_habits", []);
    habits.push({ id: Date.now(), name, done: false, streak: 0 });
    Storage.set("spd_habits", habits);
    input.value = "";
    render();
  });

  render();
}

// ===============================
// SUBJECT & SYLLABUS MANAGEMENT
// ===============================

function initSubjectManager() {
  const input = document.getElementById("newSubjectInput");
  const addBtn = document.getElementById("addSubjectBtn");
  const list = document.getElementById("manageSubjectList");

  if (!input || !addBtn || !list) return;

  function findNode(nodes, id) {
    for (let n of nodes) {
      if (String(n.id) === String(id)) return n;
      if (n.children) {
        let found = findNode(n.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function removeNode(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
      if (String(nodes[i].id) === String(id)) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && removeNode(nodes[i].children, id)) return true;
    }
    return false;
  }

  function renderTree(nodes) {
    if (!nodes || nodes.length === 0) return "";
    let html = `<div class="syllabus-tree">`;
    nodes.forEach(n => {
      html += `
        <div class="syllabus-node">
          <div class="syllabus-node-content">
            <input type="checkbox" class="toggle-topic" data-id="${n.id}" ${n.done ? 'checked' : ''} style="cursor:pointer;">
            <span class="syllabus-node-title" style="text-decoration: ${n.done ? 'line-through' : 'none'}; color: ${n.done ? 'var(--muted)' : 'var(--text)'};">${n.name}</span>
            <div class="syllabus-node-actions">
              <button class="syllabus-btn add-child" data-id="${n.id}" title="Add Sub-topic">➕</button>
              <button class="syllabus-btn delete delete-topic" data-id="${n.id}" title="Delete">🗑</button>
            </div>
          </div>
          ${n.children && n.children.length > 0 ? renderTree(n.children) : ""}
        </div>
      `;
    });
    html += `</div>`;
    return html;
  }

  function render() {
    let subjects = Storage.get("spd_subjects", []);
    
    // Migrate legacy 'topics' array to 'children' tree
    subjects.forEach(s => {
      if (s.topics) {
        s.children = s.topics.map(t => ({ id: "mig-"+Math.random(), name: t.name, done: t.done, children: [] }));
        delete s.topics;
      }
      if (!s.children) s.children = [];
    });
    
    list.innerHTML = "";
    if(subjects.length === 0) {
      list.innerHTML = "<p class='page-sub'>No subjects added yet.</p>";
      return;
    }
    
    subjects.forEach(s => {
      const el = document.createElement("div");
      el.className = "calendar-panel";
      el.style.marginBottom = "20px";
      el.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="margin:0; font-family: 'Plus Jakarta Sans', sans-serif;">${s.name}</h3>
          <button class="editor-btn delete-subj" data-id="${s.id}" style="color: var(--red); border:none; background:transparent; cursor:pointer;">🗑 Delete Subject</button>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 14px;">
          <input type="text" class="topic-input" placeholder="Add chapter or main topic..." style="flex:1; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--panel-soft); color: var(--text);">
          <button class="calendar-create-btn add-topic" data-id="${s.id}" style="padding: 8px 16px; border-radius: var(--radius-sm); cursor:pointer;">Add</button>
        </div>
        ${renderTree(s.children)}
      `;
      list.appendChild(el);
    });

    list.querySelectorAll(".delete-subj").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        subjects = subjects.filter(x => String(x.id) !== String(id));
        Storage.set("spd_subjects", subjects);
        render();
      });
    });

    list.querySelectorAll(".add-topic").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const sid = e.target.dataset.id;
        const input = e.target.previousElementSibling;
        const topicName = input.value.trim();
        if (!topicName) return;
        const subj = subjects.find(x => String(x.id) === String(sid));
        subj.children.push({ id: Date.now()+Math.random(), name: topicName, done: false, children: [] });
        Storage.set("spd_subjects", subjects);
        render();
      });
    });

    list.querySelectorAll(".add-child").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const subName = prompt("Enter sub-topic name:");
        if (!subName || !subName.trim()) return;
        const node = findNode(subjects, id);
        if (node) {
          if(!node.children) node.children = [];
          node.children.push({ id: Date.now()+Math.random(), name: subName.trim(), done: false, children: [] });
          Storage.set("spd_subjects", subjects);
          render();
        }
      });
    });

    list.querySelectorAll(".toggle-topic").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const id = e.target.dataset.id;
        const node = findNode(subjects, id);
        if (node) {
          node.done = e.target.checked;
          Storage.set("spd_subjects", subjects);
          render();
        }
      });
    });

    list.querySelectorAll(".delete-topic").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        if(removeNode(subjects, id)) {
          Storage.set("spd_subjects", subjects);
          render();
        }
      });
    });
  }

  addBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;
    const subjects = Storage.get("spd_subjects", []);
    subjects.push({ id: Date.now(), name, children: [] });
    Storage.set("spd_subjects", subjects);
    input.value = "";
    render();
  });

  render();
}

// ===============================
// INIT
// ===============================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (
      !document.body.classList.contains(
        "page-notes"
      )
    ) {
      return;
    }

    const notes =
      getNotes();

    if (notes.length > 0) {

      currentNoteId =
        notes[0].id;
    }

    renderNotes();

    loadNote(currentNoteId);

    initAutosave();

    initNewNote();

    initDeleteNote();

    initFormatting();

    initSearch();

    initFilters();
    
    initTabs();
    
    initHabitManager();
    
    initSubjectManager();
  }
);