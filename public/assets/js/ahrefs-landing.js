/**
 * Ahrefs landing — mobile menu, FAQ accordion, WhatsApp review lightbox.
 */
(function () {
  'use strict';

  /* Mobile nav */
  var navToggle = document.querySelector('[data-ahrefs-nav-toggle]');
  var navMenu = document.querySelector('[data-ahrefs-nav-menu]');
  var navIconOpen = document.querySelector('[data-ahrefs-nav-icon-open]');
  var navIconClose = document.querySelector('[data-ahrefs-nav-icon-close]');

  function setNavOpen(open) {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (navIconOpen) navIconOpen.hidden = open;
    if (navIconClose) navIconClose.hidden = !open;
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!navMenu.classList.contains('is-open'));
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNavOpen(false);
      });
    });
  }

  /* FAQ accordion */
  var faqList = document.querySelector('[data-ahrefs-faq]');
  if (faqList) {
    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ahrefs-faq-toggle]');
      if (!btn) return;
      var item = btn.closest('[data-ahrefs-faq-item]');
      if (!item) return;
      var wasOpen = item.classList.contains('is-open');
      faqList.querySelectorAll('[data-ahrefs-faq-item]').forEach(function (el) {
        el.classList.remove('is-open');
        var toggle = el.querySelector('[data-ahrefs-faq-toggle]');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /* Reviews carousel + lightbox */
  var reviewsScroller = document.querySelector('[data-ahrefs-reviews-scroller]');
  var reviewPrev = document.querySelector('[data-ahrefs-reviews-prev]');
  var reviewNext = document.querySelector('[data-ahrefs-reviews-next]');

  function scrollReviews(dir) {
    if (!reviewsScroller) return;
    var card = reviewsScroller.querySelector('[data-ahrefs-review-card]');
    var step = (card ? card.offsetWidth : 360) + 24;
    reviewsScroller.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  if (reviewPrev) reviewPrev.addEventListener('click', function () { scrollReviews(-1); });
  if (reviewNext) reviewNext.addEventListener('click', function () { scrollReviews(1); });

  var lightbox = document.querySelector('[data-ahrefs-lightbox]');
  var lightboxImg = lightbox ? lightbox.querySelector('[data-ahrefs-lightbox-img]') : null;
  var lightboxTitle = lightbox ? lightbox.querySelector('[data-ahrefs-lightbox-title]') : null;
  var lightboxZoomLabel = lightbox ? lightbox.querySelector('[data-ahrefs-lightbox-zoom]') : null;
  var lightboxPan = lightbox ? lightbox.querySelector('[data-ahrefs-lightbox-pan]') : null;
  var zoomInBtn = lightbox ? lightbox.querySelector('[data-ahrefs-zoom-in]') : null;
  var zoomOutBtn = lightbox ? lightbox.querySelector('[data-ahrefs-zoom-out]') : null;
  var zoomResetBtn = lightbox ? lightbox.querySelector('[data-ahrefs-zoom-reset]') : null;
  var closeBtn = lightbox ? lightbox.querySelector('[data-ahrefs-lightbox-close]') : null;

  var reviewButtons = document.querySelectorAll('[data-ahrefs-review-open]');
  var ZOOM_MIN = 1;
  var ZOOM_MAX = 3;
  var ZOOM_STEP = 0.25;
  var lightboxZoom = 1.25;
  var lightboxIndex = null;
  var imgNatural = null;

  function getReviewData(idx) {
    var btn = document.querySelector('[data-ahrefs-review-open][data-index="' + idx + '"]');
    if (!btn) return null;
    return {
      src: btn.getAttribute('data-src'),
      alt: btn.getAttribute('data-alt') || '',
      index: idx,
      total: reviewButtons.length,
    };
  }

  function applyZoom() {
    if (!lightboxImg || !lightboxZoomLabel) return;
    if (imgNatural) {
      lightboxImg.style.width = (imgNatural.w * lightboxZoom) + 'px';
      lightboxImg.style.height = 'auto';
      lightboxImg.style.maxWidth = 'none';
    } else {
      lightboxImg.style.width = '';
      lightboxImg.style.maxWidth = 'min(100vw - 2rem, 1100px)';
      lightboxImg.style.height = 'auto';
    }
    lightboxZoomLabel.textContent = Math.round(lightboxZoom * 100) + '%';
    if (zoomInBtn) zoomInBtn.disabled = lightboxZoom >= ZOOM_MAX;
    if (zoomOutBtn) zoomOutBtn.disabled = lightboxZoom <= ZOOM_MIN;
  }

  function openLightbox(idx) {
    if (!lightbox || !lightboxImg) return;
    var data = getReviewData(idx);
    if (!data || !data.src) return;
    lightboxIndex = idx;
    lightboxZoom = 1.25;
    imgNatural = null;
    lightboxImg.src = data.src;
    lightboxImg.alt = data.alt;
    if (lightboxTitle) {
      lightboxTitle.textContent = 'Customer review ' + (data.index + 1) + ' of ' + data.total;
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    applyZoom();
    if (lightboxPan) lightboxPan.scrollTo({ top: 0, left: 0 });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightboxIndex = null;
    lightboxZoom = ZOOM_MIN;
    imgNatural = null;
    document.body.style.overflow = '';
    if (lightboxImg) {
      lightboxImg.src = '';
    }
  }

  reviewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var idx = parseInt(btn.getAttribute('data-index'), 10);
      if (!isNaN(idx)) openLightbox(idx);
    });
  });

  if (lightboxImg) {
    lightboxImg.addEventListener('load', function () {
      imgNatural = { w: lightboxImg.naturalWidth, h: lightboxImg.naturalHeight };
      applyZoom();
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      lightboxZoom = Math.min(ZOOM_MAX, Math.round((lightboxZoom + ZOOM_STEP) * 100) / 100);
      applyZoom();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      lightboxZoom = Math.max(ZOOM_MIN, Math.round((lightboxZoom - ZOOM_STEP) * 100) / 100);
      applyZoom();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      lightboxZoom = 1;
      applyZoom();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (lightboxPan) {
    lightboxPan.addEventListener('click', function () {
      closeLightbox();
    });
    var inner = lightboxPan.querySelector('[data-ahrefs-lightbox-inner]');
    if (inner) {
      inner.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });

  /* Stat bar animation on scroll */
  var statBars = document.querySelectorAll('[data-ahrefs-stat-bar]');
  if (statBars.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var width = entry.target.getAttribute('data-width');
          if (width) {
            entry.target.style.setProperty('--stat-width', width.indexOf('%') !== -1 ? width : width + '%');
          }
          entry.target.classList.add('is-animated');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    statBars.forEach(function (bar) { observer.observe(bar); });
  }

  /* Backlink chart bars */
  var chartBars = document.querySelectorAll('[data-ahrefs-chart-bar]');
  if (chartBars.length && 'IntersectionObserver' in window) {
    var chartObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-animated');
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    chartBars.forEach(function (bar) { chartObserver.observe(bar); });
  }
})();
