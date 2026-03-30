/* ── Scroll fade-up animations ── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      fadeObserver.unobserve(el.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.fade-up').forEach((el, i) => {
  // stagger siblings
  const siblings = el.parentElement.querySelectorAll('.fade-up');
  const idx = Array.from(siblings).indexOf(el);
  el.style.transitionDelay = `${idx * 70}ms`;
  fadeObserver.observe(el);
});

/* ── Count-up numbers ── */
function countUp(el) {
  const target   = parseFloat(el.dataset.count);
  const suffix   = el.dataset.suffix || '';
  const prefix   = el.dataset.prefix || '';
  const isFloat  = String(target).includes('.');
  const duration = 1800;
  const start    = performance.now();

  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const v = 1 - Math.pow(1 - p, 3); // ease-out-cubic
    const n = v * target;
    el.textContent = prefix + (isFloat ? n.toFixed(1) : Math.floor(n)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { countUp(e.target); countObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

/* ── FAQ accordion (used on giving + about pages) ── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    item.closest('.faq-list').querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
