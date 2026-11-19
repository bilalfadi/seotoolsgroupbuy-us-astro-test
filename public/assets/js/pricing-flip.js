/**
 * Pricing card flip — click "View included tools", mouse leave to return.
 * Matches Next.js PricingCardsSection.tsx behavior.
 */
(function () {
  'use strict';

  document.querySelectorAll('.s3-pricing__card-wrap').forEach(function (wrap) {
    var viewBtn = wrap.querySelector('.s3-pricing__view');
    if (!viewBtn) return;

    var list = wrap.querySelector('.s3-pricing__card-back-list');
    if (list) {
      list.addEventListener(
        'wheel',
        function (e) {
          var el = list;
          var atTop = el.scrollTop <= 0;
          var atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
          if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return;
          e.stopPropagation();
        },
        { passive: true }
      );
    }

    viewBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      wrap.classList.add('is-flipped');
    });

    wrap.addEventListener('mouseleave', function () {
      wrap.classList.remove('is-flipped');
    });
  });
})();
