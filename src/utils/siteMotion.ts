/**
 * Lightweight site-wide motion enhancement.
 * Uses native observers: no extra dependencies, no hidden content before JS.
 * Excludes exam interactions and editable form controls.
 */
export function initializeSiteMotion(): () => void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet<Element>();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('site-motion-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  const scan = () => {
    if (reduced.matches) return;
    // Never animate exam content, timed questions, or user input fields.
    const candidates = document.querySelectorAll(
      'main section, main article, main [data-reveal], [role="main"] section'
    );
    candidates.forEach(element => {
      if (seen.has(element) || element.closest('[data-no-motion], [data-exam], .cbt-exam, [role="dialog"]')) return;
      seen.add(element);
      element.classList.add('site-motion-section');
      // Above-the-fold content stays visible immediately.
      if (element.getBoundingClientRect().top < window.innerHeight * 0.85) {
        element.classList.add('site-motion-visible');
      } else {
        observer.observe(element);
      }
    });
  };

  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => { frame = 0; scan(); });
  };
  const mutations = new MutationObserver(schedule);
  mutations.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
  reduced.addEventListener('change', schedule);
  schedule();
  return () => {
    mutations.disconnect();
    observer.disconnect();
    reduced.removeEventListener('change', schedule);
    if (frame) window.cancelAnimationFrame(frame);
  };
}
