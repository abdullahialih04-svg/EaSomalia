/* ==========================================================
   EA SOMALIA — SHARED WEBSITE COMPONENTS
   ========================================================== */

(() => {
  "use strict";

  if (window.__eaSomaliaComponentsInitialized) return;
  window.__eaSomaliaComponentsInitialized = true;

  // ========================================================
  // CONFIGURATION
  // ========================================================

  const THEME_KEY = "ea-somalia-theme";
  const MOBILE_QUERY = "(max-width: 900px)";
  const ANALYTICS_PATH = "/_vercel/insights/script.js";

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

  const NAV_LINKS = Object.freeze([
    { label: "Home", url: "/" },
    { label: "Effective Giving", url: "/effective-giving" },
    { label: "Jobs", url: "/jobs" },
    { label: "Incubation", url: "/incubation" },
    { label: "Connect", url: "/connect" }
  ]);

  window.EASomalia = window.EASomalia || {};

  Object.assign(window.EASomalia, {
    opportunityCategories: OPPORTUNITY_CATEGORIES,
    opportunityTypes: OPPORTUNITY_TYPES
  });

  // ========================================================
  // DOM HELPERS
  // ========================================================

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

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
  // SAFE LOCAL STORAGE
  // ========================================================

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ========================================================
  // URL AND PATH HELPERS
  // ========================================================

  function normalizePath(path = "/") {
    let normalized = String(path || "/").trim();

    try {
      if (/^[a-z][a-z\d+.-]*:\/\//i.test(normalized)) {
        normalized = new URL(normalized).pathname;
      }
    } catch (_) {
      return "/";
    }

    normalized = normalized
      .split(/[?#]/, 1)[0]
      .replace(/\\/g, "/")
      .replace(/\/{2,}/g, "/");

    normalized = normalized.replace(/\/index\.html$/i, "");
    normalized = normalized.replace(/\.html$/i, "");
    normalized = normalized.replace(/^\/pages(?=\/|$)/i, "");
    normalized = normalized.replace(/\/+$/, "");

    return normalized || "/";
  }

  function getCurrentPath() {
    return normalizePath(window.location.pathname);
  }

  function isCurrentPage(url) {
    try {
      const target = new URL(url, window.location.origin);

      if (target.origin !== window.location.origin) {
        return false;
      }

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
  // VERCEL ANALYTICS
  // ========================================================

  function initializeAnalytics() {
    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

    const alreadyLoaded = $$("script[src]").some(script => {
      try {
        return new URL(
          script.src,
          window.location.href
        ).pathname === ANALYTICS_PATH;
      } catch (_) {
        return false;
      }
    });

    if (alreadyLoaded) return;

    const script = document.createElement("script");

    script.defer = true;
    script.src = ANALYTICS_PATH;

    script.onerror = () => {
      console.warn(
        "EA Somalia: Vercel Analytics could not be loaded."
      );
    };

    document.head.appendChild(script);
  }

  // ========================================================
  // FELLOWSHIP NAVIGATION
  // ========================================================

  function renderFellowshipLinks() {
    return FELLOWSHIPS.map(fellow => {

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
  // REGULAR NAVIGATION LINKS
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

  // ========================================================
  // MAIN NAVIGATION
  // ========================================================

  function renderNavigation() {
    const container = $("#site-nav");

    if (!container) return;

    container.innerHTML = `
      <nav class="navbar" aria-label="Main navigation">

        <div class="nav-container">

          <a
            class="nav-brand"
            href="/"
            aria-label="EA Somalia home"
          >
            <img
              src="/images/logo.png"
              alt=""
              class="nav-logo"
              width="40"
              height="40"
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

          <div class="menu" id="main-menu">

            ${renderRegularNavigationLinks()}

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
                hidden
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
  // FOOTER
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

    container.innerHTML = `
      <footer class="site-footer">

        <div class="footer-container">

          <div class="footer-brand">

            <a
              href="/"
              class="footer-logo"
              aria-label="EA Somalia home"
            >
              <img
                src="/images/logo.png"
                alt=""
                width="40"
                height="40"
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
            &copy; ${currentYear} EA Somalia. All rights reserved.
          </p>

        </div>

      </footer>
    `;
  }

  // ========================================================
  // THEME MANAGEMENT
  // ========================================================

  function getPreferredTheme() {
    const savedTheme = safeStorageGet(THEME_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    const selectedTheme =
      theme === "dark" ? "dark" : "light";

    const root = document.documentElement;

    root.setAttribute("data-theme", selectedTheme);
    root.style.colorScheme = selectedTheme;

    const metaTheme = $('meta[name="theme-color"]');

    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        selectedTheme === "dark" ? "#111827" : "#ffffff"
      );
    }

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

    window.addEventListener("storage", event => {

      if (
        event.key === THEME_KEY &&
        (event.newValue === "dark" || event.newValue === "light")
      ) {
        applyTheme(event.newValue);
      }

    });
  }

  // ========================================================
  // MOBILE NAVIGATION
  // ========================================================

  function initializeMobileNavigation(parent = document) {
    const toggle = $(".nav-toggle", parent);
    const menu = $(".menu", parent);

    if (!toggle || !menu) return;

    if (toggle.dataset.initialized === "true") return;

    toggle.dataset.initialized = "true";

    const mediaQuery = window.matchMedia?.(MOBILE_QUERY);

    function setMenuOpen(open, returnFocus = false) {

      menu.classList.toggle("show", open);
      toggle.classList.toggle("active", open);

      toggle.setAttribute("aria-expanded", String(open));

      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );

      if (mediaQuery?.matches) {
        menu.hidden = !open;
        menu.inert = !open;
      } else {
        menu.hidden = false;
        menu.inert = false;
      }

      if (!open && returnFocus) {
        toggle.focus();
      }
    }

    setMenuOpen(false);

    toggle.addEventListener("click", () => {

      const isOpen =
        toggle.getAttribute("aria-expanded") === "true";

      setMenuOpen(!isOpen);

    });

    menu.addEventListener("click", event => {

      if (event.target.closest("a")) {
        setMenuOpen(false);
      }

    });

    document.addEventListener("keydown", event => {

      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        setMenuOpen(false, true);
      }

    });

    document.addEventListener("click", event => {

      if (!parent.contains(event.target)) {
        setMenuOpen(false);
      }

    });

    const handleBreakpointChange = () => {
      setMenuOpen(false);
    };

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", handleBreakpointChange);
    } else if (mediaQuery?.addListener) {
      mediaQuery.addListener(handleBreakpointChange);
    }
  }

  // ========================================================
  // FELLOWSHIP DROPDOWN
  // ========================================================

  function initializeFellowshipDropdown(parent = document) {

    const dropdown = $(".fellowship-dropdown", parent);

    if (!dropdown) return;

    const button = $(".dropdown-toggle", dropdown);
    const menu = $(".dropdown-menu", dropdown);

    if (!button || !menu) return;

    if (button.dataset.initialized === "true") return;

    button.dataset.initialized = "true";

    function setOpen(open, returnFocus = false) {

      dropdown.classList.toggle("open", open);

      button.setAttribute(
        "aria-expanded",
        String(open)
      );

      menu.hidden = !open;
      menu.inert = !open;

      if (!open && returnFocus) {
        button.focus();
      }
    }

    button.addEventListener("click", event => {

      event.stopPropagation();

      const isOpen =
        button.getAttribute("aria-expanded") === "true";

      setOpen(!isOpen);

    });

    dropdown.addEventListener("mouseenter", () => {

      if (
        window.matchMedia?.(
          "(hover: hover) and (pointer: fine)"
        ).matches
      ) {
        setOpen(true);
      }

    });

    dropdown.addEventListener("mouseleave", () => {

      if (
        window.matchMedia?.(
          "(hover: hover) and (pointer: fine)"
        ).matches
      ) {
        setOpen(false);
      }

    });

    dropdown.addEventListener("keydown", event => {

      const links = $$("a[href]", menu);

      const currentIndex =
        links.indexOf(document.activeElement);

      if (event.key === "Escape") {

        event.preventDefault();
        setOpen(false, true);

      } else if (event.key === "ArrowDown" && links.length) {

        event.preventDefault();
        setOpen(true);

        links[
          Math.min(currentIndex + 1, links.length - 1)
        ].focus();

      } else if (event.key === "ArrowUp" && links.length) {

        event.preventDefault();
        setOpen(true);

        links[
          currentIndex <= 0 ? 0 : currentIndex - 1
        ].focus();

      } else if (event.key === "Home" && links.length) {

        event.preventDefault();
        setOpen(true);
        links[0].focus();

      } else if (event.key === "End" && links.length) {

        event.preventDefault();
        setOpen(true);
        links[links.length - 1].focus();

      }

    });

    document.addEventListener("click", event => {

      if (!dropdown.contains(event.target)) {
        setOpen(false);
      }

    });

    dropdown.addEventListener("focusout", event => {

      if (!dropdown.contains(event.relatedTarget)) {
        setOpen(false);
      }

    });

    setOpen(false);
  }

  // ========================================================
  // INITIALIZE SHARED COMPONENTS
  // ========================================================

  function initialize() {

    runSafely("theme", () => {
      applyTheme(getPreferredTheme());
    });

    runSafely("analytics", initializeAnalytics);

    runSafely("navigation", renderNavigation);

    runSafely("footer", renderFooter);

    Object.assign(window.EASomalia, {
      getCurrentPath,
      isCurrentPage,
      normalizePath,
      initialized: true
    });

  }

  // ========================================================
  // DOM READY
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
