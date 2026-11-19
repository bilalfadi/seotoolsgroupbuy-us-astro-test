/**
 * Theme JS — header scroll, mobile menu
 */
(function () {
  'use strict';

  var header = document.getElementById('stgb-header');
  var toggle = document.querySelector('.stgb-header__toggle');
  var drawer = document.getElementById('stgb-mobile-drawer');
  var backdrop = document.querySelector('.stgb-mobile-drawer__backdrop');
  var closeBtn = document.querySelector('.stgb-mobile-drawer__close');

  function setDrawer(open) {
    if (!drawer || !toggle) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('is-open'));
    });
  }
  if (backdrop) backdrop.addEventListener('click', function () { setDrawer(false); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false); });

  drawer && drawer.querySelectorAll('.stgb-mobile-drawer__links a, .stgb-mobile-drawer__topbar a, .stgb-mobile-drawer__cta a').forEach(function (link) {
    link.addEventListener('click', function () { setDrawer(false); });
  });

  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }, { passive: true });
  }
})();
