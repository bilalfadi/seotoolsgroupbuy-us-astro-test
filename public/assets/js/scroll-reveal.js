/**
 * Scroll reveal — IntersectionObserver for fade-in sections
 */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.stgb-reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.stgb-reveal').forEach(function (el) {
    observer.observe(el);
  });
})();
