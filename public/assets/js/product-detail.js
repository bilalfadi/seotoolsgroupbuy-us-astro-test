/**
 * Product detail sticky sidebar — matches Next.js StickySidebarBox.
 */
(function () {
  'use strict';

  var sidebar = document.getElementById('product-detail-sidebar');
  if (!sidebar) return;

  var sectionId = sidebar.getAttribute('data-section-id');
  var contentId = sidebar.getAttribute('data-content-id');
  if (!sectionId || !contentId) return;

  function onScroll() {
    var grid = document.getElementById(sectionId);
    var content = document.getElementById(contentId);
    if (!grid || !content) return;

    var gridTop = grid.getBoundingClientRect().top;
    var contentBottom = content.getBoundingClientRect().bottom;
    var inZone = gridTop <= 120 && contentBottom > 140;
    var belowContent = contentBottom <= 140;

    sidebar.classList.toggle('is-fixed', inZone);
    sidebar.classList.toggle('is-right', inZone);
    sidebar.classList.toggle('is-below', belowContent && !inZone);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  var reviewsRoot = document.querySelector('.stgb-product-reviews');
  if (!reviewsRoot) return;

  var scroller = reviewsRoot.querySelector('[data-stgb-reviews-scroller]');
  var prevBtn = reviewsRoot.querySelector('[data-stgb-reviews-prev]');
  var nextBtn = reviewsRoot.querySelector('[data-stgb-reviews-next]');
  var lightbox = document.querySelector('[data-stgb-review-lightbox]');
  var lightboxImg = lightbox ? lightbox.querySelector('[data-stgb-review-lightbox-img]') : null;
  var lightboxLabel = lightbox ? lightbox.querySelector('[data-stgb-review-lightbox-label]') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('[data-stgb-review-lightbox-close]') : null;
  var lightboxBody = lightbox ? lightbox.querySelector('[data-stgb-review-lightbox-body]') : null;
  var reviewLinks = reviewsRoot.querySelectorAll('[data-stgb-review-open]');

  function scrollReviews(dir) {
    if (!scroller) return;
    var card = scroller.querySelector('.stgb-product-reviews__card');
    var step = (card ? card.offsetWidth : 320) + 16;
    scroller.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  function openLightbox(link, index) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = link.getAttribute('href') || '';
    lightboxImg.alt = link.getAttribute('aria-label') || 'Review';
    if (lightboxLabel) {
      lightboxLabel.textContent = 'Review ' + (index + 1) + ' of ' + reviewLinks.length;
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    if (lightboxImg) lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { scrollReviews(-1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { scrollReviews(1); });

  reviewLinks.forEach(function (link, index) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(link, index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBody) {
    lightboxBody.addEventListener('click', function (e) {
      if (e.target === lightboxBody) closeLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
  });
})();
