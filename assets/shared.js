// Shared interactions: curtain, fade-up, nav solidify on scroll


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
