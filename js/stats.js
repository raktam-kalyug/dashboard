// ===============================
// BAR CHART ANIMATION
// ===============================

function initBarCharts() {

  const bars =
    document.querySelectorAll(
      ".bar"
    );

  bars.forEach(bar => {

    const height =
      bar.style.getPropertyValue(
        "--h"
      );

    bar.style.height = height;
  });
}

// ===============================
// TREND CHART
// ===============================

function initTrendCharts() {

  const trendBars =
    document.querySelectorAll(
      ".trend-bar"
    );

  trendBars.forEach(bar => {

    const width =
      bar.style.getPropertyValue(
        "--w"
      );

    bar.style.width = width;
  });
}

// ===============================
// PERIOD BUTTONS
// ===============================

function initPeriodTabs() {

  document
    .querySelectorAll(
      ".period-btn"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(
              ".period-btn"
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
        "page-stats"
      )
    ) return;

    initBarCharts();

    initTrendCharts();

    initPeriodTabs();
  }
);