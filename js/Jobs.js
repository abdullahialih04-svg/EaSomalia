/* ==========================================================
   EA SOMALIA — OPPORTUNITIES BOARD
   Loads /data/jobs.json (weekly jobs) and /data/programmes.json
   (recurring internships and fellowships), shows a deadline
   countdown, hides expired listings automatically, and supports
   keyword search, filters and sorting.
   ========================================================== */

(function () {
  const AREAS = {
    "animal-welfare": "Animal welfare",
    "global-health": "Global health",
    "ai-safety": "AI safety",
    biosecurity: "Biosecurity",
    "climate-change": "Climate change",
    society: "Societal improvements",
    funding: "Funding",
    other: "Other cause areas",
  };

  const TYPES = {
    job: "Job",
    internship: "Internship",
    fellowship: "Fellowship",
    programme: "Programme",
    course: "Course",
    funding: "Funding",
  };

  const $ = (id) => document.getElementById(id);

  // Only run on the opportunities page
  if (!$("job-list")) return;

  let all = [];

  const state = {
    q: "",
    category: "",
    type: "",
    source: "",
    location: "",
    org: "",
    closing: "",
    sort: "featured",
  };

  // [select id, job field] (category is handled separately: a job can have several)
  const FILTERS = [
    ["f-type", "type"],
    ["f-source", "source"],
    ["f-location", "location"],
    ["f-org", "org"],
  ];

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

  const cats = (job) =>
    (Array.isArray(job.category) ? job.category : [job.category]).filter(Boolean);

  // A listing stays open until the END of its deadline day (Somalia time, UTC+3)
  const endOf = (day) => new Date(day + "T23:59:59+03:00");

  const isLive = (job) => !job.deadline || endOf(job.deadline) > new Date();

  const daysLeft = (job) =>
    Math.ceil((endOf(job.deadline) - new Date()) / 86400000);

  function deadlineInfo(job) {
    if (!job.deadline) {
      return {
        text: job.recurring ? "Recurring · check the site for dates" : "Rolling deadline",
        urgent: false,
      };
    }

    const days = daysLeft(job);

    const date = new Date(job.deadline + "T12:00:00+03:00").toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );

    if (days <= 1) return { text: "Last day to apply · " + date, urgent: true };

    return { text: days + " days left · closes " + date, urgent: days <= 3 };
  }

  function initials(name = "") {
    const letters = name
      .replace(/[^\p{L}\s]/gu, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");

    return letters || "•";
  }

  function fillSelect(id, placeholder, options) {
    $(id).innerHTML =
      (placeholder === null
        ? ""
        : '<option value="">' + esc(placeholder) + "</option>") +
      options
        .map(([value, text]) =>
          '<option value="' + esc(value) + '">' + esc(text) + "</option>")
        .join("");
  }

  function matchesClosing(job, value) {
    if (!value) return true;
    if (value === "rolling") return !job.deadline;
    if (!job.deadline) return false;

    const days = daysLeft(job);
    return value === "week" ? days <= 7 : days <= 30;
  }

  const byDeadline = (a, b) =>
    (a.deadline || "9999").localeCompare(b.deadline || "9999");

  const sorters = {
    featured: (a, b) =>
      Number(!!b.highlight) - Number(!!a.highlight) || byDeadline(a, b),
    closing: byDeadline,
    title: (a, b) => a.title.localeCompare(b.title),
  };

  // ---------- Filters ----------

  function setupFilters() {
    const live = all.filter(isLive);
    const unique = (key) =>
      [...new Set(live.map((j) => j[key]).filter(Boolean))].sort();

    fillSelect("f-area", "Area", Object.entries(AREAS));
    fillSelect("f-type", "Type", unique("type").map((t) => [t, TYPES[t] || t]));
    fillSelect("f-source", "Source", unique("source").map((s) => [s, s]));
    fillSelect("f-location", "Location", unique("location").map((l) => [l, l]));
    fillSelect("f-org", "Organisation", unique("org").map((o) => [o, o]));
    fillSelect("f-closing", "Closing date", [
      ["week", "Within 7 days"],
      ["month", "Within 30 days"],
      ["rolling", "Recurring / rolling"],
    ]);
    fillSelect("f-sort", null, [
      ["featured", "Featured first"],
      ["closing", "Closing soonest"],
      ["title", "Title A–Z"],
    ]);

    $("opp-search").addEventListener("input", (e) => {
      state.q = e.target.value.toLowerCase();
      render();
    });

    $("f-area").addEventListener("change", (e) => {
      state.category = e.target.value;
      render();
    });

    FILTERS.forEach(([id, key]) => {
      $(id).addEventListener("change", (e) => {
        state[key] = e.target.value;
        render();
      });
    });

    $("f-closing").addEventListener("change", (e) => {
      state.closing = e.target.value;
      render();
    });

    $("f-sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });

    $("f-clear").addEventListener("click", () => {
      Object.assign(state, {
        q: "",
        category: "",
        type: "",
        source: "",
        location: "",
        org: "",
        closing: "",
      });

      $("opp-search").value = "";
      ["f-area", "f-closing", ...FILTERS.map(([id]) => id)].forEach((id) => {
        $(id).value = "";
      });

      render();
    });
  }

  // ---------- Render ----------

  function render() {
    const shown = all
      .filter(isLive)
      .filter((j) => !state.category || cats(j).includes(state.category))
      .filter((j) => FILTERS.every(([, key]) => !state[key] || j[key] === state[key]))
      .filter((j) => matchesClosing(j, state.closing))
      .filter(
        (j) =>
          !state.q ||
          [j.title, j.org, j.source, j.location, j.eligibility]
            .join(" ")
            .toLowerCase()
            .includes(state.q)
      )
      .sort(sorters[state.sort] || sorters.featured);

    $("opp-count").textContent =
      shown.length + (shown.length === 1 ? " opportunity" : " opportunities");

    if (!shown.length) {
      $("job-list").innerHTML =
        '<div class="opp-empty">No opportunities match your search. ' +
        "Try clearing the filters, or check back next week.</div>";
      return;
    }

    $("job-list").innerHTML = shown
      .map((j) => {
        const d = deadlineInfo(j);
        const url = esc(safeUrl(j.url));

        const detail = [
          j.length ? "Length: " + j.length : "",
          j.eligibility ? j.eligibility : "",
        ].filter(Boolean).join(" · ");

        const areaTags = (cats(j).length ? cats(j) : ["other"])
          .map((c) => '<span class="opp-tag">' + esc(AREAS[c] || c) + "</span>")
          .join("");

        return (
          '<article class="opp-card">' +
            '<div class="opp-avatar" aria-hidden="true">' + esc(initials(j.org)) + "</div>" +

            '<div class="opp-main">' +
              '<h3><a href="' + url + '" target="_blank" rel="noopener noreferrer">' + esc(j.title) + "</a></h3>" +
              '<p class="opp-org">' + esc(j.org) + "</p>" +
              (j.location
                ? '<p class="opp-meta">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>' +
                    esc(j.location) +
                  "</p>"
                : "") +
              (detail ? '<p class="opp-detail">' + esc(detail) + "</p>" : "") +
              '<div class="opp-tags">' +
                areaTags +
                '<span class="opp-tag type">' + esc(TYPES[j.type] || j.type || "Job") + "</span>" +
                (j.source ? '<span class="opp-tag src">via ' + esc(j.source) + "</span>" : "") +
              "</div>" +
            "</div>" +

            '<div class="opp-side">' +
              (j.highlight ? '<span class="opp-flag">Featured</span>' : "<span></span>") +
              '<span class="opp-deadline' + (d.urgent ? " urgent" : "") + '">' + esc(d.text) + "</span>" +
              '<a class="btn sm" href="' + url + '" target="_blank" rel="noopener noreferrer">Apply</a>' +
            "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  // ---------- Load data ----------

  const asList = (data) =>
    Array.isArray(data) ? data : Array.isArray(data && data.jobs) ? data.jobs : [];

  const load = (url) =>
    fetch(url, { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(url + " returned HTTP " + response.status);
        return response.json();
      })
      .then(asList);

  Promise.allSettled([load("/data/jobs.json"), load("/data/programmes.json")])
    .then((results) => {
      results.forEach((r) => {
        if (r.status === "rejected") console.warn("Opportunities file problem:", r.reason);
      });

      if (results.every((r) => r.status === "rejected")) {
        throw results[0].reason;
      }

      all = results
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .filter((j) => j && j.title && j.url);

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
