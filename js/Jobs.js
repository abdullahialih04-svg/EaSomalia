
(() => {
  "use strict";

  // Prevent duplicate initialization.
  if (window.__eaSomaliaJobsLoaded) return;
  window.__eaSomaliaJobsLoaded = true;

  // ==========================================
  // Data Sources
  // ==========================================

  const OPPORTUNITIES_URL = "/data/opportunities.json";
  const SOMALIA_JOBS_URL = "/data/somalia-jobs.json";
  const PROGRAMMES_URL = "/data/programmes.json";

  const RELIEFWEB_URL =
    "https://reliefweb.int/jobs?list=Somalia%20Jobs&advanced-search=%28C216%29";

  // ==========================================
  // Shared Helpers
  // ==========================================

  async function fetchJSON(url) {
    const response = await fetch(url, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`${url} returned HTTP ${response.status}`);
    }

    return response.json();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
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

  function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function getArray(data, property) {
    if (Array.isArray(data)) return data;

    if (data && Array.isArray(data[property])) {
      return data[property];
    }

    return [];
  }

  function safeURL(value) {
    try {
      const url = new URL(value, window.location.origin);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function isReliefWebURL(value) {
    try {
      const url = new URL(value);

      return (
        url.protocol === "https:" &&
        (url.hostname === "reliefweb.int" ||
          url.hostname.endsWith(".reliefweb.int"))
      );
    } catch {
      return false;
    }
  }

  // ==========================================
  // General Opportunities Board
  // ==========================================

  function initializeOpportunitiesBoard() {
    const list = document.getElementById("job-list");

    // Do not run unless this page has the opportunities board.
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

    function getFilterValue(element) {
      return element ? normalize(element.value) : "";
    }

    function matchesClosingDate(job, filter) {
      if (!filter || filter === "all" || filter === "any") return true;

      if (!job.deadline) return false;

      const deadline = new Date(job.deadline);
      if (Number.isNaN(deadline.getTime())) return false;

      const now = new Date();
      const daysRemaining =
        (deadline.getTime() - now.getTime()) / 86400000;

      if (filter.includes("expired") || filter.includes("closed")) {
        return daysRemaining < 0;
      }

      if (filter.includes("7")) return daysRemaining >= 0 && daysRemaining <= 7;
      if (filter.includes("14")) return daysRemaining >= 0 && daysRemaining <= 14;
      if (filter.includes("30")) return daysRemaining >= 0 && daysRemaining <= 30;

      if (filter.includes("open")) return daysRemaining >= 0;

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

      if (area && area !== "all" &&
          !normalize(job.category).includes(area)) return false;

      if (type && type !== "all" &&
          !normalize(job.type).includes(type)) return false;

      if (source && source !== "all" &&
          !normalize(job.source).includes(source)) return false;

      if (location && location !== "all" &&
          !normalize(job.location).includes(location)) return false;

      if (org && org !== "all" &&
          !normalize(job.org).includes(org)) return false;

      if (!matchesClosingDate(job, closing)) return false;

      return true;
    }

    function sortJobs(jobs) {
      const sort = getFilterValue(filters.sort);

      return [...jobs].sort((a, b) => {
        if (sort.includes("deadline") || sort.includes("closing")) {
          const dateA = new Date(a.deadline || "9999-12-31");
          const dateB = new Date(b.deadline || "9999-12-31");
          return dateA - dateB;
        }

        if (sort.includes("oldest")) {
          return new Date(a.posted || 0) - new Date(b.posted || 0);
        }

        // Default: newest first.
        return new Date(b.posted || 0) - new Date(a.posted || 0);
      });
    }

    function renderJob(job) {
      const url = safeURL(job.url);

      const title = escapeHTML(job.title || "Untitled opportunity");
      const org = escapeHTML(job.org || "Organization not specified");
      const location = escapeHTML(job.location || "Location not specified");
      const type = escapeHTML(job.type || "");
      const category = escapeHTML(job.category || "");
      const source = escapeHTML(job.source || "");
      const eligibility = escapeHTML(job.eligibility || "");
      const deadline = formatDate(job.deadline);
      const posted = formatDate(job.posted);

      return `
        <article class="card job">
          <div class="job-content">
            ${category ? `<span class="tag">${category}</span>` : ""}

            <h3>${title}</h3>

            <p class="job-org">${org}</p>

            <div class="job-meta">
              ${location ? `<span>${location}</span>` : ""}
              ${type ? `<span>${type}</span>` : ""}
              ${source ? `<span>${source}</span>` : ""}
            </div>

            ${eligibility ? `<p>${eligibility}</p>` : ""}

            <div class="job-dates">
              ${posted ? `<span>Posted: ${posted}</span>` : ""}
              ${deadline ? `<span>Deadline: ${deadline}</span>` : ""}
            </div>
          </div>

          ${
            url
              ? `<a class="btn ghost" href="${url}" target="_blank"
                    rel="noopener noreferrer">View opportunity</a>`
              : ""
          }
        </article>
      `;
    }

    function render() {
      const filtered = sortJobs(opportunities.filter(matchesJob));

      list.replaceChildren();

      if (count) {
        count.textContent = String(filtered.length);
      }

      if (!filtered.length) {
        list.innerHTML = `
          <div class="empty-state">
            <p>No opportunities match your search.</p>
            <p>Try changing your filters or search terms.</p>
          </div>
        `;
        return;
      }

      list.innerHTML = filtered.map(renderJob).join("");
    }

    function clearFilters() {
      Object.values(filters).forEach((element) => {
        if (element) element.selectedIndex = 0;
      });

      if (search) search.value = "";

      render();
    }

    Object.values(filters).forEach((element) => {
      if (element) element.addEventListener("change", render);
    });

    if (search) {
      search.addEventListener("input", render);
    }

    if (clearButton) {
      clearButton.addEventListener("click", clearFilters);
    }

    async function loadOpportunities() {
      list.innerHTML = "<p>Loading opportunities…</p>";

      try {
        const data = await fetchJSON(OPPORTUNITIES_URL);

        opportunities = getArray(data, "jobs").filter((job) =>
          job &&
          typeof job.title === "string" &&
          job.title.trim() &&
          typeof job.url === "string"
        );

        render();
      } catch (error) {
        console.error("Opportunities loading error:", error);

        list.innerHTML = `
          <div class="empty-state">
            <p>We could not load opportunities right now.</p>
            <p>Please try again later.</p>
          </div>
        `;

        if (count) count.textContent = "0";
      }
    }

    loadOpportunities();
  }

  // ==========================================
  // Somalia ReliefWeb Jobs
  // ==========================================

  function initializeSomaliaJobs() {
    const list = document.getElementById("somalia-jobs");
    const note = document.getElementById("somalia-jobs-note");

    // This section is optional and only runs when its HTML exists.
    if (!list || !note) return;

    function showFallback(message) {
      list.replaceChildren();
      note.textContent = message + " ";

      const link = document.createElement("a");
      link.href = RELIEFWEB_URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "See all Somalia jobs on ReliefWeb.";

      note.appendChild(link);
    }

    function renderSomaliaJob(job) {
      const card = document.createElement("article");
      card.className = "card job";

      const location = document.createElement("span");
      location.className = "tag";
      location.textContent = job.city || job.country || "Somalia";

      const heading = document.createElement("h3");
      heading.textContent = job.title;

      const meta = document.createElement("p");
      meta.style.cssText =
        "display:flex;flex-wrap:wrap;gap:.25rem 1.25rem;font-size:.9rem";

      [
        ["Organization", job.org],
        ["Posted", formatDate(job.posted)],
        ["Closing date", formatDate(job.closes)]
      ].forEach(([label, value]) => {
        if (!value) return;

        const item = document.createElement("span");
        const strong = document.createElement("strong");

        strong.textContent = label + ": ";
        item.appendChild(strong);
        item.appendChild(document.createTextNode(value));
        meta.appendChild(item);
      });

      const content = document.createElement("div");
      content.append(location, heading, meta);

      const link = document.createElement("a");
      link.className = "btn ghost";
      link.href = job.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "View on ReliefWeb";

      card.append(content, link);
      list.appendChild(card);
    }

    async function loadSomaliaJobs() {
      note.textContent = "Loading open roles…";

      try {
        const data = await fetchJSON(SOMALIA_JOBS_URL);

        if (!data || !Array.isArray(data.jobs)) {
          throw new Error("Expected a jobs array in somalia-jobs.json");
        }

        const seen = new Set();
        const now = Date.now();

        const jobs = data.jobs.filter((job) => {
          if (
            !job ||
            !job.id ||
            typeof job.title !== "string" ||
            !job.title.trim() ||
            !isReliefWebURL(job.url)
          ) {
            return false;
          }

          const id = String(job.id);

          if (seen.has(id)) return false;
          seen.add(id);

          if (!job.closes) return true;

          const closingTime = new Date(job.closes).getTime();

          // Exclude only listings with a confirmed past closing date.
          return !Number.isFinite(closingTime) || closingTime > now;
        });

        list.replaceChildren();

        if (!jobs.length) {
          showFallback("No open roles are listed right now.");
          return;
        }

        jobs.forEach(renderSomaliaJob);

        note.textContent =
          `Showing ${jobs.length} open ${jobs.length === 1 ? "role" : "roles"} from ReliefWeb` +
          (data.updated ? `, last refreshed on ${formatDate(data.updated)}` : "") +
          ". You apply on the employer’s page.";
      } catch (error) {
        console.error("Somalia jobs loading error:", error);
        showFallback("We could not load the Somalia job listings.");
      }
    }

    loadSomaliaJobs();
  }

  // ==========================================
  // Programmes
  // ==========================================

  function initializeProgrammes() {
    const list =
      document.getElementById("programme-list") ||
      document.getElementById("programmes-list");

    // Do not fetch programmes on pages without a programmes container.
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

        list.innerHTML = programmes.map((programme) => {
          const url = safeURL(programme.url);

          return `
            <article class="card">
              <h3>${escapeHTML(programme.title || "Programme")}</h3>
              ${programme.org ? `<p>${escapeHTML(programme.org)}</p>` : ""}
              ${programme.description
                ? `<p>${escapeHTML(programme.description)}</p>`
                : ""}
              ${programme.deadline
                ? `<p>Deadline: ${formatDate(programme.deadline)}</p>`
                : ""}
              ${url
                ? `<a class="btn ghost" href="${url}" target="_blank"
                     rel="noopener noreferrer">Learn more</a>`
                : ""}
            </article>
          `;
        }).join("");
      } catch (error) {
        console.error("Programmes loading error:", error);
        list.textContent = "Programmes could not be loaded.";
      }
    }

    loadProgrammes();
  }

  // ==========================================
  // Initialize Jobs Page
  // ==========================================

  function initializeJobsPage() {
    initializeOpportunitiesBoard();
    initializeSomaliaJobs();
    initializeProgrammes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeJobsPage, {
      once: true
    });
  } else {
    initializeJobsPage();
  }
})();
