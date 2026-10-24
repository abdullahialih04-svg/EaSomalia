
(function () {
  // ==========================================
  // Vercel Web Analytics
  // ==========================================
  // This website uses static HTML, not Next.js.
  // Enable Web Analytics in your Vercel project.
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
    [
      "EA Fellowship",
      "/pages/ea-fellowship.html",
      false
    ],
    [
      "Animal Welfare Fellowship",
      "/pages/animal-welfare-fellowship.html",
      true
    ],
    [
      "Global Health Fellowship",
      "/pages/global-health-fellowship.html",
      true
    ],
    [
      "AI Safety / Governance Fellowship",
      "/pages/ai-safety-governance-fellowship.html",
      true
    ]
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
    const name = fellowship[0];
    const href = fellowship[1];
    const comingSoon = fellowship[2];

    return `
      <a href="${href}"${cur(href)}>
        ${name}
        ${
          comingSoon
            ? '<span class="tag">Coming soon</span>'
            : ""
        }
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

          <a
            class="logo"
            href="/"
            aria-label="EA Somalia home"
          >
            <img
              src="/images/logo.png"
              alt="EA Somalia"
              width="26"
              height="40"
            >
          </a>

          <button
            class="burger"
            aria-label="Menu"
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
              <a
                href="/pages/effective-giving.html"${cur(
                  "/pages/effective-giving.html"
                )}
              >
                Effective giving
              </a>
            </li>

            <li>
              <a
                href="/pages/jobs.html"${cur("/pages/jobs.html")}
              >
                Jobs
              </a>
            </li>

            <li>
              <a
                href="/pages/incubation.html"${cur(
                  "/pages/incubation.html"
                )}
              >
                Incubation
              </a>
            </li>

            <li>
              <a
                href="/pages/connect.html"${cur("/pages/connect.html")}
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
                  <a href="/pages/jobs.html">
                    Jobs
                  </a>
                </li>
                <li>
                  <a href="/pages/incubation.html">
                    Incubation
                  </a>
                </li>
                <li>
                  <a href="/pages/connect.html">
                    Connect
                  </a>
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
  // Mobile Navigation Toggle
  // ==========================================

  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".menu");

  if (burger && menu) {
    burger.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("show");

      burger.setAttribute("aria-expanded", String(isOpen));
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

    // Open on hover for desktop users.
    dropdown.addEventListener("mouseenter", function () {
      if (hoverMode.matches) {
        openDropdown();
      }
    });

    // Close after a short delay when the pointer leaves.
    dropdown.addEventListener("mouseleave", function () {
      if (hoverMode.matches) {
        clearTimeout(closeTimer);

        closeTimer = setTimeout(function () {
          closeDropdown();
        }, 200);
      }
    });

    // Support click and touch interactions.
    dropdownButton.addEventListener("click", function () {
      if (!hoverMode.matches || !dropdown.classList.contains("open")) {
        openDropdown();
      } else {
        closeDropdown();
      }
    });

    // Close when keyboard focus leaves the dropdown.
    dropdown.addEventListener("focusout", function (event) {
      if (!dropdown.contains(event.relatedTarget)) {
        closeDropdown();
      }
    });

    // Close with Escape.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDropdown();
        dropdownButton.blur();
      }
    });

    // Close when clicking outside the dropdown.
    document.addEventListener("click", function (event) {
      if (!dropdown.contains(event.target)) {
        closeDropdown();
      }
    });

    // Highlight the dropdown if the current page is a fellowship.
    if (dropdown.querySelector('[aria-current="page"]')) {
      dropdown.classList.add("current");
    }
  }
})();
