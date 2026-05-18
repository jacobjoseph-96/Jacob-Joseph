(function () {
  'use strict';

  var SECTION_IDS = ['profile', 'stack', 'projects', 'experience', 'devops', 'contact'];

  /* ══════════════════════════════════════════════════════
     I18N
  ══════════════════════════════════════════════════════ */

  function initI18n() {
    var cache = {};

    function loadDict(lang, cb) {
      if (cache[lang]) { cb(cache[lang]); return; }
      fetch('assets/i18n/' + lang + '.json')
        .then(function (r) { return r.json(); })
        .then(function (dict) { cache[lang] = dict; cb(dict); })
        .catch(function () { console.error('Failed to load locale:', lang); });
    }

    function applyDict(lang, dict) {
      var isRTL = lang === 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) el.innerHTML = dict[key];
      });

      document.querySelectorAll('.lang-pills').forEach(function (widget) {
        widget.querySelectorAll('.lang-pill').forEach(function (btn) {
          var isActive = btn.getAttribute('data-lang') === lang;
          btn.classList.toggle('is-active', isActive);
          btn.classList.toggle('is-inactive', !isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });
      });
    }

    function applyLang(lang) {
      loadDict(lang, function (dict) { applyDict(lang, dict); });
    }

    document.querySelectorAll('.lang-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(btn.getAttribute('data-lang'));
      });
    });

    applyLang('en');
  }

  /* ══════════════════════════════════════════════════════
     THEME (dark / light)
  ══════════════════════════════════════════════════════ */

  function initTheme() {
    var html = document.documentElement;
    var isDark = true;

    function setTheme(dark) {
      isDark = dark;
      html.classList.toggle('dark', dark);
      html.classList.toggle('light', !dark);

      // Toggle icon visibility (sun shown when dark, moon when light)
      [
        ['theme-icon-mob-dark',  dark],
        ['theme-icon-mob-light', !dark],
        ['theme-icon-desk-dark', dark],
        ['theme-icon-desk-light',!dark]
      ].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el) el.classList.toggle('hidden', !pair[1]);
      });

      var deskLabel = document.getElementById('theme-label-desk');
      if (deskLabel) deskLabel.textContent = dark ? 'light' : 'dark';

      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
    }

    var saved;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    setTheme(saved !== 'light');

    var toggleMob = document.getElementById('theme-toggle-mob');
    var toggleDesk = document.getElementById('theme-toggle-desk');
    if (toggleMob)  toggleMob.addEventListener('click', function () { setTheme(!isDark); });
    if (toggleDesk) toggleDesk.addEventListener('click', function () { setTheme(!isDark); });
  }

  /* ══════════════════════════════════════════════════════
     NAVIGATION (mobile sidebar, scroll-spy, smooth scroll)
  ══════════════════════════════════════════════════════ */

  function initNav() {
    var menuBtn = document.getElementById('mob-menu-btn');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    sidebar.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 1024) closeSidebar();
      });
    });

    // Scroll-spy: highlight nav link matching current section
    var navLinks = document.querySelectorAll('.nav-link');
    function syncNav() {
      var atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2;
      var activeId;
      if (atBottom) {
        activeId = SECTION_IDS[SECTION_IDS.length - 1];
      } else {
        var y = window.scrollY + 120;
        activeId = SECTION_IDS[0];
        SECTION_IDS.forEach(function (id) {
          var el = document.getElementById(id);
          if (el && el.offsetTop <= y) activeId = id;
        });
      }
      navLinks.forEach(function (a) {
        a.classList.toggle('nav-link--active', a.getAttribute('href') === '#' + activeId);
      });
    }
    window.addEventListener('scroll', syncNav, { passive: true });
    syncNav();

    // Smooth scroll on anchor click
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        var offset = window.innerWidth >= 1024 ? 48 : 60;
        window.scrollTo({ top: t.offsetTop - offset, behavior: 'smooth' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════════════════ */

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ══════════════════════════════════════════════════════
     AUTONIX VIDEO
  ══════════════════════════════════════════════════════ */

  function initVideo() {
    var vid = document.getElementById('autonix-video');
    var replay = document.getElementById('autonix-replay');
    var fsBtn = document.getElementById('autonix-fullscreen');

    if (vid && replay) {
      vid.addEventListener('ended', function () { replay.style.display = 'flex'; });
      replay.addEventListener('click', function () {
        replay.style.display = 'none';
        vid.currentTime = 0;
        vid.play();
      });
      vid.addEventListener('error', function () { vid.controls = true; });
    }

    if (fsBtn && vid) {
      fsBtn.addEventListener('click', function () {
        var isFs = document.fullscreenElement || document.webkitFullscreenElement;
        if (isFs) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
          var req = vid.requestFullscreen || vid.webkitRequestFullscreen || vid.mozRequestFullScreen;
          if (req) req.call(vid);
        }
      });
      function onFsChange() {
        var isFs = document.fullscreenElement || document.webkitFullscreenElement;
        fsBtn.textContent = isFs ? '✕' : '⛶';
      }
      document.addEventListener('fullscreenchange', onFsChange);
      document.addEventListener('webkitfullscreenchange', onFsChange);
    }
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */

  initTheme();
  initI18n();
  initNav();
  initReveal();
  initVideo();
})();
