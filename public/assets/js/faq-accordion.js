/**
 * Homepage FAQ accordion — native <details> with one-open-at-a-time.
 */
(function () {
  'use strict';

  function initHomepageFaq() {
    document.querySelectorAll('.s5-faq__list').forEach(function (list) {
      /* Legacy div+button markup (DB content not yet migrated). */
      list.addEventListener('click', function (e) {
        var btn = e.target.closest('.s5-faq__q');
        if (!btn || btn.closest('details')) {
          return;
        }
        var item = btn.closest('.s5-faq__item');
        if (!item) {
          return;
        }
        var wasOpen = item.classList.contains('is-open');
        list.querySelectorAll('.s5-faq__item').forEach(function (el) {
          el.classList.remove('is-open');
        });
        if (!wasOpen) {
          item.classList.add('is-open');
        }
      });

      /* Native details — works without JS; JS keeps one panel open. */
      list.querySelectorAll('details.s5-faq__item').forEach(function (detail) {
        detail.addEventListener('toggle', function () {
          if (!detail.open) {
            return;
          }
          list.querySelectorAll('details.s5-faq__item').forEach(function (other) {
            if (other !== detail) {
              other.open = false;
            }
          });
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageFaq);
  } else {
    initHomepageFaq();
  }
})();
