
(() => {
  "use strict";

  // ==========================================
  // Prevent Duplicate Initialization
  // ==========================================

  if (window.__eaSomaliaComponentsInitialized) return;

  window.__eaSomaliaComponentsInitialized = true;

  // ==========================================
  // Configuration
  // ==========================================

  const CONFIG = {
    themeKey: "ea-somalia-theme",
    mobileBreakpoint: 900,
    analyticsPath: "/_vercel/insights/script.js"
  };

  const FELLOWS = [
    [ "EA Fellowship", "/pages/ea-fellowship.html", false ],
    [ "Animal Welfare Fellowship", "/pages/animal-welfare-fellowship.html", true ],
    [ "Global Health Fellowship", "/pages/global-health-fellowship.html", true ],
    [ "AI Safety / Governance Fellowship", "/pages/ai-safety-governance-fellowship.html", true ]
  ];

  // ==========================================
  // Safe HTML Helpers
  // ==========================================

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  // ==========================================
  // Current Page Detection
  // ==========================================

  function getCurrentPath() {
    let path = window.location.pathname;

    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // Support clean URLs and .html URLs.
    if (path.endsWith(".html")) {
      path = path.slice(0, -5);
    }

    return path || "/";
  }

  const currentPath = getCurrentPath();

  function isCurrentPage(href) {
    let normalizedHref = href.replace(/\/$/, "");

    if (normalizedHref.endsWith(".html")) {
      normalizedHref = normalizedHref.slice(0, -5);
    }

    return currentPath === (normalizedHref || "/");
  }

  function currentAttribute(href) {
    return isCurrentPage(href) ? ' aria-current="page"' : "";
  }

  // ==========================================
  // Vercel Analytics
  // ==========================================

  function initializeAnalytics() {
    if (
      document.querySelector(
        `script[src="${CONFIG.analyticsPath}"]`
      )
    ) {
      return;
    }

    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

    const script = document.createElement("script");

    script.src = CONFIG.analyticsPath;
    script.defer = true;

    document.head.appendChild(script);
  }

  // ==========================================
  // Navigation Rendering
  // ==========================================

  function renderNavigation() {
    const placeholder = document.getElementById("site-nav");

    if (!placeholder) return;

    const fellowshipLinks = FELLOWS.map(
      ([name, href, comingSoon]) => `
        <a href="${href}"${currentAttribute(href)}>
          ${escapeHTML(name)}
          ${
            comingSoon
              ? '<span class="tag">Coming soon</span>'
              : ""
          }
        </a>
      `
    ).join("");

    placeholder.outerHTML = `
      <header class="nav">
        <div class="wrap">

          <a class="logo" href="/" aria-label="EA Somalia home">
            <img
              src="/images/logo.png"
              alt="EA Somalia"
              width="26"
              height="40"
            >
          </a>

          <button
            class="burger"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded="false"
            aria-controls="main-menu"
          >
            ☰
          </button>

          <ul class="menu" id="main-menu">

            <li>
              <a href="/"${currentAttribute("/")}>Home</a>
            </li>

            <li class="has-drop">

              <button
                type="button"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Learn
                <span class="chev" aria-hidden="true">▾</span>
              </button>

              <div class="drop">
                ${fellowshipLinks}
              </div>

            </li>

            <li>
              <a
                href="/pages/effective-giving.html"
                ${currentAttribute("/pages/effective-giving.html")}
              >
                Effective giving
              </a>
            </li>

            <li>
              <a
                href="/pages/jobs.html"
                ${currentAttribute("/pages/jobs.html")}
              >
                Jobs
              </a>
            </li>

            <li>
              <a
                href="/pages/incubation.html"
                ${currentAttribute("/pages/incubation.html")}
              >
                Incubation
              </a>
            </li>

            <li>
              <a
                href="/pages/connect.html"
                ${currentAttribute("/pages/connect.html")}
              >
                Connect
              </a>
            </li>

            <li>
              <a
                class="btn sm"
                href="/pages/ea-fellowship.html"
                style="color:#fff"
              >
                Join the EA Fellowship
              </a>
            </li>

          </ul>

        </div>
      </header>
    `;

    initializeMobileNavigation();
    initializeFellowshipDropdown();
  }

  // ==========================================
  // Footer Rendering
  // ==========================================

  function renderFooter() {
    const placeholder = document.getElementById("site-footer");

    if (!placeholder) return;

    const year = new Date().getFullYear();

    const fellowshipFooterLinks = FELLOWS.map(
      ([name, href]) => `
        <li>
          <a href="${href}">${escapeHTML(name)}</a>
        </li>
      `
    ).join("");

    placeholder.outerHTML = `
      <footer>
        <div class="wrap">

          <div class="cols">

            <div>
              <h3>EA Somalia</h3>
              <p>
                Somalis using evidence and reason to do the most good.
              </p>
            </div>

            <div>
              <h3>Learn</h3>
              <ul>
                ${fellowshipFooterLinks}
              </ul>
            </div>

            <div>
              <h3>More</h3>
              <ul>
                <li>
                  <a href="/pages/effective-giving.html">
                    Effective giving
                  </a>
                </li>
                <li>
                  <a href="/pages/jobs.html">Jobs</a>
                </li>
                <li>
                  <a href="/pages/incubation.html">Incubation</a>
                </li>
                <li>
                  <a href="/pages/connect.html">Connect</a>
                </li>
              </ul>
            </div>

            <div>
              <h3>Contact</h3>
              <ul>
                <li>
                  <a href="mailto:info@easomalia.org">
                    info@easomalia.org
                  </a>
                </li>
                <li>
                  <a
                    href="https://calendly.com/easomalia/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book a 1:1
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <p class="small">
            © ${year} Effective Altruism Somalia
          </p>

        </div>
      </footer>
    `;
  }

  // ==========================================
  // Theme Management
  // ==========================================

  function getPreferredTheme() {
    try {
      const saved = localStorage.getItem(CONFIG.themeKey);

      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch (error) {
      // Storage may be unavailable.
    }

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(CONFIG.themeKey, theme);
    } catch (error) {
      // Continue without persistence.
    }
  }

  function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute(
      "data-theme",
      selectedTheme
    );

    const toggle = document.querySelector(".theme-toggle");

    if (!toggle) return;

    const dark = selectedTheme === "dark";

    toggle.setAttribute("aria-pressed", String(dark));

    toggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );

    toggle.title = dark ? "Switch to light mode" : "Switch to dark mode";

    toggle.innerHTML = dark
      ? '<span aria-hidden="true">☀</span><span class="theme-label">Light mode</span>'
      : '<span aria-hidden="true">☾</span><span class="theme-label">Dark mode</span>';
  }

  function renderThemeToggle() {
    let toggle = document.querySelector(".theme-toggle");

    if (!toggle) {
      toggle = document.createElement("button");

      toggle.className = "theme-toggle";
      toggle.type = "button";

      toggle.style.cssText = `
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 999;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 15px;
        border: 1px solid var(--border, #d8e1eb);
        border-radius: 999px;
        background: var(--card, #ffffff);
        color: var(--text, #0f2440);
        box-shadow: 0 4px 16px rgba(0,0,0,.12);
        cursor: pointer;
        font: inherit;
        font-size: 14px;
      `;

      document.body.appendChild(toggle);
    }

    if (toggle.dataset.initialized !== "true") {
      toggle.addEventListener("click", () => {
        const current =
          document.documentElement.getAttribute("data-theme") || "light";

        const next = current === "dark" ? "light" : "dark";

        applyTheme(next);
        saveTheme(next);
      });

      toggle.dataset.initialized = "true";
    }

    applyTheme(getPreferredTheme());
  }

  // ==========================================
  // Mobile Navigation
  // ==========================================

  function initializeMobileNavigation() {
    const burger = document.querySelector(".burger");
    const menu = document.querySelector(".menu");

    if (!burger || !menu) return;

    function closeMenu() {
      menu.classList.remove("show");

      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open navigation menu");

      burger.textContent = "☰";
    }

    function toggleMenu() {
      const isOpen = menu.classList.toggle("show");

      burger.setAttribute("aria-expanded", String(isOpen));

      burger.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );

      burger.textContent = isOpen ? "✕" : "☰";
    }

    burger.addEventListener("click", toggleMenu);

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", event => {
      if (
        menu.classList.contains("show") &&
        !menu.contains(event.target) &&
        !burger.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // Fellowship Dropdown
  // ==========================================

  function initializeFellowshipDropdown() {
    const dropdown = document.querySelector(".has-drop");

    if (!dropdown) return;

    const button = dropdown.querySelector("button");

    if (!button) return;

    const hoverMode = window.matchMedia
      ? window.matchMedia("(hover: hover) and (min-width: 901px)")
      : { matches: false };

    let closeTimer;

    function openDropdown() {
      clearTimeout(closeTimer);

      dropdown.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
      clearTimeout(closeTimer);

      dropdown.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }

    dropdown.addEventListener("mouseenter", () => {
      if (hoverMode.matches) {
        openDropdown();
      }
    });

    dropdown.addEventListener("mouseleave", () => {
      if (hoverMode.matches) {
        closeTimer = setTimeout(closeDropdown, 200);
      }
    });

    button.addEventListener("click", () => {
      if (dropdown.classList.contains("open")) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    dropdown.addEventListener("focusout", event => {
      if (!dropdown.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeDropdown();
      }
    });

    document.addEventListener("click", event => {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    if (dropdown.querySelector('[aria-current="page"]')) {
      dropdown.classList.add("current");
    }
  }

  // ==========================================
  // Initialize Website Components
  // ==========================================

  function initialize() {
    initializeAnalytics();
    renderNavigation();
    renderFooter();
    renderThemeToggle();

    // Jobs.js independently handles the embedded jobs in jobs.html.
    // No JSON fetching and no ReliefWeb API integration here.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }

})();
