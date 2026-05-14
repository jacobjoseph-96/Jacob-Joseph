(function () {
  'use strict';

  var cache = {};
  var currentLang = 'en';

  function loadDict(lang, callback) {
    if (cache[lang]) { callback(cache[lang]); return; }
    fetch('assets/i18n/' + lang + '.json')
      .then(function (r) { return r.json(); })
      .then(function (dict) { cache[lang] = dict; callback(dict); })
      .catch(function () { console.error('Failed to load locale:', lang); });
  }

  function applyDict(lang, dict) {
    currentLang = lang;
    var isRTL = lang === 'ar';

    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    document.body.style.fontFamily = isRTL
      ? "'Noto Sans Arabic', 'Inter', sans-serif"
      : '';

    var sb = document.getElementById('sidebar');
    if (sb) {
      if (isRTL) {
        sb.style.left = 'auto';
        sb.style.right = '0';
        sb.style.borderRight = 'none';
        sb.style.borderLeft = '1px solid rgba(30,41,59,0.6)';
      } else {
        sb.style.left = '';
        sb.style.right = '';
        sb.style.borderRight = '';
        sb.style.borderLeft = '';
      }
    }

    var mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.style.marginLeft = isRTL ? '0' : '';
      mainEl.style.marginRight = isRTL ? '16rem' : '';
    }

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

  /* Load default language */
  loadDict('en', function (dict) { applyDict('en', dict); });

  /* ── Mobile sidebar toggle ── */
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

  /* ── Scroll reveal ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px 0px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ── Active nav link on scroll ── */
  var navLinks = document.querySelectorAll('.nav-link');
  var sectionIds = ['profile', 'stack', 'projects', 'experience', 'devops', 'contact'];

  function syncNav() {
    var atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2;
    if (atBottom) {
      var lastId = sectionIds[sectionIds.length - 1];
      navLinks.forEach(function (a) {
        a.classList.toggle('nav-link--active', a.getAttribute('href') === '#' + lastId);
      });
      return;
    }
    var y = window.scrollY + 120;
    var activeId = sectionIds[0];
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= y) activeId = id;
    });
    navLinks.forEach(function (a) {
      var href = a.getAttribute('href');
      a.classList.toggle('nav-link--active', href === '#' + activeId);
    });
  }
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ── Smooth scroll ── */
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

  /* ── Autonix video ── */
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
})();
