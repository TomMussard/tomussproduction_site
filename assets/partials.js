// Reusable nav + footer injection
window.renderNav = function(active) {
  const items = [
    { key: 'home',     label: 'Showreel', href: 'index.html' },
    { key: 'projects', label: 'Montages', href: 'projets.html' },
    { key: 'about',    label: 'Studio',   href: 'about.html' },
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
      <a class="nav-cta" href="offres.html#contact">Contact ↗</a>
    </nav>
  `;
};

window.renderFooter = function() {
  return `
    <footer class="footer">
      <div>
        <h4>Disponible</h4>
        <p class="big">Faisons<br/>quelque<br/>chose.</p>
      </div>
      <div>
        <h4>Navigation</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="projets.html">Projets</a></li>
          <li><a href="about.html">À propos</a></li>
          <li><a href="offres.html">Offres & Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:hello@tomussproduction.fr">hello@tomussproduction.fr</a></li>
          <li><a href="#">+33 (0)6 — —</a></li>
          <li><a href="#">Le Mans, France</a></li>
        </ul>
      </div>
      <div>
        <h4>Réseaux</h4>
        <ul>
          <li><a href="#">Instagram ↗</a></li>
          <li><a href="#">YouTube ↗</a></li>
          <li><a href="#">TikTok ↗</a></li>
          <li><a href="#">LinkedIn ↗</a></li>
        </ul>
      </div>
      <div class="footer-bar">
        <span>© 2026 — Tomuss Production</span>
        <span>Monteur vidéo · Le Mans, FR</span>
        <span>v1.0 / made with film grain</span>
      </div>
    </footer>
  `;
};

window.injectChrome = function(active) {
  const navMount = document.getElementById('nav-mount');
  const footerMount = document.getElementById('footer-mount');
  if (navMount) navMount.outerHTML = window.renderNav(active);
  if (footerMount) footerMount.outerHTML = window.renderFooter();
};
