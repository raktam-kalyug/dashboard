let draggedCard = null;

// ===============================
// DRAG & DROP
// ===============================

function initDragDrop() {

  document
    .querySelectorAll(".task-card")
    .forEach(card => {

      card.addEventListener(
        "dragstart",
        () => {

          draggedCard = card;

          card.classList.add(
            "is-dragging"
          );
        }
      );

      card.addEventListener(
        "dragend",
        () => {

          card.classList.remove(
            "is-dragging"
          );
        }
      );
    });

  document
    .querySelectorAll(".task-col-body")
    .forEach(column => {

      column.addEventListener(
        "dragover",
        e => e.preventDefault()
      );

      column.addEventListener(
        "drop",
        () => {

          if (!draggedCard) return;

          column.appendChild(
            draggedCard
          );
        }
      );
    });
}

// ===============================
// TASK DONE
// ===============================

function initTaskDone() {

  document
    .querySelectorAll(".tca-done")
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          const taskCard =
            btn.closest(
              ".task-card"
            );

          taskCard.classList.toggle(
            "is-done"
          );
        }
      );
    });
}

// ===============================
// MODAL
// ===============================

function initTaskModal() {

  const modal =
    document.getElementById(
      "addTaskModal"
    );

  document
    .getElementById(
      "openAddTask"
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
      "closeAddTask"
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
// FILTER BUTTONS
// ===============================

function initFilters() {

  document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(btn =>
              btn.classList.remove(
                "active"
              )
            );

          button.classList.add(
            "active"
          );
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
        "page-tasks"
      )
    ) return;

    initDragDrop();

    initTaskDone();

    initTaskModal();

    initFilters();
  }
);