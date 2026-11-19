/**
 * Semrush landing — timer, reviews carousel, lightbox, mobile menu, FAQ.
 */
(function () {
	'use strict';

	var root = document.querySelector('.semrush-landing');
	if (!root) return;

	/* ── Countdown timer ── */
	var hoursEl = root.querySelector('[data-timer-hours]');
	var minutesEl = root.querySelector('[data-timer-minutes]');
	var secondsEl = root.querySelector('[data-timer-seconds]');

	if (hoursEl && minutesEl && secondsEl) {
		var timeLeft = { hours: 5, minutes: 43, seconds: 21 };

		function pad(n) {
			return String(n).padStart(2, '0');
		}

		function tick() {
			if (timeLeft.seconds > 0) {
				timeLeft.seconds--;
			} else if (timeLeft.minutes > 0) {
				timeLeft.minutes--;
				timeLeft.seconds = 59;
			} else if (timeLeft.hours > 0) {
				timeLeft.hours--;
				timeLeft.minutes = 59;
				timeLeft.seconds = 59;
			}
			hoursEl.textContent = pad(timeLeft.hours);
			minutesEl.textContent = pad(timeLeft.minutes);
			secondsEl.textContent = pad(timeLeft.seconds);
		}

		setInterval(tick, 1000);
	}

	/* ── Mobile menu ── */
	var menuBtn = root.querySelector('[data-mobile-menu-toggle]');
	var mobileMenu = root.querySelector('[data-mobile-menu]');

	if (menuBtn && mobileMenu) {
		menuBtn.addEventListener('click', function () {
			var open = mobileMenu.hidden;
			mobileMenu.hidden = !open;
			menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
		});

		mobileMenu.querySelectorAll('a').forEach(function (link) {
			link.addEventListener('click', function () {
				mobileMenu.hidden = true;
				menuBtn.setAttribute('aria-expanded', 'false');
			});
		});
	}

	/* ── Reviews carousel ── */
	var scroller = root.querySelector('[data-reviews-scroller]');
	var prevBtn = root.querySelector('[data-reviews-prev]');
	var nextBtn = root.querySelector('[data-reviews-next]');

	function scrollReviews(dir) {
		if (!scroller) return;
		var card = scroller.querySelector('[data-review-card]');
		var step = (card ? card.offsetWidth : 320) + 24;
		scroller.scrollBy({ left: dir * step, behavior: 'smooth' });
	}

	if (prevBtn) prevBtn.addEventListener('click', function () { scrollReviews(-1); });
	if (nextBtn) nextBtn.addEventListener('click', function () { scrollReviews(1); });

	/* ── Reviews lightbox ── */
	var lightbox = document.getElementById('semrush-reviews-lightbox');
	var lightboxImg = lightbox ? lightbox.querySelector('[data-lightbox-img]') : null;
	var lightboxLabel = lightbox ? lightbox.querySelector('[data-lightbox-label]') : null;
	var zoomLabel = lightbox ? lightbox.querySelector('[data-lightbox-zoom-label]') : null;
	var zoomInBtn = lightbox ? lightbox.querySelector('[data-lightbox-zoom-in]') : null;
	var zoomOutBtn = lightbox ? lightbox.querySelector('[data-lightbox-zoom-out]') : null;
	var zoomResetBtn = lightbox ? lightbox.querySelector('[data-lightbox-zoom-reset]') : null;
	var closeBtn = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;

	var ZOOM_MIN = 1;
	var ZOOM_MAX = 3;
	var ZOOM_STEP = 0.25;
	var currentIndex = null;
	var currentZoom = 1.25;
	var reviewSrcs = [];

	root.querySelectorAll('[data-review-open]').forEach(function (btn) {
		var idx = parseInt(btn.getAttribute('data-review-open'), 10);
		var img = btn.querySelector('img');
		if (img) reviewSrcs[idx] = img.getAttribute('src') || img.dataset.src;
		btn.addEventListener('click', function () { openLightbox(idx); });
	});

	function updateZoom() {
		if (!lightboxImg || !zoomLabel) return;
		lightboxImg.style.transform = 'scale(' + currentZoom + ')';
		zoomLabel.textContent = Math.round(currentZoom * 100) + '%';
		if (zoomOutBtn) zoomOutBtn.disabled = currentZoom <= ZOOM_MIN;
		if (zoomInBtn) zoomInBtn.disabled = currentZoom >= ZOOM_MAX;
	}

	function openLightbox(index) {
		if (!lightbox || !lightboxImg) return;
		currentIndex = index;
		currentZoom = 1.25;
		lightboxImg.src = reviewSrcs[index] || '';
		lightboxImg.alt = 'User Review ' + (index + 1);
		if (lightboxLabel) {
			lightboxLabel.textContent = 'Review ' + (index + 1) + ' of ' + reviewSrcs.filter(Boolean).length;
		}
		updateZoom();
		lightbox.hidden = false;
		document.body.style.overflow = 'hidden';
	}

	function closeLightbox() {
		if (!lightbox) return;
		lightbox.hidden = true;
		currentIndex = null;
		currentZoom = ZOOM_MIN;
		document.body.style.overflow = '';
	}

	if (zoomInBtn) {
		zoomInBtn.addEventListener('click', function (e) {
			e.stopPropagation();
			currentZoom = Math.min(ZOOM_MAX, Math.round((currentZoom + ZOOM_STEP) * 100) / 100);
			updateZoom();
		});
	}

	if (zoomOutBtn) {
		zoomOutBtn.addEventListener('click', function (e) {
			e.stopPropagation();
			currentZoom = Math.max(ZOOM_MIN, Math.round((currentZoom - ZOOM_STEP) * 100) / 100);
			updateZoom();
		});
	}

	if (zoomResetBtn) {
		zoomResetBtn.addEventListener('click', function (e) {
			e.stopPropagation();
			currentZoom = 1;
			updateZoom();
		});
	}

	if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

	if (lightbox) {
		var backdrop = lightbox.querySelector('[data-lightbox-backdrop]');
		if (backdrop) backdrop.addEventListener('click', closeLightbox);
		var imgWrap = lightbox.querySelector('[data-lightbox-img-wrap]');
		if (imgWrap) imgWrap.addEventListener('click', function (e) { e.stopPropagation(); });
	}

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
	});

	/* ── FAQ accordion (one open at a time) ── */
	var faqItems = root.querySelectorAll('.semrush-faq details');
	faqItems.forEach(function (item) {
		item.addEventListener('toggle', function () {
			if (!item.open) return;
			faqItems.forEach(function (other) {
				if (other !== item) other.open = false;
			});
		});
	});

	/* ── Scroll reveal ── */
	if ('IntersectionObserver' in window) {
		var revealEls = root.querySelectorAll('.semrush-reveal');
		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
		);
		revealEls.forEach(function (el) { observer.observe(el); });
	} else {
		root.querySelectorAll('.semrush-reveal').forEach(function (el) {
			el.classList.add('is-visible');
		});
	}
})();
