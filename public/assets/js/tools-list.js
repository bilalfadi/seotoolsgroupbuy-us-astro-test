/**
 * Shop / tools list — Load More (20 products per batch).
 */
(function () {
  'use strict';

  var btn = document.querySelector('.stgb-tools-list-load-more');
  var grid = document.querySelector('.stgb-tools-list-grid');
  var wrap = document.querySelector('.stgb-tools-list-load-more-wrap');

  if (!btn || !grid) {
    return;
  }

  var loading = false;
  var config = window.stgbToolsList || {};
  var restBase = config.restUrl || '/wp-json/stgb/v1/tools';
  var loadingText = config.loadingText || 'Loading...';
  var errorText = config.errorText || 'Load More — try again';

  btn.addEventListener('click', function () {
    if (loading) {
      return;
    }

    loading = true;
    btn.disabled = true;
    btn.textContent = loadingText;

    var page = parseInt(btn.getAttribute('data-page'), 10) + 1;
    var tab = btn.getAttribute('data-tab') || 'all';
    var perPage = parseInt(btn.getAttribute('data-per-page'), 10) || 20;
    var url =
      restBase +
      '?tab=' +
      encodeURIComponent(tab) +
      '&page=' +
      page +
      '&per_page=' +
      perPage;

    fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('request failed');
        }
        return res.json();
      })
      .then(function (data) {
        if (data.html) {
          grid.insertAdjacentHTML('beforeend', data.html);
        }

        btn.setAttribute('data-page', String(page));

        if (!data.has_more) {
          if (wrap) {
            wrap.style.display = 'none';
          }
          return;
        }

        var remaining = Math.max(0, (data.total || 0) - (data.loaded || 0));
        var label = config.loadMoreLabel || 'Load More (%d more tools)';
        btn.textContent = label.replace('%d', String(remaining));
        btn.disabled = false;
      })
      .catch(function () {
        btn.textContent = errorText;
        btn.disabled = false;
      })
      .finally(function () {
        loading = false;
      });
  });
})();
