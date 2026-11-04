
/* ==========================================================
   EA SOMALIA — SHARED WEBSITE COMPONENTS
   ----------------------------------------------------------
   Handles:
   - Vercel Web Analytics
   - Shared navigation
   - Fellowship dropdown
   - Shared footer
   - Dark / light theme
   - Mobile navigation
   - Central opportunity categories and types

   IMPORTANT:
   Jobs and opportunities are handled separately by the
   opportunities page script in pages/jobs.html.

   This file does NOT:
   - Fetch jobs JSON
   - Read opportunity records
   - Filter opportunities
   - Render opportunity cards
   ========================================================== */

(() => {
  "use strict";

  // ========================================================
  // Prevent Duplicate Initialization
  // ========================================================

  if (window.__eaSomaliaComponentsInitialized) return;

  window.__eaSomaliaComponentsInitialized = true;

  // ========================================================
  // Configuration
  // ========================================================

  const THEME_KEY = "ea-somalia-theme";
  const MOBILE_BREAKPOINT = 900;

  // ========================================================
  // Shared Opportunity Categories
  // ========================================================

  const OPPORTUNITY_CATEGORIES = Object.freeze({
    "animal-welfare": "Animal Welfare",
    "global-health": "Global Health",
    "ai-safety": "AI Safety",
    biosecurity: "Biosecurity",
    "climate-change": "Climate Change",
    society: "Societal Improvements",
    funding: "Funding",
    other: "Other Cause Areas"
  });

  const OPPORTUNITY_TYPES = Object.freeze({
    job: "Job",
    internship: "Internship",
    fellowship: "Fellowship",
    programme: "Programme",
    course: "Course",
    funding: "Funding"
  });

  // Expose shared constants to other scripts.
  // The opportunities page can use these without duplicating them.

  window.EASomalia = window.EASomalia || {};

  window.EASomalia.opportunityCategories = OPPORTUNITY_CATEGORIES;
  window.EASomalia.opportunityTypes = OPPORTUNITY_TYPES;

  // ========================================================
  // Fellowship Information
  // ========================================================

  const FELLOWSHIPS = Object.freeze([
    {
      title: "EA Fellowship",
      url: "/ea-fellowship",
      status: "Open",
      active: true
    },
    {
      title: "Animal Welfare Fellowship",
      url: "/animal-welfare-fellowship",
      status: "Coming soon",
      active: false
    },
    {
      title: "Global Health Fellowship",
      url: "/global-health-fellowship",
      status: "Coming soon",
      active: false
    },
    {
      title: "AI Safety / Governance Fellowship",
      url: "/ai-safety-governance-fellowship",
      status: "Coming soon",
      active: false
    }
  ]);

  // ========================================================
  // Navigation Configuration
  // ========================================================

  const NAV_LINKS = Object.freeze([
    {
      label: "Home",
      url: "/"
    },
    {
      label: "Effective Giving",
      url: "/effective-giving"
    },
    {
      label: "Jobs",
      url: "/jobs"
    },
    {
      label: "Incubation",
      url: "/incubation"
    },
    {
      label: "Connect",
      url: "/connect"
    }
  ]);

  // ========================================================
  // DOM Helpers
  // ========================================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  // ========================================================
  // HTML Escaping
  // ========================================================

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // ========================================================
  // URL and Path Helpers
  // ========================================================

  /**
   * Converts different URL formats into a common path.
   *
   * Examples:
   * /jobs                 -> /jobs
   * /jobs/                -> /jobs
   * /pages/jobs.html      -> /jobs
   * /pages/jobs           -> /jobs
   * /index.html           -> /
   */

  function normalizePath(path = "/") {
    let normalized = String(path || "/")
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+/g, "/");

    // Normalize homepage.
    normalized = normalized.replace(/\/index\.html$/i, "");

    // Remove .html extensions.
    normalized = normalized.replace(/\.html$/i, "");

    // Treat /pages/example as /example.
    normalized = normalized.replace(/^\/pages(?=\/)/i, "");

    // Remove trailing slash, except for homepage.
    normalized = normalized.replace(/\/+$/, "");

    return normalized || "/";
  }

  function getCurrentPath() {
    return normalizePath(window.location.pathname);
  }

  function isCurrentPage(url) {
    try {
      const target = new URL(url, window.location.origin);

      return getCurrentPath() === normalizePath(target.pathname);
    } catch (error) {
      console.warn(
        "EA Somalia: Could not compare navigation URL:",
        url,
        error
      );

      return false;
    }
  }

  // ========================================================
  // Safe Local Storage
  // ========================================================

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  // ========================================================
  // Safe Component Initialization
  // ========================================================

  function runSafely(name, callback) {
    try {
      callback();
    } catch (error) {
      console.error(
        `EA Somalia: Failed to initialize ${name}:`,
        error
      );
    }
  }

  // ========================================================
  // Vercel Web Analytics
  // ========================================================

  function initializeAnalytics() {
    const scriptPath = "/_vercel/insights/script.js";

    // Do not insert the analytics script more than once.
    const existingScript = $(
      'script[src="/_vercel/insights/script.js"]'
    );

    if (existingScript) return;

    // Initialize the Vercel analytics queue.
    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

    const script = document.createElement("script");

    script.defer = true;
    script.src = scriptPath;

    script.onerror = () => {
      console.warn(
        "EA Somalia: Vercel Analytics could not be loaded."
      );
    };

    document.head.appendChild(script);
  }

  // ========================================================
  // Fellowship Navigation Markup
  // ========================================================

  function renderFellowshipLinks() {
    return FELLOWSHIPS.map(fellow => {
      // Coming-soon items are not links.
      if (!fellow.active) {
        return `
          <span
            class="fellowship-dropdown-link coming-soon"
            aria-disabled="true"
          >
            <span>${escapeHTML(fellow.title)}</span>

            <span class="fellowship-status">
              ${escapeHTML(fellow.status)}
            </span>
          </span>
        `;
      }

      return `
        <a
          class="fellowship-dropdown-link active"
          href="${escapeHTML(fellow.url)}"
        >
          <span>${escapeHTML(fellow.title)}</span>

          <span class="fellowship-status active">
            Explore
          </span>
        </a>
      `;
    }).join("");
  }

  // ========================================================
  // Main Navigation Markup
  // ========================================================

  function renderRegularNavigationLinks() {
    return NAV_LINKS.map(link => {
      const active = isCurrentPage(link.url);

      return `
        <a
          href="${escapeHTML(link.url)}"
          class="nav-link${active ? " active" : ""}"
          ${active ? 'aria-current="page"' : ""}
        >
          ${escapeHTML(link.label)}
        </a>
      `;
    }).join("");
  }

  function renderNavigation() {
    const container = $("#site-nav");

    if (!container) return;

    const regularLinks = renderRegularNavigationLinks();
    const fellowshipLinks = renderFellowshipLinks();

    container.innerHTML = `
      <nav class="navbar" aria-label="Main navigation">

        <div class="nav-container">

          <!-- Brand -->

          <a
            class="nav-brand"
            href="/"
            aria-label="EA Somalia home"
          >
            <img
              src="/images/logo.png"
              alt=""
              class="nav-logo"
            >

            <span class="nav-brand-text">
              EA Somalia
            </span>
          </a>

          <!-- Mobile Navigation Toggle -->

          <button
            class="nav-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="main-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <!-- Navigation Menu -->

          <div class="menu" id="main-menu">

            ${regularLinks}

            <!-- Fellowship Dropdown -->

            <div class="nav-dropdown fellowship-dropdown">

              <button
                class="nav-link dropdown-toggle"
                type="button"
                aria-expanded="false"
                aria-haspopup="true"
                aria-controls="fellowship-menu"
              >
                Learn

                <span
                  class="dropdown-arrow"
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </button>

              <div
                class="dropdown-menu fellowship-menu"
                id="fellowship-menu"
              >
                ${fellowshipLinks}
              </div>

            </div>

            <!-- Fellowship Call to Action -->

            <a
              class="nav-cta"
              href="/ea-fellowship"
            >
              Join the EA Fellowship
            </a>

            <!-- Theme Toggle -->

            <button
              class="theme-toggle"
              type="button"
              aria-label="Switch to dark mode"
              aria-pressed="false"
              title="Toggle colour theme"
            >
              <span
                class="theme-icon"
                aria-hidden="true"
              >
                ◐
              </span>

              <span class="theme-label">
                Dark mode
              </span>
            </button>

          </div>

        </div>

      </nav>
    `;

    initializeMobileNavigation(container);
    initializeFellowshipDropdown(container);
    initializeThemeToggle(container);
  }

  // ========================================================
  // Footer
  // ========================================================

  function renderFooterFellowships() {
    return FELLOWSHIPS.map(fellow => {
      if (!fellow.active) {
        return `
          <li>
            <span
              class="footer-coming-soon"
              aria-disabled="true"
            >
              ${escapeHTML(fellow.title)}
              <small>(${escapeHTML(fellow.status)})</small>
            </span>
          </li>
        `;
      }

      return `
        <li>
          <a href="${escapeHTML(fellow.url)}">
            ${escapeHTML(fellow.title)}
          </a>
        </li>
      `;
    }).join("");
  }

  function renderFooter() {
    const container = $("#site-footer");

    if (!container) return;

    const currentYear = new Date().getFullYear();
    const fellowshipLinks = renderFooterFellowships();

    container.innerHTML = `
      <footer class="site-footer">

        <div class="footer-container">

          <!-- Footer Brand -->

          <div class="footer-brand">

            <a
              href="/"
              class="footer-logo"
              aria-label="EA Somalia home"
            >
              <img
                src="/images/logo.png"
                alt=""
              >

              <span>EA Somalia</span>
            </a>

            <p>
              Somalis using evidence and reason to do the most good.
            </p>

          </div>

          <!-- Learn -->

          <div class="footer-column">

            <h3>Learn</h3>

            <ul>
              ${fellowshipLinks}
            </ul>

          </div>

          <!-- More -->

          <div class="footer-column">

            <h3>More</h3>

            <ul>
              <li>
                <a href="/effective-giving">
                  Effective Giving
                </a>
              </li>

              <li>
                <a href="/jobs">
                  Opportunities
                </a>
              </li>

              <li>
                <a href="/incubation">
                  Incubation
                </a>
              </li>

              <li>
                <a href="/connect">
                  Connect
                </a>
              </li>
            </ul>

          </div>

          <!-- Contact -->

          <div class="footer-column">

            <h3>Contact</h3>

            <ul>
              <li>
                <a href="mailto:info@easomalia.org">
                  info@easomalia.org
                </a>
              </li>

              <li>
                <a
                  href="https://calendly.com/easomalia"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a 1:1
                </a>
              </li>
            </ul>

          </div>

        </div>

        <!-- Copyright -->

        <div class="footer-bottom">

          <p>
            &copy; ${currentYear} EA Somalia. All rights reserved.
          </p>

        </div>

      </footer>
    `;
  }

  // ========================================================
  // Theme Management
  // ========================================================

  function getPreferredTheme() {
    const savedTheme = safeStorageGet(THEME_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  }

  function applyTheme(theme) {
    const selectedTheme =
      theme === "dark" ? "dark" : "light";

    const root = document.documentElement;

    root.setAttribute("data-theme", selectedTheme);
    root.style.colorScheme = selectedTheme;

    const toggle = $(".theme-toggle");

    if (!toggle) return;

    const icon = $(".theme-icon", toggle);
    const label = $(".theme-label", toggle);

    if (icon) {
      icon.textContent =
        selectedTheme === "dark" ? "☀" : "◐";
    }

    if (label) {
      label.textContent =
        selectedTheme === "dark" ? "Light mode" : "Dark mode";
    }

    toggle.setAttribute(
      "aria-label",
      selectedTheme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
    );

    toggle.setAttribute(
      "aria-pressed",
      String(selectedTheme === "dark")
    );
  }

  function initializeThemeToggle(parent = document) {
    const toggle = $(".theme-toggle", parent);

    if (!toggle || toggle.dataset.initialized === "true") {
      return;
    }

    toggle.dataset.initialized = "true";

    // Apply the current theme to the newly rendered toggle.
    applyTheme(
      document.documentElement.getAttribute("data-theme") ||
      getPreferredTheme()
    );

    toggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") ||
        "light";

      const nextTheme =
        currentTheme === "dark" ? "light" : "dark";

      safeStorageSet(THEME_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  }

  // ========================================================
  // Mobile Navigation
  // ========================================================

  function initializeMobileNavigation(parent = document) {
    const toggle = $(".nav-toggle", parent);
    const menu = $(".menu", parent);

    if (!toggle || !menu) return;

    if (toggle.dataset.initialized === "true") return;

    toggle.dataset.initialized = "true";

    function closeMenu() {
      menu.classList.remove("show");
      toggle.classList.remove("active");

      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    }

    function openMenu() {
      menu.classList.add("show");
      toggle.classList.add("active");

      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute(
        "aria-label",
        "Close navigation menu"
      );
    }

    // Toggle the mobile menu.
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.contains("show");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close after selecting a navigation link.
    $$("a", menu).forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    // Close with Escape.
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Close when clicking outside the navigation.
    document.addEventListener("click", event => {
      if (!parent.contains(event.target)) {
        closeMenu();
      }
    });

    // Close when switching back to desktop layout.
    window.addEventListener("resize", () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        closeMenu();
      }
    });
  }

  // ========================================================
  // Fellowship Dropdown
  // ========================================================

  function initializeFellowshipDropdown(parent = document) {
    const dropdown = $(".fellowship-dropdown", parent);

    if (!dropdown) return;

    const button = $(".dropdown-toggle", dropdown);
    const menu = $(".dropdown-menu", dropdown);

    if (!button || !menu) return;

    if (button.dataset.initialized === "true") return;

    button.dataset.initialized = "true";

    function closeDropdown() {
      dropdown.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }

    function openDropdown() {
      dropdown.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }

    // Click to open or close.
    button.addEventListener("click", event => {
      event.stopPropagation();

      const isOpen = dropdown.classList.contains("open");

      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Desktop hover support.
    dropdown.addEventListener("mouseenter", () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        openDropdown();
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        closeDropdown();
      }
    });

    // Close when clicking outside.
    document.addEventListener("click", event => {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    // Keyboard support.
    dropdown.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeDropdown();
        button.focus();
      }
    });

    // Close when focus leaves the dropdown.
    dropdown.addEventListener("focusout", event => {
      if (!dropdown.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });
  }

  // ========================================================
  // Initialize Shared Components
  // ========================================================

  function initialize() {
    // Apply the preferred theme before rendering navigation.
    runSafely("theme", () => {
      applyTheme(getPreferredTheme());
    });

    runSafely("analytics", initializeAnalytics);
    runSafely("navigation", renderNavigation);
    runSafely("footer", renderFooter);

    // Public API for other website scripts.
    window.EASomalia = window.EASomalia || {};

    window.EASomalia.getCurrentPath = getCurrentPath;
    window.EASomalia.isCurrentPage = isCurrentPage;
    window.EASomalia.normalizePath = normalizePath;

    window.EASomalia.initialized = true;
  }

  // ========================================================
  // DOM Ready
  // ========================================================

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }

})();
