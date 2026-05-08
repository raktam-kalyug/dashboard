function initWeekButtons() {

  const weekLabel =
    document.getElementById(
      "weekLabel"
    );

  let currentWeek = 0;

  document
    .getElementById(
      "prevWeek"
    )
    ?.addEventListener(
      "click",
      () => {

        currentWeek--;

        weekLabel.textContent =
          `Week ${currentWeek}`;
      }
    );

  document
    .getElementById(
      "nextWeek"
    )
    ?.addEventListener(
      "click",
      () => {

        currentWeek++;

        weekLabel.textContent =
          `Week +${currentWeek}`;
      }
    );
}

// ===============================
// MODAL
// ===============================

function initAddClassModal() {

  const modal =
    document.getElementById(
      "addSlotModal"
    );

  document
    .getElementById(
      "openAddSlot"
    )
    ?.addEventListener(
      "click",
      () => {

        modal.classList.add(
          "show"
        );
      }
    );

  document
    .getElementById(
      "closeAddSlot"
    )
    ?.addEventListener(
      "click",
      () => {

        modal.classList.remove(
          "show"
        );
      }
    );
}

// ===============================
// TODAY HIGHLIGHT
// ===============================

function highlightToday() {

  const headers =
    document.querySelectorAll(
      ".tt-header"
    );

  const today = new Date()
    .getDay();

  headers.forEach((header, index) => {

    if (index === today) {

      header.classList.add(
        "active"
      );
    }
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
        "page-timetable"
      )
    ) return;

    initWeekButtons();

    initAddClassModal();

    highlightToday();
  }
);