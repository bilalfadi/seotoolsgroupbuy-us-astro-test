(function () {
  'use strict';

  var search = document.getElementById('stgb-blog-search');
  var cards = document.querySelectorAll('.stgb-blog-archive-card');
  var buttons = document.querySelectorAll('.stgb-blog-archive-toolbar__cats button');
  var empty = document.querySelector('.stgb-blog-archive-empty');

  if (!search || !cards.length) {
    return;
  }

  var activeFilter = 'all';

  function normalize(value) {
    return (value || '').toLowerCase().trim();
  }

  function cardMatches(card) {
    var query = normalize(search.value);
    var title = normalize(card.getAttribute('data-title'));
    var excerpt = normalize(card.getAttribute('data-excerpt'));
    var tags = normalize(card.getAttribute('data-tags'));

    if (query && title.indexOf(query) === -1 && excerpt.indexOf(query) === -1) {
      return false;
    }

    if (activeFilter !== 'all' && tags.indexOf(activeFilter) === -1) {
      return false;
    }

    return true;
  }

  function update() {
    var visible = 0;

    cards.forEach(function (card) {
      var show = cardMatches(card);
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-hidden', visible > 0);
    }
  }

  search.addEventListener('input', update);

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      buttons.forEach(function (btn) {
        btn.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeFilter = button.getAttribute('data-filter') || 'all';
      update();
    });
  });
})();
