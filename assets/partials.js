// Reusable nav + footer injection
window.renderNav = function(active) {
  const items = [
    { key: 'home',     label: 'Showreel',    href: 'index.html' },
    { key: 'projects', label: 'Projets',     href: 'projets.html' },
    { key: 'about',    label: 'Studio',      href: 'about.html' },
    { key: 'offers',   label: 'Prestations', href: 'offres.html' },
  ];
  return `
    <nav class="nav">
      <a class="logo" href="index.html">
        <img src="uploads/Plan de travail 5logotomussprod.svg" alt="Tomuss Production" class="logo-img" />
      </a>
      <ul class="nav-links">
        ${items.map(i => `<li><a href="${i.href}" class="${i.key===active?'active':''}">${i.label}</a></li>`).join('')}
      </ul>
      <div class="nav-end">
        <a class="nav-cta" href="offres.html#contact">Contact ↗</a>
        <button class="nav-toggle" aria-label="Ouvrir le menu" aria-expanded="false">
          <span></span><span></span>
        </button>
      </div>
    </nav>
    <div class="nav-drawer" aria-hidden="true">
      <ul>
        ${items.map(i => `<li><a href="${i.href}" class="${i.key===active?'active':''}">${i.label}</a></li>`).join('')}
      </ul>
      <a class="nav-drawer-cta" href="offres.html#contact">Contact ↗</a>
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
          <li><a href="index.html">SHOWREEL</a></li>
          <li><a href="projets.html">PROJETS</a></li>
          <li><a href="about.html">STUDIO</a></li>
          <li><a href="offres.html">PRESTATIONS</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:tomussproduction@gmail.com" target="_blank">tomussproduction@gmail.com</a></li>
          <li><a href="tel:+33637712176">+33 6 37 71 21 76</a></li>
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

window.injectChrome = function(active) {
  const navMount    = document.getElementById('nav-mount');
  const footerMount = document.getElementById('footer-mount');
  if (navMount)    navMount.outerHTML    = window.renderNav(active);
  if (footerMount) footerMount.outerHTML = window.renderFooter();

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
