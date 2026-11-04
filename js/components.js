
/* ==========================================================
   EA SOMALIA — SHARED WEBSITE COMPONENTS
   ----------------------------------------------------------
   Responsibilities:
   - Vercel Web Analytics
   - Shared navigation
   - Fellowship dropdown
   - Shared footer
   - Dark / light theme
   - Mobile navigation
   - Shared opportunity categories and types

   IMPORTANT:
   Opportunity data, filtering, searching, sorting and
   opportunity rendering are handled separately by the
   opportunities page (pages/jobs.html).

   This file does not fetch jobs JSON or render job cards.
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

  const CONFIG = Object.freeze({
    themeStorageKey: "ea-somalia-theme",
    mobileBreakpoint: 900,
    analyticsScript: "/_vercel/insights/script.js",
    logo: "/images/logo.png",
    home: "/"
  });

  // ========================================================
  // Shared Opportunity Categories and Types
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

  // Expose shared configuration for other scripts.
  window.EASomalia = window.EASomalia || {};

  window.EASomalia.opportunityCategories =
    OPPORTUNITY_CATEGORIES;

  window.EASomalia.opportunityTypes =
    OPPORTUNITY_TYPES;

  // ========================================================
  // Fellowship Configuration
  // ========================================================

  const FELLOWSHIPS = Object.freeze([
    {
      title: "EA Fellowship",
      url: "/ea-fellowship",
      status: "Explore",
      active: true
    },
    {
      title: "Animal Welfare Fellowship",
      url: null,
      status: "Coming soon",
      active: false
    },
    {
      title: "Global Health Fellowship",
      url: null,
      status: "Coming soon",
      active: false
    },
    {
      title: "AI Safety / Governance Fellowship",
      url: null,
      status: "Coming soon",
      active: false
    }
  ]);

  // ========================================================
  // DOM Helpers
  // ========================================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  // ========================================================
  // URL and Route Helpers
  // ========================================================

  /**
   * Normalize URLs so these routes are treated equally:
   *
   * /jobs
   * /jobs/
   * /jobs.html
   * /pages/jobs.html
   *
   * This is useful when the website uses Vercel rewrites.
   */
  function normalizePath(path = "/") {
    let normalized = String(path)
      .split("?")[0]
      .split("#")[0]
      .replace(/\/+/g, "/");

    normalized = normalized.replace(
      /\/index\.html$/i,
      ""
    );

    normalized = normalized.replace(
      /\.html$/i,
      ""
    );

    normalized = normalized.replace(
      /^\/pages(?=\/)/i,
      ""
    );

    normalized = normalized.replace(
      /\/+$/,
      ""
    );

    return normalized || "/";
  }

  function getCurrentPath() {
    return normalizePath(window.location.pathname);
  }

  function isCurrentPage(url) {
    try {
      const target = new URL(
        url,
        window.location.origin
      );

      return (
        getCurrentPath() ===
        normalizePath(target.pathname)
      );
    } catch (error) {
      console.warn(
        "EA Somalia: Invalid navigation URL:",
        url
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
  // Vercel Web Analytics
  // ========================================================

  function initializeAnalytics() {
    const scriptPath = CONFIG.analyticsScript;

    const existingScript = $$("script").some(script => {
      try {
        return (
          new URL(script.src, window.location.origin).pathname ===
          scriptPath
        );
      } catch (error) {
        return false;
      }
    });

    if (existingScript) return;

    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

    const script = document.createElement("script");

    script.src = scriptPath;
    script.defer = true;

    script.onerror = () => {
      console.warn(
        "EA Somalia: Vercel Analytics could not be loaded."
      );
    };

    document.head.appendChild(script);
  }

  // ========================================================
  // Navigation Data
  // ========================================================

  const NAVIGATION_LINKS = Object.freeze([
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
  // Fellowship Navigation Rendering
  // ========================================================

  function renderFellowshipLinks() {
    return FELLOWSHIPS.map(fellowship => {
      const title = escapeHTML(fellowship.title);
      const status = escapeHTML(fellowship.status);

      // Coming-soon items are spans, not disabled links.
      if (!fellowship.active || !fellowship.url) {
        return `
          <span
            class="fellowship-dropdown-link coming-soon"
            aria-disabled="true"
          >
            <span>${title}</span>

            <span class="fellowship-status">
              ${status}
            </span>
          </span>
        `;
      }

      return `
        <a
          class="fellowship-dropdown-link active"
          href="${escapeHTML(fellowship.url)}"
        >
          <span>${title}</span>

          <span class="fellowship-status active">
            Explore
          </span>
        </a>
      `;
    }).join("");
  }

  // ========================================================
  // Regular Navigation Rendering
  // ========================================================

  function renderNavigationLinks() {
    return NAVIGATION_LINKS.map(link => {
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

  // ========================================================
  // Main Navigation
  // ========================================================

  function renderNavigation() {
    const container = $("#site-nav");

    if (!container) return;

    // Prevent accidental duplicate rendering.
    if (container.dataset.initialized === "true") {
      return;
    }

    container.dataset.initialized = "true";

    container.innerHTML = `
      <nav
        class="navbar"
        aria-label="Main navigation"
      >
        <div class="nav-container">

          <a
            class="nav-brand"
            href="${CONFIG.home}"
            aria-label="EA Somalia home"
          >
            <img
              src="${CONFIG.logo}"
              alt="EA Somalia"
              class="nav-logo"
            >

            <span class="nav-brand-text">
              EA Somalia
            </span>
          </a>

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

          <div
            class="menu"
            id="main-menu"
          >

            ${renderNavigationLinks()}

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
                ${renderFellowshipLinks()}
              </div>

            </div>

            <a
              class="nav-cta"
              href="/ea-fellowship"
            >
              Join the EA Fellowship
            </a>

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
    return FELLOWSHIPS.map(fellowship => {
      const title = escapeHTML(fellowship.title);

      if (!fellowship.active || !fellowship.url) {
        return `
          <li>
            <span
              class="footer-coming-soon"
              aria-disabled="true"
            >
              ${title}
              <small>Coming soon</small>
            </span>
          </li>
        `;
      }

      return `
        <li>
          <a href="${escapeHTML(fellowship.url)}">
            ${title}
          </a>
        </li>
      `;
    }).join("");
  }

  function renderFooter() {
    const container = $("#site-footer");

    if (!container) return;

    if (container.dataset.initialized === "true") {
      return;
    }

    container.dataset.initialized = "true";

    const currentYear = new Date().getFullYear();

    container.innerHTML = `
      <footer class="site-footer">

        <div class="footer-container">

          <div class="footer-brand">

            <a
              href="/"
              class="footer-logo"
            >
              <img
                src="${CONFIG.logo}"
                alt="EA Somalia"
              >

              <span>EA Somalia</span>
            </a>

            <p>
              Somalis using evidence and reason to do the most good.
            </p>

          </div>

          <div class="footer-column">

            <h3>Learn</h3>

            <ul>
              ${renderFooterFellowships()}
            </ul>

          </div>

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

        <div class="footer-bottom">

          <p>
            &copy; ${currentYear} EA Somalia.
            All rights reserved.
          </p>

        </div>

      </footer>
    `;
  }

  // ========================================================
  // Theme Management
  // ========================================================

  function getPreferredTheme() {
    const savedTheme = safeStorageGet(
      CONFIG.themeStorageKey
    );

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

    root.setAttribute(
      "data-theme",
      selectedTheme
    );

    root.style.colorScheme = selectedTheme;

    const toggle = $(".theme-toggle");

    if (!toggle) return;

    const icon = $(".theme-icon", toggle);
    const label = $(".theme-label", toggle);

    const darkMode = selectedTheme === "dark";

    if (icon) {
      icon.textContent = darkMode ? "☀" : "◐";
    }

    if (label) {
      label.textContent = darkMode
        ? "Light mode"
        : "Dark mode";
    }

    toggle.setAttribute(
      "aria-label",
      darkMode
        ? "Switch to light mode"
        : "Switch to dark mode"
    );

    toggle.setAttribute(
      "aria-pressed",
      String(darkMode)
    );
  }

  function initializeThemeToggle(parent = document) {
    const toggle = $(".theme-toggle", parent);

    if (!toggle) return;

    if (toggle.dataset.initialized === "true") {
      return;
    }

    toggle.dataset.initialized = "true";

    applyTheme(getPreferredTheme());

    toggle.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") ||
        "light";

      const nextTheme =
        currentTheme === "dark" ? "light" : "dark";

      safeStorageSet(
        CONFIG.themeStorageKey,
        nextTheme
      );

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

    if (toggle.dataset.initialized === "true") {
      return;
    }

    toggle.dataset.initialized = "true";

    function closeMenu() {
      menu.classList.remove("show");
      toggle.classList.remove("active");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

      toggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    }

    function openMenu() {
      menu.classList.add("show");
      toggle.classList.add("active");

      toggle.setAttribute(
        "aria-expanded",
        "true"
      );

      toggle.setAttribute(
        "aria-label",
        "Close navigation menu"
      );
    }

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

    // Close on Escape.
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

    // Close when switching to desktop layout.
    window.addEventListener("resize", () => {
      if (window.innerWidth > CONFIG.mobileBreakpoint) {
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

    if (button.dataset.initialized === "true") {
      return;
    }

    button.dataset.initialized = "true";

    function closeDropdown() {
      dropdown.classList.remove("open");

      button.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    function openDropdown() {
      dropdown.classList.add("open");

      button.setAttribute(
        "aria-expanded",
        "true"
      );
    }

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
      if (window.innerWidth > CONFIG.mobileBreakpoint) {
        openDropdown();
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (window.innerWidth > CONFIG.mobileBreakpoint) {
        closeDropdown();
      }
    });

    // Close when clicking elsewhere.
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

    // Close when focus moves outside the dropdown.
    dropdown.addEventListener("focusout", event => {
      if (!dropdown.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });
  }

  // ========================================================
  // Initialize Shared Website Components
  // ========================================================

  function initialize() {
    initializeAnalytics();

    renderNavigation();

    renderFooter();
  }

  // ========================================================
  // Document Ready
  // ========================================================

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }

})();
