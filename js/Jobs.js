
(() => {
  "use strict";

  // =====================================================
  // EA SOMALIA — OPPORTUNITIES BOARD
  // Version: 2.0
  // =====================================================

  // Prevent duplicate initialization
  if (window.__eaSomaliaJobsLoaded) return;
  window.__eaSomaliaJobsLoaded = true;

  // =====================================================
  // CONFIGURATION
  // =====================================================

  const CONFIG = {
    jobsURL: "/data/jobs.json",
    programmesURL: "/data/programmes.json",
    fetchTimeout: 15000,
    dateLocale: "en-GB"
  };

  // =====================================================
  // SHARED HELPERS
  // =====================================================

  const $ = (id) => document.getElementById(id);

  function text(value) {
    if (Array.isArray(value)) {
      return value.map(text).filter(Boolean).join(", ");
    }

    if (value === null || value === undefined) return "";

    return String(value).trim();
  }

  function normalize(value) {
    return text(value).toLowerCase().trim();
  }

  function formatLabel(value) {
    return text(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function createElement(tag, className, content) {
    const element = document.createElement(tag);

    if (className) element.className = className;

    if (content !== undefined) {
      element.textContent = text(content);
    }

    return element;
  }

  function safeURL(value) {
    try {
      const url = new URL(text(value), window.location.origin);

      if (!["http:", "https:"].includes(url.protocol)) {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString(CONFIG.dateLocale, {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  function dateValue(value) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date.getTime();
  }

  function getArray(data, property) {
    if (Array.isArray(data)) return data;

    if (data && Array.isArray(data[property])) {
      return data[property];
    }

    return [];
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

  // =====================================================
  // FETCHING
  // =====================================================

  async function fetchJSON(url) {
    const controller = new AbortController();

    const timeout = window.setTimeout(
      () => controller.abort(),
      CONFIG.fetchTimeout
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json"
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(
          `Request failed: ${url} (HTTP ${response.status})`
        );
      }

      const contentType =
        response.headers.get("content-type") || "";

      if (
        contentType &&
        !contentType.includes("application/json") &&
        !contentType.includes("text/json")
      ) {
        throw new Error(
          `Expected JSON from ${url}, received ${contentType}`
        );
      }

      return await response.json();

    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timed out: ${url}`);
      }

      throw error;

    } finally {
      window.clearTimeout(timeout);
    }
  }

  // =====================================================
  // OPPORTUNITY DATA VALIDATION
  // =====================================================

  function normalizeOpportunity(job, index) {
    if (!job || typeof job !== "object" || Array.isArray(job)) {
      console.warn(`Invalid opportunity at position ${index}`);
      return null;
    }

    const title = text(job.title);
    const url = safeURL(job.url);

    if (!title || !url) {
      console.warn(
        `Opportunity ${index + 1} skipped: missing title or valid URL`,
        job
      );

      return null;
    }

    return {
      ...job,
      title,
      url,
      org: text(job.org || job.organisation),
      source: text(job.source),
      type: text(job.type || "job"),
      category: text(job.category || job.area),
      location: text(job.location),
      eligibility: text(job.eligibility),
      description: text(job.description),
      length: text(job.length),
      posted: text(job.posted),
      deadline: text(job.deadline),
      tags: Array.isArray(job.tags)
        ? job.tags.map(text).filter(Boolean)
        : []
    };
  }

  // =====================================================
  // OPPORTUNITIES BOARD
  // =====================================================

  function initializeOpportunitiesBoard() {
    const list = $("job-list");

    // Stop if this page does not contain the jobs board
    if (!list) return;

    const count = $("opp-count");
    const search = $("opp-search");
    const clearButton = $("f-clear");

    const filters = {
      area: $("f-area"),
      type: $("f-type"),
      source: $("f-source"),
      location: $("f-location"),
      org: $("f-org"),
      closing: $("f-closing"),
      sort: $("f-sort")
    };

    let opportunities = [];

    // -----------------------------------------------------
    // STATUS MESSAGES
    // -----------------------------------------------------

    function showMessage(title, description, error = false) {
      list.replaceChildren();

      const container = createElement(
        "div",
        error ? "empty-state error-state" : "empty-state"
      );

      container.appendChild(
        createElement("h3", "", title)
      );

      if (description) {
        container.appendChild(
          createElement("p", "", description)
        );
      }

      list.appendChild(container);

      list.setAttribute("aria-busy", "false");

      if (count) {
        count.textContent = "0 opportunities";
      }
    }

    // -----------------------------------------------------
    // FILTER OPTIONS
    // -----------------------------------------------------

    function populateSelect(element, values, placeholder) {
      if (!element) return;

      const previousValue = element.value;

      element.replaceChildren();

      const defaultOption = document.createElement("option");

      defaultOption.value = "all";
      defaultOption.textContent = placeholder;

      element.appendChild(defaultOption);

      const uniqueValues = [
        ...new Set(values.map(text).filter(Boolean))
      ].sort((a, b) => a.localeCompare(b));

      uniqueValues.forEach(value => {
        const option = document.createElement("option");

        option.value = normalize(value);
        option.textContent = formatLabel(value);

        element.appendChild(option);
      });

      if (
        [...element.options].some(
          option => option.value === previousValue
        )
      ) {
        element.value = previousValue;
      }
    }

    function populateClosingFilter() {
      const element = filters.closing;

      if (!element) return;

      const previousValue = element.value;

      element.replaceChildren();

      const options = [
        ["all", "Any closing date"],
        ["7", "Closing within 7 days"],
        ["14", "Closing within 14 days"],
        ["30", "Closing within 30 days"],
        ["open", "All open opportunities"],
        ["expired", "Expired opportunities"]
      ];

      options.forEach(([value, label]) => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = label;

        element.appendChild(option);
      });

      element.value = previousValue || "all";
    }

    function populateSortFilter() {
      const element = filters.sort;

      if (!element) return;

      const previousValue = element.value || "newest";

      element.replaceChildren();

      [
        ["newest", "Newest first"],
        ["oldest", "Oldest first"],
        ["deadline", "Closing date"]
      ].forEach(([value, label]) => {
        const option = document.createElement("option");

        option.value = value;
        option.textContent = label;

        element.appendChild(option);
      });

      element.value = previousValue;
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

      populateClosingFilter();
      populateSortFilter();
    }

    // -----------------------------------------------------
    // FILTER MATCHING
    // -----------------------------------------------------

    function matchesClosingDate(job, filter) {
      if (!filter || filter === "all") return true;

      const deadline = dateValue(job.deadline);

      // No deadline: do not classify as expired.
      if (deadline === null) {
        return filter === "open";
      }

      const daysRemaining =
        (deadline - Date.now()) / 86400000;

      if (filter === "expired") {
        return daysRemaining < 0;
      }

      if (filter === "open") {
        return daysRemaining >= 0;
      }

      const days = Number(filter);

      if ([7, 14, 30].includes(days)) {
        return daysRemaining >= 0 && daysRemaining <= days;
      }

      return true;
    }

    function matchesJob(job) {
      const area = filters.area?.value || "all";
      const type = filters.type?.value || "all";
      const source = filters.source?.value || "all";
      const location = filters.location?.value || "all";
      const org = filters.org?.value || "all";
      const closing = filters.closing?.value || "all";

      const query = normalize(search?.value);

      const searchableText = normalize([
        job.title,
        job.org,
        job.source,
        job.location,
        job.eligibility,
        job.description,
        job.category,
        job.type,
        ...job.tags
      ].join(" "));

      if (query && !searchableText.includes(query)) {
        return false;
      }

      if (
        area !== "all" &&
        !normalize(job.category).includes(area)
      ) return false;

      if (
        type !== "all" &&
        !normalize(job.type).includes(type)
      ) return false;

      if (
        source !== "all" &&
        !normalize(job.source).includes(source)
      ) return false;

      if (
        location !== "all" &&
        !normalize(job.location).includes(location)
      ) return false;

      if (
        org !== "all" &&
        !normalize(job.org).includes(org)
      ) return false;

      return matchesClosingDate(job, closing);
    }

    // -----------------------------------------------------
    // SORTING
    // -----------------------------------------------------

    function sortJobs(jobs) {
      const sort = filters.sort?.value || "newest";

      return [...jobs].sort((a, b) => {
        const dateA = dateValue(a.posted);
        const dateB = dateValue(b.posted);

        const deadlineA = dateValue(a.deadline);
        const deadlineB = dateValue(b.deadline);

        if (sort === "deadline") {
          if (deadlineA === null) return 1;
          if (deadlineB === null) return -1;

          return deadlineA - deadlineB;
        }

        if (sort === "oldest") {
          return (dateA ?? 0) - (dateB ?? 0);
        }

        return (dateB ?? 0) - (dateA ?? 0);
      });
    }

    // -----------------------------------------------------
    // OPPORTUNITY CARD
    // -----------------------------------------------------

    function renderJob(job) {
      const card = createElement("article", "card job");

      const content = createElement("div", "job-content");

      if (job.category) {
        content.appendChild(
          createElement(
            "span",
            "tag",
            formatLabel(job.category)
          )
        );
      }

      content.appendChild(
        createElement("h3", "", job.title)
      );

      content.appendChild(
        createElement(
          "p",
          "job-org",
          job.org || "Organisation not specified"
        )
      );

      // Location, type and source
      const meta = createElement("div", "job-meta");

      [
        job.location,
        job.type ? formatLabel(job.type) : "",
        job.source
      ].filter(Boolean).forEach(value => {
        meta.appendChild(
          createElement("span", "", value)
        );
      });

      content.appendChild(meta);

      // Description
      if (job.description) {
        content.appendChild(
          createElement("p", "job-description", job.description)
        );
      }

      // Eligibility
      if (job.eligibility) {
        content.appendChild(
          createElement("p", "job-eligibility", job.eligibility)
        );
      }

      // Duration
      if (job.length) {
        content.appendChild(
          createElement("p", "job-duration", `Duration: ${job.length}`)
        );
      }

      // Dates
      const dates = createElement("div", "job-dates");

      if (job.posted) {
        dates.appendChild(
          createElement(
            "span",
            "",
            `Posted: ${formatDate(job.posted)}`
          )
        );
      }

      if (job.deadline) {
        dates.appendChild(
          createElement(
            "span",
            "",
            `Deadline: ${formatDate(job.deadline)}`
          )
        );
      }

      content.appendChild(dates);

      card.appendChild(content);

      addLink(card, job.url, "View opportunity");

      return card;
    }

    // -----------------------------------------------------
    // RENDER RESULTS
    // -----------------------------------------------------

    function render() {
      const filtered = sortJobs(
        opportunities.filter(matchesJob)
      );

      list.replaceChildren();

      list.setAttribute("aria-busy", "false");

      if (count) {
        count.textContent =
          `${filtered.length} ${
            filtered.length === 1
              ? "opportunity"
              : "opportunities"
          }`;
      }

      if (!filtered.length) {
        showMessage(
          "No opportunities found",
          "Try changing your search terms or filters."
        );

        return;
      }

      const fragment = document.createDocumentFragment();

      filtered.forEach(job => {
        fragment.appendChild(renderJob(job));
      });

      list.appendChild(fragment);
    }

    // -----------------------------------------------------
    // CLEAR FILTERS
    // -----------------------------------------------------

    function clearFilters() {
      Object.values(filters).forEach(element => {
        if (element) element.value = "all";
      });

      if (filters.sort) {
        filters.sort.value = "newest";
      }

      if (search) {
        search.value = "";
      }

      render();
    }

    // -----------------------------------------------------
    // EVENT LISTENERS
    // -----------------------------------------------------

    Object.values(filters).forEach(element => {
      if (element) {
        element.addEventListener("change", render);
      }
    });

    if (search) {
      search.addEventListener("input", render);
    }

    if (clearButton) {
      clearButton.addEventListener("click", clearFilters);
    }

    // -----------------------------------------------------
    // LOAD OPPORTUNITIES
    // -----------------------------------------------------

    async function loadOpportunities() {
      list.setAttribute("aria-busy", "true");

      showMessage(
        "Loading opportunities…",
        "Please wait while we retrieve the latest listings."
      );

      try {
        console.info("[EA Somalia] Fetching jobs:", CONFIG.jobsURL);

        const data = await fetchJSON(CONFIG.jobsURL);

        const rawJobs = getArray(data, "jobs");

        opportunities = rawJobs
          .map(normalizeOpportunity)
          .filter(Boolean);

        console.info(
          `[EA Somalia] Loaded ${opportunities.length} valid opportunities.`
        );

        if (rawJobs.length !== opportunities.length) {
          console.warn(
            `[EA Somalia] ${rawJobs.length - opportunities.length} invalid records were skipped.`
          );
        }

        populateFilters();
        render();

      } catch (error) {
        console.error(
          "[EA Somalia] Opportunities loading error:",
          error
        );

        showMessage(
          "Unable to load opportunities",
          "Please try again later. Technical details are available in the browser console.",
          true
        );
      }
    }

    loadOpportunities();
  }

  // =====================================================
  // PROGRAMMES
  // =====================================================

  function initializeProgrammes() {
    const list =
      $("programme-list") ||
      $("programmes-list");

    if (!list) return;

    async function loadProgrammes() {
      list.setAttribute("aria-busy", "true");

      try {
        const data = await fetchJSON(CONFIG.programmesURL);

        const programmes = getArray(data, "programmes");

        list.replaceChildren();

        if (!programmes.length) {
          list.textContent = "No programmes are currently listed.";
          list.setAttribute("aria-busy", "false");
          return;
        }

        const fragment = document.createDocumentFragment();

        programmes.forEach(programme => {
          if (!programme || typeof programme !== "object") return;

          const card = createElement("article", "card");

          card.appendChild(
            createElement(
              "h3",
              "",
              programme.title || "Programme"
            )
          );

          if (programme.org) {
            card.appendChild(
              createElement("p", "", programme.org)
            );
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

          addLink(
            card,
            programme.url,
            "Learn more"
          );

          fragment.appendChild(card);
        });

        list.appendChild(fragment);
        list.setAttribute("aria-busy", "false");

        console.info(
          `[EA Somalia] Loaded ${programmes.length} programmes.`
        );

      } catch (error) {
        console.error(
          "[EA Somalia] Programmes loading error:",
          error
        );

        list.textContent = "Programmes could not be loaded.";
        list.setAttribute("aria-busy", "false");
      }
    }

    loadProgrammes();
  }

  // =====================================================
  // INITIALIZE
  // =====================================================

  function initializeJobsPage() {
    console.info("[EA Somalia] Initializing opportunities page.");

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
