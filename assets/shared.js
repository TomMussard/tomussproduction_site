// Shared interactions: curtain, fade-up, nav solidify on scroll

// ── Curseur Premiere Pro ──────────────────────────────────────────────────────
(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const root = document.documentElement;
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Suivi exact du point
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    root.style.setProperty('--cx', mx + 'px');
    root.style.setProperty('--cy', my + 'px');

    // Hover sur éléments interactifs
    const over = !!e.target.closest(
      'a, button, [role="button"], .ptype, .filter, .collab-cell, ' +
      '.service-row, .offer, .thumb, .approach-row, .yt-card, ' +
      'input, textarea, select, .slide-cta, .pill, .submit, .nav-cta'
    );
    document.body.classList.toggle('cursor-hover', over);
  });

  // Anneau avec retard fluide
  (function animate() {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    root.style.setProperty('--rx', rx + 'px');
    root.style.setProperty('--ry', ry + 'px');
    requestAnimationFrame(animate);
  })();

  // Apparition au premier mouvement
  document.addEventListener('mousemove', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  }, { once: true });

  // Disparaît quand la souris quitte la fenêtre
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Pulse au clic
  document.addEventListener('mousedown', () => {
    ring.classList.remove('is-clicking');
    void ring.offsetWidth;
    ring.classList.add('is-clicking');
  });
  ring.addEventListener('animationend', () => ring.classList.remove('is-clicking'));
})();

document.addEventListener('DOMContentLoaded', () => {
  // Fade-up on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

  // Nav solidify
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('solid');
      else nav.classList.remove('solid');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Horizontal scroll for gallery
  const hScroll = document.getElementById('hScroll');
  const hScrollInner = document.getElementById('hScrollInner');
  if (hScroll && hScrollInner) {
    let isScrolling = false;
    hScroll.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (isScrolling) return;
      isScrolling = true;
      const delta = e.deltaY || e.deltaX;
      hScrollInner.scrollBy({
        left: delta,
        behavior: 'smooth'
      });
      setTimeout(() => isScrolling = false, 100);
    }, { passive: false });

    // Update progress bar
    const progressFill = document.querySelector('.h-progress .fill');
    const progressCount = document.querySelector('.h-progress .count');
    if (progressFill && progressCount) {
      const updateProgress = () => {
        const scrollLeft = hScrollInner.scrollLeft;
        const scrollWidth = hScrollInner.scrollWidth - hScrollInner.clientWidth;
        const progress = scrollWidth > 0 ? scrollLeft / scrollWidth : 0;
        progressFill.style.inset = `0 ${100 - progress * 100}% 0 0`;
        const visibleThumbs = Math.round(progress * 6) + 1;
        progressCount.textContent = `${visibleThumbs}/6`;
      };
      hScrollInner.addEventListener('scroll', updateProgress);
      updateProgress();
    }
  }
});
