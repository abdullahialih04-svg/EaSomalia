
(function () {
  // ==========================================
  // Vercel Web Analytics
  // ==========================================

  if (!document.querySelector('script[src="/_vercel/insights/script.js"]')) {
    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

    const analyticsScript = document.createElement("script");
    analyticsScript.defer = true;
    analyticsScript.src = "/_vercel/insights/script.js";

    document.head.appendChild(analyticsScript);
  }

  // ==========================================
  // Fellowship Navigation Data
  // ==========================================

  const FELLOWS = [
    ["EA Fellowship", "/pages/ea-fellowship.html", false],
    ["Animal Welfare Fellowship", "/pages/animal-welfare-fellowship.html", true],
    ["Global Health Fellowship", "/pages/global-health-fellowship.html", true],
    ["AI Safety / Governance Fellowship", "/pages/ai-safety-governance-fellowship.html", true]
  ];

  // ==========================================
  // Current Page Detection
  // ==========================================

  const path = location.pathname.replace(/\/$/, "") || "/";

  const cur = (href) =>
    path === href ||
    (href === "/" && (path === "/" || path === "/index.html"))
      ? ' aria-current="page"'
      : "";

  // ==========================================
  // Fellowship Dropdown Links
  // ==========================================

  const drop = FELLOWS.map((fellowship) => {
    const [name, href, comingSoon] = fellowship;

    return `
      <a href="${href}"${cur(href)}>
        ${name}
        ${comingSoon ? '<span class="tag">Coming soon</span>' : ""}
      </a>
    `;
  }).join("");

  // ==========================================
  // Main Navigation
  // ==========================================

  const siteNav = document.getElementById("site-nav");

  if (siteNav) {
    siteNav.outerHTML = `
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
            aria-label="Open navigation menu"
            aria-expanded="false"
            type="button"
          >
            ☰
          </button>

          <ul class="menu">
            <li>
              <a href="/"${cur("/")}>Home</a>
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
                ${drop}
              </div>
            </li>

            <li>
              <a href="/pages/effective-giving.html"${cur(
                "/pages/effective-giving.html"
              )}>
                Effective giving
              </a>
            </li>

            <li>
              <a href="/pages/jobs.html"${cur("/pages/jobs.html")}>
                Jobs
              </a>
            </li>

            <li>
              <a href="/pages/incubation.html"${cur(
                "/pages/incubation.html"
              )}>
                Incubation
              </a>
            </li>

            <li>
              <a href="/pages/connect.html"${cur("/pages/connect.html")}>
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
  }

  // ==========================================
  // Website Footer
  // ==========================================

  const siteFooter = document.getElementById("site-footer");

  if (siteFooter) {
    siteFooter.outerHTML = `
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
                ${FELLOWS.map(
                  (fellowship) => `
                    <li>
                      <a href="${fellowship[1]}">
                        ${fellowship[0]}
                      </a>
                    </li>
                  `
                ).join("")}
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
                  <a href="https://calendly.com/easomalia/30min">
                    Book a 1:1
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <p class="small">
            © 2026 Effective Altruism Somalia
          </p>
        </div>
      </footer>
    `;
  }

  // ==========================================
  // Dark Mode
  // ==========================================

  const THEME_KEY = "ea-somalia-theme";

  function getPreferredTheme() {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);

      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    } catch (error) {
      // Continue with system preference if storage is unavailable.
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const toggle = document.querySelector(".theme-toggle");

    if (toggle) {
      const isDark = theme === "dark";

      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
      toggle.setAttribute(
        "title",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );

      toggle.innerHTML = isDark
        ? '<span aria-hidden="true">☀</span><span class="theme-label">Light mode</span>'
        : '<span aria-hidden="true">☾</span><span class="theme-label">Dark mode</span>';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      // Theme still applies for the current page if storage is unavailable.
    }
  }

  // Apply the saved or preferred theme before creating the toggle.
  applyTheme(getPreferredTheme());

  function renderThemeToggle() {
    if (document.querySelector(".theme-toggle")) return;

    const toggle = document.createElement("button");

    toggle.className = "theme-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-pressed", "false");

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
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      cursor: pointer;
      font: inherit;
      font-size: 14px;
    `;

    toggle.addEventListener("click", function () {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";

      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);
      saveTheme(nextTheme);
    });

    document.body.appendChild(toggle);
    applyTheme(getPreferredTheme());
  }

  // ==========================================
  // Mobile Navigation Toggle
  // ==========================================

  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("show");

      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );

      burger.textContent = isOpen ? "✕" : "☰";
    });
  }

  // ==========================================
  // Fellowship Dropdown Behaviour
  // ==========================================

  const dropdown = document.querySelector(".has-drop");

  if (dropdown) {
    const dropdownButton = dropdown.querySelector("button");
    const hoverMode = window.matchMedia(
      "(hover: hover) and (min-width: 901px)"
    );

    let closeTimer;

    const openDropdown = function () {
      clearTimeout(closeTimer);
      dropdown.classList.add("open");
      dropdownButton.setAttribute("aria-expanded", "true");
    };

    const closeDropdown = function () {
      dropdown.classList.remove("open");
      dropdownButton.setAttribute("aria-expanded", "false");
    };

    dropdown.addEventListener("mouseenter", function () {
      if (hoverMode.matches) openDropdown();
    });

    dropdown.addEventListener("mouseleave", function () {
      if (hoverMode.matches) {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(closeDropdown, 200);
      }
    });

    dropdownButton.addEventListener("click", function () {
      if (!hoverMode.matches || !dropdown.classList.contains("open")) {
        openDropdown();
      } else {
        closeDropdown();
      }
    });

    dropdown.addEventListener("focusout", function (event) {
      if (!dropdown.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDropdown();
        dropdownButton.blur();
      }
    });

    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    if (dropdown.querySelector('[aria-current="page"]')) {
      dropdown.classList.add("current");
    }
  }

  // ==========================================
  // Initialize
  // ==========================================

  function initialize() {
    renderThemeToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
