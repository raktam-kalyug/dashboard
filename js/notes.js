import { Storage }
from "./storage.js";

// ===============================
// AUTOSAVE
// ===============================

function initAutosave() {

  const editor =
    document.getElementById(
      "noteEditor"
    );

  const saveStatus =
    document.getElementById(
      "noteSaveStatus"
    );

  if (!editor) return;

  editor.innerHTML =
    Storage.get(
      Storage.KEYS.NOTES,
      editor.innerHTML
    );

  editor.addEventListener(
    "input",
    () => {

      Storage.set(
        Storage.KEYS.NOTES,
        editor.innerHTML
      );

      saveStatus.textContent =
        "Saving...";

      setTimeout(() => {

        saveStatus.textContent =
          "Saved";

      }, 400);
    }
  );
}

// ===============================
// FORMAT BUTTONS
// ===============================

function initFormatting() {

  document
    .querySelectorAll(".fmt-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const cmd =
            button.dataset.cmd;

          if (cmd === "h2") {

            document.execCommand(
              "formatBlock",
              false,
              "h2"
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
// SEARCH NOTES
// ===============================

function initSearch() {

  const searchInput =
    document.getElementById(
      "notesSearch"
    );

  const noteItems =
    document.querySelectorAll(
      ".note-item"
    );

  if (!searchInput) return;

  searchInput.addEventListener(
    "input",
    () => {

      const value =
        searchInput.value.toLowerCase();

      noteItems.forEach(note => {

        const text =
          note.innerText.toLowerCase();

        note.style.display =
          text.includes(value)
            ? "block"
            : "none";
      });
    }
  );
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
    ) return;

    initAutosave();

    initFormatting();

    initSearch();
  }
);