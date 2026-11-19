(function ($) {
  'use strict';

  // Tabs
  $('.stgb-hp-tab').on('click', function (e) {
    e.preventDefault();
    var target = $(this).attr('href');
    $('.stgb-hp-tab').removeClass('is-active');
    $(this).addClass('is-active');
    $('.stgb-hp-panel').removeClass('is-active');
    $(target).addClass('is-active');
  });

  // Remove row
  $(document).on('click', '.stgb-hp-remove-row', function () {
    $(this).closest('tr').remove();
  });

  // Add feature
  $('#stgb-add-feature').on('click', function () {
    var row = $('#stgb-features-table tbody tr:first').clone();
    row.find('input, textarea').val('');
    row.find('select').val('chart');
    $('#stgb-features-table tbody').append(row);
  });

  // Add category
  $('#stgb-add-category').on('click', function () {
    var row = $('#stgb-categories-table tbody tr:first').clone();
    row.find('input').val('');
    row.find('select').val('all');
    $('#stgb-categories-table tbody').append(row);
  });
})(jQuery);
