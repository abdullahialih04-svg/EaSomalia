/* ── Shared nav + footer injected into every page ── */

const NAV_HTML = `
<nav>
  <div class="nav-inner">
    <a href="/" class="nav-logo">
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
    <button class="hamburger" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-nav" id="mobile-nav">
  <a href="/">Home</a>
  <a href="/pages/career.html">Career Guide</a>
  <a href="/pages/giving.html">Giving Effectively</a>
  <a href="/pages/community.html">Community</a>
  <a href="/pages/jobs.html">Job Board</a>
  <a href="/pages/about.html">About Us</a>
  <a href="/pages/about.html#contact" style="color:var(--green-700);font-weight:700;margin-top:12px;">Get Involved →</a>
</div>
`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <span class="brand-name">EA Somalia</span>
        <p>A growing community of ~50 Somali professionals applying evidence and reason to do the most good. Launched February 2026.</p>
        <span class="footer-new-badge">
          <span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;animation:pulse-dot 2s infinite;"></span>
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
        <a href="https://twitter.com/EASomalia" target="_blank" rel="noopener">Twitter / X</a>
        <a href="https://linkedin.com/company/ea-somalia" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Effective Altruism Somalia. All rights reserved.</span>
      <span>Part of the global <a href="https://effectivealtruism.org" target="_blank" rel="noopener">EA movement</a></span>
    </div>
  </div>
</footer>
`;

document.addEventListener('DOMContentLoaded', () => {
  const navEl    = document.getElementById('nav-container');
  const footerEl = document.getElementById('footer-container');
  if (navEl)    navEl.innerHTML    = NAV_HTML;
  if (footerEl) footerEl.innerHTML = FOOTER_HTML;

  /* ── Hamburger toggle ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
      spans[1].style.opacity   = open ? '0' : '1';
      spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = ''; s.style.opacity = '';
        });
      });
    });
  }

  /* ── Active nav link ── */
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = new URL(a.href, location.origin).pathname;
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });
});
