// ── Loading screen ─────────────────────────────────────────────────────────
;(function() {
  if (location.pathname.indexOf('/dashboard') !== -1) return;
  var root = (function(){
    var s = document.currentScript; if (!s) return '';
    return s.src.replace(/assets\/partials\.js.*/, '');
  })();
  var logoSrc = root + 'uploads/Plan%20de%20travail%205logotomussprod.svg';

  var style = document.createElement('style');
  style.textContent = [
    '#site-loader{position:fixed;inset:0;z-index:99999;background:#0F0F0F;display:flex;align-items:center;justify-content:center;transition:opacity .6s cubic-bezier(.22,1,.36,1);}',
    '#site-loader::before{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.72\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E");opacity:.04;pointer-events:none;}',
    '.sl-logo-wrap{position:relative;width:clamp(140px,22vw,260px);height:auto;}',
    '.sl-logo-base{display:block;width:100%;filter:brightness(0) invert(1);opacity:.18;}',
    '.sl-logo-fill{position:absolute;inset:0;overflow:hidden;clip-path:inset(100% 0 0 0);transition:clip-path 1s cubic-bezier(.22,1,.36,1);}',
    '.sl-logo-fill img{display:block;width:100%;filter:brightness(0) saturate(100%) invert(55%) sepia(90%) saturate(600%) hue-rotate(185deg) brightness(110%);}',
  ].join('');
  document.head.appendChild(style);

  var l = document.createElement('div');
  l.id = 'site-loader';
  l.innerHTML = '<div class="sl-logo-wrap">'
    + '<img class="sl-logo-base" src="' + logoSrc + '" alt="">'
    + '<div class="sl-logo-fill"><img src="' + logoSrc + '" alt=""></div>'
    + '</div>';
  document.documentElement.appendChild(l);
  document.documentElement.style.overflow = 'hidden';

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      var fill = l.querySelector('.sl-logo-fill');
      if (fill) fill.style.clipPath = 'inset(0% 0 0 0)';
    });
  });

  function hide() {
    document.documentElement.style.overflow = '';
    l.style.opacity = '0';
    setTimeout(function(){ if(l.parentNode) l.parentNode.removeChild(l); style.parentNode && style.parentNode.removeChild(style); }, 620);
  }
  if (document.readyState === 'complete') { setTimeout(hide, 400); }
  else { window.addEventListener('load', function(){ setTimeout(hide, 220); }); }
})();

// Reusable nav + footer injection
window.renderNav = function(active) {
  const items = [
    { key: 'home',     label: 'Showreel',    href: '/' },
    { key: 'projects', label: 'Projets',     href: 'projets.html' },
    { key: 'shop',     label: 'Shop',        href: 'shop.html' },
    { key: 'about',    label: 'Studio',      href: 'about.html' },
    { key: 'actus',    label: 'Actus',       href: 'actu.html' },
  ];
  return `
    <nav class="nav">
      <a class="logo" href="/">
        <img src="uploads/Plan de travail 5logotomussprod.svg" alt="Tomuss Production" class="logo-img" />
      </a>
      <ul class="nav-links">
        ${items.map(i => `<li><a href="${i.href}" class="${i.key===active?'active':''}">${i.label}</a></li>`).join('')}
      </ul>
      <div class="nav-end">
        <a class="nav-cta" href="offres.html">Contact ↗</a>
        <button class="nav-toggle" aria-label="Ouvrir le menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </nav>
    <div class="nav-drawer" aria-hidden="true">
      <ul>
        ${items.map(i => `<li><a href="${i.href}" class="${i.key===active?'active':''}">${i.label}</a></li>`).join('')}
      </ul>
      <a class="nav-drawer-cta" href="offres.html">Contact ↗</a>
    </div>
    <div class="nav-overlay"></div>
  `;
};

window.renderFooter = function() {
  return `
    <footer class="footer">
      <div>
        <h4>Disponible dès maintenant</h4>
        <p class="big">Faisons<br/>quelque<br/>chose.</p>
      </div>
      <div>
        <h4>Navigation</h4>
        <ul>
          <li><a href="/">SHOWREEL</a></li>
          <li><a href="projets.html">PROJETS</a></li>
          <li><a href="about.html">STUDIO</a></li>
          <li><a href="actu.html">ACTUS</a></li>
          <li><a href="shop.html">SHOP</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:tomussproduction@gmail.com" target="_blank">tomussproduction@gmail.com</a></li>
          <li><a href="https://www.google.com/maps/place/Le+Mans" target="_blank">Le Mans, France</a></li>
        </ul>
      </div>
      <div>
        <h4>Réseaux</h4>
        <ul>
          <li><a href="https://www.instagram.com/tomussprod/?hl=fr" target="_blank">Instagram ↗</a></li>
          <li><a href="https://www.youtube.com/@t0muss" target="_blank">YouTube ↗</a></li>
          <li><a href="https://www.tiktok.com/@2tomuss" target="_blank">TikTok ↗</a></li>
          <li><a href="https://www.twitch.tv/tomussprod" target="_blank">Twitch ↗</a></li>
        </ul>
      </div>
      <div class="footer-bar">
        <span></span>
        <span>© 2026 — Tomuss Production</span>
        <span></span>
      </div>
    </footer>
  `;
};

const _SB_URL = 'https://kmsimclzeitnnbbemeij.supabase.co';
const _SB_KEY = 'sb_publishable_paPXvSuTkEudJ9kjL39C4w_F3Jnt75G';

async function injectBanner() {
  try {
    const res  = await fetch(`${_SB_URL}/rest/v1/site_settings?key=eq.announcement_banner&select=value&limit=1`, {
      headers: { apikey: _SB_KEY, Authorization: `Bearer ${_SB_KEY}` }
    });
    const rows = await res.json();
    if (!rows.length) return;
    const cfg = rows[0].value;
    if (!cfg || !cfg.text || !cfg.active) return;
    if (sessionStorage.getItem('banner_dismissed') === cfg.text) return;

    const el = document.createElement('div');
    el.id = 'site-banner';
    const bg = cfg.bg || '#1fa5ff';
    // Auto-pick dark/light text for WCAG AA — overrides any configured color that fails contrast
    const lum = s => { const h = s.replace('#',''); const r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255; const c=x=>x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4); return .2126*c(r)+.7152*c(g)+.0722*c(b); };
    const contrast = (c1,c2) => { const l1=lum(c1),l2=lum(c2); return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); };
    const fg = contrast(bg,'#0F0F0F') >= 4.5 ? '#0F0F0F' : '#F4EFE6';
    el.style.cssText = `background:${bg};color:${fg};text-align:center;padding:10px 48px;font-size:13px;font-family:'JetBrains Mono',monospace;letter-spacing:.04em;position:relative;z-index:150;`;
    el.innerHTML = `<span>${cfg.text}</span><button onclick="this.closest('#site-banner').remove();document.querySelector('.nav')&&(document.querySelector('.nav').style.top='0');sessionStorage.setItem('banner_dismissed','${cfg.text.replace(/'/g,"\\'")}');" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;color:inherit;opacity:.7;line-height:1;">✕</button>`;
    // Insérer avant le nav-mount, pas avant body entier
    const navMount = document.getElementById('nav-mount');
    if (navMount) navMount.parentNode.insertBefore(el, navMount);
    else document.body.insertBefore(el, document.body.firstChild);
    // Décaler la nav fixe vers le bas — ResizeObserver garantit la bonne hauteur même après chargement des fonts
    function syncNavTop() {
      const nav = document.querySelector('.nav');
      if (nav) nav.style.top = el.offsetHeight + 'px';
    }
    syncNavTop();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(syncNavTop);
      ro.observe(el);
    }
  } catch(_) {}
}

window.injectChrome = function(active) {
  const navMount    = document.getElementById('nav-mount');
  const footerMount = document.getElementById('footer-mount');
  if (navMount)    navMount.outerHTML    = window.renderNav(active);
  if (footerMount) footerMount.outerHTML = window.renderFooter();
  injectBanner();

  // ── Bouton retour en haut ─────────────────────────────────────────────────
  const btt = document.createElement('button');
  btt.id = 'back-to-top';
  btt.innerHTML = '↑';
  btt.setAttribute('aria-label', 'Retour en haut');
  btt.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:200;width:44px;height:44px;border-radius:50%;border:1px solid rgba(244,239,230,.22);background:rgba(15,15,15,.85);color:#F4EFE6;font-size:18px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .25s;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);';
  document.body.appendChild(btt);
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 300;
    btt.style.opacity = show ? '1' : '0';
    btt.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── Mobile nav toggle ──────────────────────────────────────────────────────
  const toggle  = document.querySelector('.nav-toggle');
  const drawer  = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');
  if (!toggle || !drawer || !overlay) return;

  function openMenu() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }
  function closeMenu() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }

  toggle.addEventListener('click', () =>
    toggle.classList.contains('open') ? closeMenu() : openMenu()
  );
  overlay.addEventListener('click', closeMenu);

  // Ferme le menu si on clique un lien du drawer
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Ferme sur Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeMenu();
  });
};
