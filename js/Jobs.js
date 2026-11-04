
(() => {
  "use strict";

  if (window.__eaSomaliaJobsLoaded) return;
  window.__eaSomaliaJobsLoaded = true;

  // ==========================================
  // DATA SOURCES
  // ==========================================

  const OPPORTUNITIES_URL = "/data/jobs.json";
  const PROGRAMMES_URL = "/data/programmes.json";

  // ==========================================
  // SHARED HELPERS
  // ==========================================

  async function fetchJSON(url) {
    const response = await fetch(url, {
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }

    return response.json();
  }

  function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function safeURL(value) {
    try {
      const url = new URL(value, window.location.origin);

      if (
        url.protocol !== "https:" &&
        url.protocol !== "http:"
      ) {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function getArray(data, property) {
    if (Array.isArray(data)) return data;

    if (data && Array.isArray(data[property])) {
      return data[property];
    }

    return [];
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    return element;
  }

  function addLink(parent, url, label, className = "btn ghost") {
    const safe = safeURL(url);
    if (!safe) return;

    const link = createElement("a", className, label);

    link.href = safe;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    parent.appendChild(link);
  }

  // ==========================================
  // OPPORTUNITIES BOARD
  // ==========================================

  function initializeOpportunitiesBoard() {
    const list = document.getElementById("job-list");
    if (!list) return;

    const count = document.getElementById("opp-count");
    const search = document.getElementById("opp-search");
    const clearButton = document.getElementById("f-clear");

    const filters = {
      area: document.getElementById("f-area"),
      type: document.getElementById("f-type"),
      source: document.getElementById("f-source"),
      location: document.getElementById("f-location"),
      org: document.getElementById("f-org"),
      closing: document.getElementById("f-closing"),
      sort: document.getElementById("f-sort")
    };

    let opportunities = [];

    // ------------------------------------------
    // FILTERS
    // ------------------------------------------

    function getFilterValue(element) {
      return element ? normalize(element.value) : "";
    }

    function formatLabel(value) {
      return String(value)
        .replace(/-/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());
    }

    function populateSelect(element, values, placeholder) {
      if (!element) return;

      element.replaceChildren();

      const defaultOption = document.createElement("option");
      defaultOption.value = "all";
      defaultOption.textContent = placeholder;

      element.appendChild(defaultOption);

      [...new Set(values.filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b)))
        .forEach(value => {
          const option = document.createElement("option");
          option.value = normalize(value);
          option.textContent = formatLabel(value);
          element.appendChild(option);
        });
    }

    function populateFilters() {
      populateSelect(
        filters.area,
        opportunities.map(job => job.category),
        "All areas"
      );

      populateSelect(
        filters.type,
        opportunities.map(job => job.type),
        "All types"
      );

      populateSelect(
        filters.source,
        opportunities.map(job => job.source),
        "All sources"
      );

      populateSelect(
        filters.location,
        opportunities.map(job => job.location),
        "All locations"
      );

      populateSelect(
        filters.org,
        opportunities.map(job => job.org),
        "All organisations"
      );

      if (filters.closing) {
        filters.closing.replaceChildren();

        [
          ["all", "Any closing date"],
          ["7", "Closing within 7 days"],
          ["14", "Closing within 14 days"],
          ["30", "Closing within 30 days"],
          ["open", "All open opportunities"],
          ["expired", "Expired opportunities"]
        ].forEach(([value, label]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = label;
          filters.closing.appendChild(option);
        });
      }

      if (filters.sort) {
        filters.sort.replaceChildren();

        [
          ["newest", "Newest first"],
          ["oldest", "Oldest first"],
          ["deadline", "Closing date"]
        ].forEach(([value, label]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = label;
          filters.sort.appendChild(option);
        });

        filters.sort.value = "newest";
      }
    }

    // ------------------------------------------
    // FILTER MATCHING
    // ------------------------------------------

    function matchesClosingDate(job, filter) {
      if (!filter || filter === "all") return true;
      if (!job.deadline) return false;

      const deadline = new Date(job.deadline);

      if (Number.isNaN(deadline.getTime())) return false;

      const daysRemaining =
        (deadline.getTime() - Date.now()) / 86400000;

      if (filter === "expired") return daysRemaining < 0;

      if (filter === "7") {
        return daysRemaining >= 0 && daysRemaining <= 7;
      }

      if (filter === "14") {
        return daysRemaining >= 0 && daysRemaining <= 14;
      }

      if (filter === "30") {
        return daysRemaining >= 0 && daysRemaining <= 30;
      }

      if (filter === "open") return daysRemaining >= 0;

      return true;
    }

    function matchesJob(job) {
      const area = getFilterValue(filters.area);
      const type = getFilterValue(filters.type);
      const source = getFilterValue(filters.source);
      const location = getFilterValue(filters.location);
      const org = getFilterValue(filters.org);
      const closing = getFilterValue(filters.closing);
      const query = normalize(search?.value);

      const searchableText = [
        job.title,
        job.org,
        job.source,
        job.location,
        job.eligibility,
        job.description,
        job.category,
        ...(Array.isArray(job.tags) ? job.tags : [])
      ].map(normalize).join(" ");

      if (query && !searchableText.includes(query)) return false;

      if (area !== "all" && area &&
          !normalize(job.category).includes(area)) return false;

      if (type !== "all" && type &&
          !normalize(job.type).includes(type)) return false;

      if (source !== "all" && source &&
          !normalize(job.source).includes(source)) return false;

      if (location !== "all" && location &&
          !normalize(job.location).includes(location)) return false;

      if (org !== "all" && org &&
          !normalize(job.org).includes(org)) return false;

      return matchesClosingDate(job, closing);
    }

    // ------------------------------------------
    // SORTING
    // ------------------------------------------

    function sortJobs(jobs) {
      const sort = getFilterValue(filters.sort);

      return [...jobs].sort((a, b) => {
        if (sort === "deadline") {
          return new Date(a.deadline || "9999-12-31") -
            new Date(b.deadline || "9999-12-31");
        }

        if (sort === "oldest") {
          return new Date(a.posted || 0) -
            new Date(b.posted || 0);
        }

        return new Date(b.posted || 0) -
          new Date(a.posted || 0);
      });
    }

    // ------------------------------------------
    // OPPORTUNITY CARD
    // ------------------------------------------

    function renderJob(job) {
      const card = createElement("article", "card job");
      const content = createElement("div", "job-content");

      if (job.category) {
        content.appendChild(
          createElement("span", "tag", formatLabel(job.category))
        );
      }

      content.appendChild(
        createElement("h3", "", job.title || "Untitled opportunity")
      );

      content.appendChild(
        createElement("p", "job-org", job.org || "Organisation not specified")
      );

      const meta = createElement("div", "job-meta");

      [
        job.location,
        job.type ? formatLabel(job.type) : "",
        job.source
      ].filter(Boolean).forEach(value => {
        meta.appendChild(createElement("span", "", value));
      });

      content.appendChild(meta);

      if (job.eligibility) {
        content.appendChild(createElement("p", "", job.eligibility));
      }

      if (job.length) {
        content.appendChild(
          createElement("p", "", `Duration: ${job.length}`)
        );
      }

      const dates = createElement("div", "job-dates");

      if (job.posted) {
        dates.appendChild(
          createElement("span", "", `Posted: ${formatDate(job.posted)}`)
        );
      }

      if (job.deadline) {
        dates.appendChild(
          createElement("span", "", `Deadline: ${formatDate(job.deadline)}`)
        );
      }

      content.appendChild(dates);
      card.appendChild(content);

      addLink(card, job.url, "View opportunity");

      return card;
    }

    // ------------------------------------------
    // RENDER RESULTS
    // ------------------------------------------

    function render() {
      const filtered = sortJobs(
        opportunities.filter(matchesJob)
      );

      list.replaceChildren();

      if (count) {
        count.textContent =
          `${filtered.length} ${
            filtered.length === 1 ? "opportunity" : "opportunities"
          }`;
      }

      if (!filtered.length) {
        const empty = createElement("div", "empty-state");

        empty.appendChild(
          createElement("p", "", "No opportunities match your search.")
        );

        empty.appendChild(
          createElement("p", "", "Try changing your filters or search terms.")
        );

        list.appendChild(empty);
        return;
      }

      filtered.forEach(job => {
        list.appendChild(renderJob(job));
      });
    }

    // ------------------------------------------
    // CLEAR FILTERS
    // ------------------------------------------

    function clearFilters() {
      Object.values(filters).forEach(element => {
        if (element) element.selectedIndex = 0;
      });

      if (search) search.value = "";

      render();
    }

    // ------------------------------------------
    // EVENTS
    // ------------------------------------------

    Object.values(filters).forEach(element => {
      if (element) element.addEventListener("change", render);
    });

    if (search) search.addEventListener("input", render);

    if (clearButton) {
      clearButton.addEventListener("click", clearFilters);
    }

    // ------------------------------------------
    // LOAD JOBS
    // ------------------------------------------

    async function loadOpportunities() {
      list.textContent = "Loading opportunities…";

      try {
        const data = await fetchJSON(OPPORTUNITIES_URL);

        opportunities = getArray(data, "jobs").filter(job =>
          job &&
          typeof job.title === "string" &&
          job.title.trim() &&
          typeof job.url === "string" &&
          safeURL(job.url)
        );

        populateFilters();
        render();

      } catch (error) {
        console.error("Opportunities loading error:", error);

        list.replaceChildren();

        list.appendChild(
          createElement(
            "p",
            "empty-state",
            "We could not load opportunities right now. Please try again later."
          )
        );

        if (count) count.textContent = "0 opportunities";
      }
    }

    loadOpportunities();
  }

  // ==========================================
  // PROGRAMMES
  // ==========================================

  function initializeProgrammes() {
    const list =
      document.getElementById("programme-list") ||
      document.getElementById("programmes-list");

    if (!list) return;

    async function loadProgrammes() {
      try {
        const data = await fetchJSON(PROGRAMMES_URL);
        const programmes = getArray(data, "programmes");

        list.replaceChildren();

        if (!programmes.length) {
          list.textContent = "No programmes are currently listed.";
          return;
        }

        programmes.forEach(programme => {
          const card = createElement("article", "card");

          card.appendChild(
            createElement("h3", "", programme.title || "Programme")
          );

          if (programme.org) {
            card.appendChild(createElement("p", "", programme.org));
          }

          if (programme.description) {
            card.appendChild(
              createElement("p", "", programme.description)
            );
          }

          if (programme.deadline) {
            card.appendChild(
              createElement(
                "p",
                "",
                `Deadline: ${formatDate(programme.deadline)}`
              )
            );
          }

          addLink(card, programme.url, "Learn more");

          list.appendChild(card);
        });

      } catch (error) {
        console.error("Programmes loading error:", error);
        list.textContent = "Programmes could not be loaded.";
      }
    }

    loadProgrammes();
  }

  // ==========================================
  // INITIALIZE PAGE
  // ==========================================

  function initializeJobsPage() {
    initializeOpportunitiesBoard();
    initializeProgrammes();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeJobsPage,
      { once: true }
    );
  } else {
    initializeJobsPage();
  }

})();
