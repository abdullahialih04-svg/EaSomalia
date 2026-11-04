/* ==========================================================
   EA SOMALIA — OPPORTUNITIES BOARD
   Reads /data/jobs.json, shows a deadline countdown,
   hides expired listings automatically, and supports
   keyword search + filters.
   ========================================================== */

(function () {
  const AREAS = {
    "animal-welfare": "Animal welfare",
    "global-health": "Global health",
    "ai-safety": "AI safety",
    funding: "Funding",
  };

  const TYPES = {
    job: "Job",
    funding: "Funding",
    fellowship: "Fellowship",
  };

  const $ = (id) => document.getElementById(id);

  // Only run on the opportunities page
  if (!$("job-list")) return;

  let all = [];
  const state = { q: "", area: "", type: "", source: "" };

  // ---------- Helpers ----------

  const esc = (value = "") =>
    String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));

  const safeUrl = (url) => (/^https?:\/\//i.test(url) ? url : "#");

  // A listing stays open until the END of its deadline day (Somalia time, UTC+3)
  const endOf = (day) => new Date(day + "T23:59:59+03:00");

  const isLive = (job) => !job.deadline || endOf(job.deadline) > new Date();

  function deadlineInfo(job) {
    if (!job.deadline) return { text: "Rolling deadline", urgent: false };

    const days = Math.ceil((endOf(job.deadline) - new Date()) / 86400000);

    const date = new Date(job.deadline + "T12:00:00+03:00").toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );

    if (days <= 1) return { text: "Last day to apply (" + date + ")", urgent: true };

    return {
      text: days + " days left · closes " + date,
      urgent: days <= 3,
    };
  }

  function fillSelect(id, label, options) {
    $(id).innerHTML =
      '<option value="">' + esc(label) + "</option>" +
      options
        .map(([value, text]) =>
          '<option value="' + esc(value) + '">' + esc(text) + "</option>")
        .join("");
  }

  // ---------- Filters ----------

  function setupFilters() {
    const live = all.filter(isLive);

    const sources = [...new Set(live.map((j) => j.source).filter(Boolean))].sort();
    const types = [...new Set(live.map((j) => j.type).filter(Boolean))];

    fillSelect("f-area", "All areas", Object.entries(AREAS));
    fillSelect("f-type", "All types", types.map((t) => [t, TYPES[t] || t]));
    fillSelect("f-source", "All sources", sources.map((s) => [s, s]));

    $("opp-search").addEventListener("input", (e) => {
      state.q = e.target.value.toLowerCase();
      render();
    });

    $("f-area").addEventListener("change", (e) => {
      state.area = e.target.value;
      render();
    });

    $("f-type").addEventListener("change", (e) => {
      state.type = e.target.value;
      render();
    });

    $("f-source").addEventListener("change", (e) => {
      state.source = e.target.value;
      render();
    });

    $("f-clear").addEventListener("click", () => {
      Object.assign(state, { q: "", area: "", type: "", source: "" });
      $("opp-search").value = "";
      ["f-area", "f-type", "f-source"].forEach((id) => ($(id).value = ""));
      render();
    });
  }

  // ---------- Render ----------

  function render() {
    const shown = all
      .filter(isLive)
      .filter((j) => !state.area || j.category === state.area)
      .filter((j) => !state.type || j.type === state.type)
      .filter((j) => !state.source || j.source === state.source)
      .filter(
        (j) =>
          !state.q ||
          [j.title, j.org, j.source, j.location]
            .join(" ")
            .toLowerCase()
            .includes(state.q)
      )
      .sort((a, b) =>
        (a.deadline || "9999").localeCompare(b.deadline || "9999")
      );

    $("opp-count").textContent = shown.length;

    if (!shown.length) {
      $("job-list").innerHTML =
        '<div class="opp-empty">No opportunities match your search. ' +
        "Try clearing the filters, or check back next week.</div>";
      return;
    }

    $("job-list").innerHTML = shown
      .map((j) => {
        const d = deadlineInfo(j);

        return (
          '<article class="opp-card">' +
            "<div>" +
              "<h3>" + esc(j.title) + "</h3>" +
              '<p class="opp-meta">' + esc(j.org) +
                (j.location ? " · " + esc(j.location) : "") + "</p>" +
              '<div class="opp-tags">' +
                '<span class="opp-tag">' + esc(AREAS[j.category] || j.category || "Other") + "</span>" +
                '<span class="opp-tag type">' + esc(TYPES[j.type] || j.type || "Job") + "</span>" +
                (j.source ? '<span class="opp-tag src">via ' + esc(j.source) + "</span>" : "") +
              "</div>" +
            "</div>" +
            '<div class="opp-side">' +
              '<span class="opp-deadline' + (d.urgent ? " urgent" : "") + '">' + esc(d.text) + "</span>" +
              '<a class="btn" href="' + esc(safeUrl(j.url)) + '" target="_blank" rel="noopener noreferrer">Apply</a>' +
            "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  // ---------- Load data ----------

  fetch("/data/jobs.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then((data) => {
      // Accept a plain list, or an object with a "jobs" list
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data && data.jobs)
        ? data.jobs
        : [];

      all = list.filter((j) => j && j.title && j.url);

      setupFilters();
      render();
    })
    .catch((error) => {
      console.error("Opportunities loading error:", error);
      $("job-list").innerHTML =
        '<div class="opp-empty">Could not load opportunities. ' +
        "Please try again later.</div>";
    });
})();
