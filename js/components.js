(function(){
const FELLOWS=[
 ['EA Fellowship','/pages/ea-fellowship.html',false],
 ['Animal Welfare Fellowship','/pages/animal-welfare-fellowship.html',true],
 ['Global Health Fellowship','/pages/global-health-fellowship.html',true],
 ['AI Safety / Governance Fellowship','/pages/ai-safety-governance-fellowship.html',true]];
const path=location.pathname.replace(/\/$/,'')||'/';
const cur=h=>(path===h||(h==='/'&&path==='/index.html'))?' aria-current="page"':'';
const drop=FELLOWS.map(f=>`<a href="${f[1]}"${cur(f[1])}>${f[0]}${f[2]?'<span class="tag">Coming soon</span>':''}</a>`).join('');
document.getElementById('site-nav').outerHTML=`<header class="nav"><div class="wrap">
<a class="logo" href="/">EA <b>Somalia</b></a>
<button class="burger" aria-label="Menu" aria-expanded="false">☰</button>
<ul class="menu">
<li><a href="/"${cur('/')}>Home</a></li>
<li class="has-drop"><button aria-haspopup="true">Learn ▾</button><div class="drop">${drop}</div></li>
<li><a href="/pages/incubation.html"${cur('/pages/incubation.html')}>Incubation</a></li>
<li><a href="/pages/connect.html"${cur('/pages/connect.html')}>Connect</a></li>
</ul></div></header>`;
document.getElementById('site-footer').outerHTML=`<footer><div class="wrap"><div class="cols">
<div><h3>EA Somalia</h3><p>Somali professionals using evidence and reason to do the most good.</p></div>
<div><h3>Learn</h3><ul>${FELLOWS.map(f=>`<li><a href="${f[1]}">${f[0]}</a></li>`).join('')}</ul></div>
<div><h3>More</h3><ul><li><a href="/pages/incubation.html">Incubation</a></li><li><a href="/pages/connect.html">Connect</a></li></ul></div>
<div><h3>Contact</h3><ul><li><a href="mailto:info@easomalia.org">info@easomalia.org</a></li></ul></div>
</div><p class="small">© 2026 Effective Altruism Somalia</p></div></footer>`;
const b=document.querySelector('.burger'),m=document.querySelector('.menu');
b.onclick=()=>{const o=m.classList.toggle('show');b.setAttribute('aria-expanded',o)};
document.querySelector('.has-drop>button').onclick=e=>e.currentTarget.parentNode.classList.toggle('open');
})();
