// Shared nav HTML
const NAV_HTML = `
<nav>
  <div class="nav-inner">
    <a href="/index.html" class="nav-logo">
      <div class="logo-mark">EA</div>
      <div>
        <span class="logo-text">EA Somalia</span>
        <span class="logo-sub">Effective Altruism</span>
      </div>
    </a>
    <ul class="nav-links">
      <li><a href="/pages/career.html">Career Guide</a></li>
      <li><a href="/pages/giving.html">Giving</a></li>
      <li><a href="/pages/community.html">Community</a></li>
      <li><a href="/pages/jobs.html">Jobs</a></li>
      <li><a href="/pages/about.html">About</a></li>
      <li><a href="/pages/about.html#contact" class="btn nav-cta">Get Involved</a></li>
    </ul>
    <button class="hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-nav">
  <a href="/index.html">Home</a>
  <a href="/pages/career.html">Career Guide</a>
  <a href="/pages/giving.html">Giving Effectively</a>
  <a href="/pages/community.html">Community & Projects</a>
  <a href="/pages/jobs.html">Job Board</a>
  <a href="/pages/about.html">About Us</a>
  <a href="/pages/about.html#contact">Get Involved →</a>
</div>
`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="brand-name">EA Somalia</span>
        <p>A community of ~50 Somali professionals applying evidence and reason to do the most good. Launched February 2026.</p>
        <span class="footer-new-badge">
          <span class="dot" style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;animation:pulse 2s infinite;"></span>
          New · Est. Feb 2026
        </span>
      </div>
      <div class="footer-col">
        <h4>Resources</h4>
        <a href="/pages/career.html">Career Guide</a>
        <a href="/pages/giving.html">Giving Effectively</a>
        <a href="/pages/jobs.html">Job Board</a>
      </div>
      <div class="footer-col">
        <h4>Community</h4>
        <a href="/pages/community.html">Local Chapters</a>
        <a href="/pages/community.html#mentorship">Mentorship</a>
        <a href="/pages/about.html">About Us</a>
      </div>
      <div class="footer-col">
        <h4>Connect</h4>
        <a href="mailto:info@easomalia.org">info@easomalia.org</a>
        <a href="https://twitter.com/EASomalia" target="_blank">Twitter / X</a>
        <a href="https://linkedin.com/company/ea-somalia" target="_blank">LinkedIn</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Effective Altruism Somalia. All rights reserved.</span>
      <span>Part of the global <a href="https://effectivealtruism.org" target="_blank">EA movement</a></span>
    </div>
  </div>
</footer>
`;

// Inject into page
document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.getElementById('nav-container');
  const footerContainer = document.getElementById('footer-container');
  if (navContainer) navContainer.innerHTML = NAV_HTML;
  if (footerContainer) footerContainer.innerHTML = FOOTER_HTML;
});
