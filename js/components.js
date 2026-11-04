
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

   Jobs and opportunities are handled separately by Jobs.js.
   No jobs JSON fetching or opportunity rendering here.
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

  // Expose shared constants for other scripts, including Jobs.js.
  window.EASomalia = window.EASomalia || {};

  window.EASomalia.opportunityCategories = OPPORTUNITY_CATEGORIES;
  window.EASomalia.opportunityTypes = OPPORTUNITY_TYPES;

  // ========================================================
  // Fellowship Information
  // ========================================================

  const FELLOWS = [
    {
      title: "EA Fellowship",
      url: "/pages/ea-fellowship.html",
      status: "Open",
      active: true
    },
    {
      title: "Animal Welfare Fellowship",
      url: "/pages/animal-welfare-fellowship.html",
      status: "Coming soon",
      active: false
    },
    {
      title: "Global Health Fellowship",
      url: "/pages/global-health-fellowship.html",
      status: "Coming soon",
      active: false
    },
    {
      title: "AI Safety / Governance Fellowship",
      url: "/pages/ai-safety-governance-fellowship.html",
      status: "Coming soon",
      active: false
    }
  ];

  // ========================================================
  // Helpers
  // ========================================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);

  function getCurrentPath() {
    let path = window.location.pathname || "/";

    path = path.replace(/\/+/g, "/");

    if (path.endsWith("/index.html")) {
      path = path.slice(0, -"index.html".length);
    }

    if (path.endsWith(".html")) {
      path = path.slice(0, -5);
    }

    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return path;
  }

  function isCurrentPage(url) {
    const current = getCurrentPath();

    let target = url.replace(/\/+/g, "/");

    if (target.endsWith("/index.html")) {
      target = target.slice(0, -"index.html".length);
    }

    if (target.endsWith(".html")) {
      target = target.slice(0, -5);
    }

    if (target !== "/" && target.endsWith("/")) {
      target = target.slice(0, -1);
    }

    return current === target;
  }

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
    } catch (error) {
      // The website still works when local storage is unavailable.
    }
  }

  // ========================================================
  // Vercel Web Analytics
  // ========================================================

  function initializeAnalytics() {
    const scriptPath = "/_vercel/insights/script.js";

    if (document.querySelector(`script[src="${scriptPath}"]`)) {
      return;
    }

    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

    const script = document.createElement("script");

    script.defer = true;
    script.src = scriptPath;

    document.head.appendChild(script);
  }

  // ========================================================
  // Navigation
  // ========================================================

  function renderNavigation() {
    const container = $("#site-nav");

    if (!container) return;

    const navLinks = [
      {
        label: "Home",
        url: "/"
      },
      {
        label: "Effective Giving",
        url: "/pages/effective-giving.html"
      },
      {
        label: "Jobs",
        url: "/pages/jobs.html"
      },
      {
        label: "Incubation",
        url: "/pages/incubation.html"
      },
      {
        label: "Connect",
        url: "/pages/connect.html"
      }
    ];

    const fellowshipLinks = FELLOWS.map(fellow => `
      <a
        class="fellowship-dropdown-link ${fellow.active ? "active" : "coming-soon"}"
        href="${escapeHTML(fellow.url)}"
        ${fellow.active ? "" : 'aria-disabled="true"'}
      >
        <span>${escapeHTML(fellow.title)}</span>
        ${
          fellow.active
            ? '<span class="fellowship-status active">Explore</span>'
            : `<span class="fellowship-status">${escapeHTML(fellow.status)}</span>`
        }
      </a>
    `).join("");

    const regularLinks = navLinks.map(link => `
      <a
        href="${escapeHTML(link.url)}"
        class="nav-link ${isCurrentPage(link.url) ? "active" : ""}"
        ${isCurrentPage(link.url) ? 'aria-current="page"' : ""}
      >
        ${escapeHTML(link.label)}
      </a>
    `).join("");

    container.innerHTML = `
      <nav class="navbar" aria-label="Main navigation">
        <div class="nav-container">

          <a class="nav-brand" href="/" aria-label="EA Somalia home">
            <img
              src="/images/logo.png"
              alt="EA Somalia"
              class="nav-logo"
            >
            <span class="nav-brand-text">EA Somalia</span>
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

          <div class="menu" id="main-menu">

            ${regularLinks}

            <div class="nav-dropdown fellowship-dropdown">
              <button
                class="nav-link dropdown-toggle"
                type="button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                Learn
                <span class="dropdown-arrow" aria-hidden="true">⌄</span>
              </button>

              <div class="dropdown-menu fellowship-menu">
                ${fellowshipLinks}
              </div>
            </div>

            <a
              class="nav-cta"
              href="/pages/ea-fellowship.html"
            >
              Join the EA Fellowship
            </a>

            <button
              class="theme-toggle"
              type="button"
              aria-label="Toggle colour theme"
              title="Toggle colour theme"
            >
              <span class="theme-icon" aria-hidden="true">◐</span>
              <span class="theme-label">Dark mode</span>
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

  function renderFooter() {
    const container = $("#site-footer");

    if (!container) return;

    const currentYear = new Date().getFullYear();

    const fellowshipLinks = FELLOWS.map(fellow => `
      <li>
        <a href="${escapeHTML(fellow.url)}">
          ${escapeHTML(fellow.title)}
        </a>
      </li>
    `).join("");

    container.innerHTML = `
      <footer class="site-footer">
        <div class="footer-container">

          <div class="footer-brand">
            <a href="/" class="footer-logo">
              <img src="/images/logo.png" alt="EA Somalia">
              <span>EA Somalia</span>
            </a>

            <p>
              Somalis using evidence and reason to do the most good.
            </p>
          </div>

          <div class="footer-column">
            <h3>Learn</h3>
            <ul>
              ${fellowshipLinks}
            </ul>
          </div>

          <div class="footer-column">
            <h3>More</h3>
            <ul>
              <li><a href="/pages/effective-giving.html">Effective Giving</a></li>
              <li><a href="/pages/jobs.html">Opportunities</a></li>
              <li><a href="/pages/incubation.html">Incubation</a></li>
              <li><a href="/pages/connect.html">Connect</a></li>
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

    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", selectedTheme);

    document.documentElement.style.colorScheme = selectedTheme;

    const toggle = $(".theme-toggle");

    if (!toggle) return;

    const icon = $(".theme-icon", toggle);
    const label = $(".theme-label", toggle);

    if (icon) {
      icon.textContent = selectedTheme === "dark" ? "☀" : "◐";
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

    if (!toggle || toggle.dataset.initialized === "true") return;

    toggle.dataset.initialized = "true";

    applyTheme(getPreferredTheme());

    toggle.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") || "light";

      const next = current === "dark" ? "light" : "dark";

      safeStorageSet(THEME_KEY, next);
      applyTheme(next);
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
      toggle.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
      menu.classList.add("show");
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
    }

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.contains("show");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu after navigating.
    $$("a", menu).forEach(link => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    // Close menu with Escape.
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Close menu when clicking outside.
    document.addEventListener("click", event => {
      if (!parent.contains(event.target)) {
        closeMenu();
      }
    });

    // Close menu when returning to desktop layout.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
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
      if (window.innerWidth > 900) {
        openDropdown();
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (window.innerWidth > 900) {
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
    initializeAnalytics();
    renderNavigation();
    renderFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }

})();
