(function ($) {
  'use strict';

  $('.stgb-pl-tab').on('click', function (e) {
    e.preventDefault();
    var target = $(this).attr('href');
    $('.stgb-pl-tab').removeClass('is-active');
    $(this).addClass('is-active');
    $('.stgb-pl-panel').removeClass('is-active');
    $(target).addClass('is-active');
  });

  $('.stgb-pl-reset-section').on('click', function () {
    if (!window.confirm('Reset this section to theme default?')) {
      return;
    }
    var section = $(this).data('reset-section');
    $('#stgb-pl-reset-' + section).trigger('submit');
  });
})(jQuery);
