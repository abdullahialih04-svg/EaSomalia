(function(){
const FELLOWS=[['EA Fellowship', '/pages/ea-fellowship.html', false], ['Animal Welfare Fellowship', '/pages/animal-welfare-fellowship.html', true], ['Global Health Fellowship', '/pages/global-health-fellowship.html', true], ['AI Safety / Governance Fellowship', '/pages/ai-safety-governance-fellowship.html', true]];
const path=location.pathname.replace(/\/$/,'')||'/';
const cur=h=>(path===h||(h==='/'&&path==='/index.html'))?' aria-current="page"':'';
const drop=FELLOWS.map(f=>`<a href="${f[1]}"${cur(f[1])}>${f[0]}${f[2]?'<span class="tag">Coming soon</span>':''}</a>`).join('');
document.getElementById('site-nav').outerHTML=`<header class="nav"><div class="wrap">
<a class="logo" href="/" aria-label="EA Somalia home"><img src="/images/logo.png" alt="EA Somalia" width="26" height="40"></a>
<button class="burger" aria-label="Menu" aria-expanded="false">☰</button>
<ul class="menu">
<li><a href="/"${cur('/')}>Home</a></li>
<li class="has-drop"><button aria-haspopup="true" aria-expanded="false">Learn <span class="chev" aria-hidden="true">▾</span></button><div class="drop">${drop}</div></li>
<li><a href="/pages/effective-giving.html"${cur('/pages/effective-giving.html')}>Effective giving</a></li>
<li><a href="/pages/jobs.html"${cur('/pages/jobs.html')}>Jobs</a></li>
<li><a href="/pages/incubation.html"${cur('/pages/incubation.html')}>Incubation</a></li>
<li><a href="/pages/connect.html"${cur('/pages/connect.html')}>Connect</a></li>
<li><a class="btn sm" href="/pages/ea-fellowship.html" style="color:#fff">Join the EA Fellowship</a></li>
</ul></div></header>`;
document.getElementById('site-footer').outerHTML=`<footer><div class="wrap"><div class="cols">
<div><h3>EA Somalia</h3><p>Somalis using evidence and reason to do the most good.</p></div>
<div><h3>Learn</h3><ul>${FELLOWS.map(f=>`<li><a href="${f[1]}">${f[0]}</a></li>`).join('')}</ul></div>
<div><h3>More</h3><ul><li><a href="/pages/effective-giving.html">Effective giving</a></li><li><a href="/pages/jobs.html">Jobs</a></li><li><a href="/pages/incubation.html">Incubation</a></li><li><a href="/pages/connect.html">Connect</a></li></ul></div>
<div><h3>Contact</h3><ul><li><a href="mailto:info@easomalia.org">info@easomalia.org</a></li><li><a href="https://calendly.com/easomalia/30min">Book a 1:1</a></li></ul></div>
</div><p class="small">© 2026 Effective Altruism Somalia</p></div></footer>`;
const b=document.querySelector('.burger'),m=document.querySelector('.menu');
b.onclick=()=>{const o=m.classList.toggle('show');b.setAttribute('aria-expanded',o)};
const dd=document.querySelector('.has-drop'),btn=dd.querySelector('button');
const hov=matchMedia('(hover:hover) and (min-width:901px)');let t;
const open=()=>{clearTimeout(t);dd.classList.add('open');btn.setAttribute('aria-expanded','true')};
const close=()=>{dd.classList.remove('open');btn.setAttribute('aria-expanded','false')};
dd.addEventListener('mouseenter',()=>{if(hov.matches)open()});
dd.addEventListener('mouseleave',()=>{if(hov.matches){clearTimeout(t);t=setTimeout(close,200)}});
btn.addEventListener('click',()=>{hov.matches||!dd.classList.contains('open')?open():close()});
dd.addEventListener('focusout',e=>{if(!dd.contains(e.relatedTarget))close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();btn.blur()}});
document.addEventListener('click',e=>{if(!dd.contains(e.target))close()});
if(dd.querySelector('[aria-current]'))dd.classList.add('current');
})();
