(function () {
  'use strict';

  var SECTION_IDS = ['profile', 'stack', 'projects', 'experience', 'education', 'certificates', 'contact'];

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
      document.documentElement.lang = lang;

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

      // The log pose label is copied off the active nav link, so it needs
      // a re-read once the nav labels themselves have been translated.
      window.dispatchEvent(new Event('langchange'));
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

    // The Grand Line banner ships as two SVGs, one per mode. The site's
    // theme is class-toggled rather than OS-driven, so a <picture> with a
    // prefers-color-scheme source would desync from the toggle button —
    // swapping src here keeps them in step and fetches only the variant
    // actually on screen.
    var GRANDLINE = 'https://raw.githubusercontent.com/jacobjoseph-96/jacobjoseph-96/output/grandline-';
    function setBanner(dark) {
      var img = document.getElementById('grandline');
      if (img) img.src = GRANDLINE + (dark ? 'dark' : 'light') + '.svg';
    }

    function setTheme(dark) {
      isDark = dark;
      html.classList.toggle('dark', dark);
      html.classList.toggle('light', !dark);
      setBanner(dark);

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

    // Light (the aged sea chart) is the default; dark is opt-in and sticky.
    var saved;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    setTheme(saved === 'dark');

    var toggleMob = document.getElementById('theme-toggle-mob');
    var toggleDesk = document.getElementById('theme-toggle-desk');
    function toggle() {
      var next = !isDark;
      // View Transitions API gives a true cross-fade of the painted frame.
      if (document.startViewTransition) {
        document.startViewTransition(function () { setTheme(next); });
      } else {
        setTheme(next);
      }
    }
    if (toggleMob)  toggleMob.addEventListener('click', toggle);
    if (toggleDesk) toggleDesk.addEventListener('click', toggle);
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
    var logPose = document.getElementById('log-pose');
    var logPoseTarget = document.getElementById('log-pose-target');

    // The log pose needle divides the compass evenly across the sections,
    // so each one gets its own heading and the needle swings between them.
    function syncLogPose(activeId, activeLink) {
      if (!logPose) return;
      var i = SECTION_IDS.indexOf(activeId);
      if (i < 0) i = 0;
      logPose.style.setProperty('--needle', (i * (360 / SECTION_IDS.length)).toFixed(1) + 'deg');
      // Read the label off the nav link so it follows the active language.
      if (logPoseTarget && activeLink) {
        var label = activeLink.querySelector('span:last-child');
        if (label) logPoseTarget.textContent = label.textContent.trim();
      }
    }

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
      var activeLink = null;
      navLinks.forEach(function (a) {
        var isActive = a.getAttribute('href') === '#' + activeId;
        a.classList.toggle('nav-link--active', isActive);
        if (isActive) activeLink = a;
      });
      syncLogPose(activeId, activeLink);
    }
    window.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('langchange', syncNav);
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
     SHIP'S SONG — the Tone Dial

     A Tone Dial is the shell that stores a recording, so it
     is what the music control looks like. Behaviour, in order
     of preference:

       1. If the visitor has switched sound off before, stay
          silent — the choice is sticky and nothing autoplays.
       2. Try to play on load. Browsers only allow unmuted
          autoplay once the visitor has engaged with the origin
          (Chrome's Media Engagement Index), so this succeeds on
          repeat visits and fails on a cold one.
       3. On refusal, ring the dial and arm a one-shot listener:
          the first click, key, wheel or scroll starts the song.
       4. The dial itself always plays / pauses on click, and M
          toggles from the keyboard.

     Volume is ramped, never cut. The analyser is optional
     decoration — if Web Audio is unavailable or the context
     will not run, playback carries on without it.
  ══════════════════════════════════════════════════════ */

  function initShipSong() {
    var audio = document.getElementById('ship-song');
    var dials = [].slice.call(document.querySelectorAll('.tone-dial'));
    if (!audio || !dials.length) return;

    var root = document.documentElement;
    var statusEl = document.getElementById('tone-dial-status');
    var LEVEL = 0.42;      // resting volume — background, not a concert
    var DUCK = 0.08;       // while the Autonix demo has the floor
    var FADE_IN = 2500;
    var FADE_OUT = 400;
    var GESTURES = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'];

    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var armed = false;       // waiting on a first gesture
    var hiddenPause = false; // paused because the tab went away
    var ducked = false;
    var unlockedAt = 0;      // guards the click that both unlocked and toggled

    var saved = null;
    try { saved = localStorage.getItem('shipSong'); } catch (e) {}
    function remember(v) { try { localStorage.setItem('shipSong', v); } catch (e) {} }

    /* ── Web Audio graph ────────────────────────────────
       source → analyser → gain → destination. Built once, and
       only while the context is actually running: routing an
       element through a suspended context silences it. The gain
       node also gives us a working fade on iOS, where
       HTMLMediaElement.volume is read-only. */
    var ctx = null, analyser = null, gain = null, bins = null, graphTried = false;

    function buildGraph() {
      try {
        var src = ctx.createMediaElementSource(audio);
        analyser = ctx.createAnalyser();
        // 512 → 256 bins ≈ 94 Hz each at 48 kHz, enough resolution to tell
        // a kick drum from a cymbal; 128 lumped the whole track into one blob.
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.75;
        gain = ctx.createGain();
        gain.gain.value = audio.volume;
        src.connect(analyser);
        analyser.connect(gain);
        gain.connect(ctx.destination);
        bins = new Uint8Array(analyser.frequencyBinCount);
        audio.volume = 1;    // the gain node owns the level from here
        return true;
      } catch (e) {
        analyser = null;
        gain = null;
        return false;
      }
    }

    // cb(ok) — ok is false when we must fall back to the bare element.
    function withGraph(cb) {
      if (graphTried) { cb(!!analyser); return; }
      graphTried = true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { cb(false); return; }
      try { ctx = new AC(); } catch (e) { ctx = null; }
      if (!ctx) { cb(false); return; }

      function go() {
        cb(ctx.state === 'running' && buildGraph());
      }
      var resumed = (ctx.state === 'suspended' && ctx.resume) ? ctx.resume() : null;
      if (resumed && resumed.then) resumed.then(go, function () { cb(false); });
      else go();
    }

    /* ── Volume ─────────────────────────────────────────── */
    function getVol() { return gain ? gain.gain.value : audio.volume; }
    function setVol(v) {
      if (gain) { gain.gain.value = v; return; }
      try { audio.volume = v; } catch (e) {}
    }

    var ramp = 0;
    function fadeTo(target, ms, done) {
      if (ramp) { cancelAnimationFrame(ramp); ramp = 0; }
      var from = getVol();
      var t0 = performance.now();
      (function step(now) {
        var k = ms > 0 ? Math.min(1, (now - t0) / ms) : 1;
        setVol(from + (target - from) * k);
        if (k < 1) ramp = requestAnimationFrame(step);
        else { ramp = 0; if (done) done(); }
      })(t0);
    }

    /* ── Dial state ─────────────────────────────────────── */
    function paint() {
      var playing = !audio.paused;
      dials.forEach(function (d) {
        d.classList.toggle('is-playing', playing);
        d.classList.toggle('is-ringing', armed && !playing);
        d.setAttribute('aria-pressed', String(playing));
      });
      if (statusEl) {
        // Read the announcement off the label that is currently shown, so it
        // follows whatever language the dictionary put there.
        var lab = document.querySelector(
          '.tone-dial--mini .tone-dial__label--' +
          (playing ? 'play' : (armed ? 'ring' : 'idle'))
        );
        statusEl.textContent = lab ? lab.textContent.trim() : '';
      }
    }

    /* ── The gesture unlock ─────────────────────────────── */
    function onGesture() {
      unlockedAt = Date.now();
      disarm();
      play(true);
    }
    function arm() {
      if (armed) return;
      armed = true;
      GESTURES.forEach(function (t) {
        window.addEventListener(t, onGesture, { once: true, passive: true, capture: true });
      });
      paint();
    }
    function disarm() {
      if (!armed) return;
      armed = false;
      GESTURES.forEach(function (t) { window.removeEventListener(t, onGesture, true); });
      paint();
    }

    /* ── Transport ──────────────────────────────────────── */
    function play(fromUser) {
      setVol(0);
      var p = audio.play();
      if (p && p['catch']) {
        p['catch'](function () {
          // Refused. On a cold visit that is expected — ring and wait.
          if (!fromUser) arm();
        });
      }
    }
    function pause(byUser) {
      if (byUser) remember('off');
      fadeTo(0, FADE_OUT, function () { audio.pause(); });
    }
    function toggle() {
      // The very gesture that unlocked playback also lands here as a click;
      // without this the song would start and stop in the same tick.
      if (Date.now() - unlockedAt < 500) return;
      if (audio.paused) play(true); else pause(true);
    }

    audio.addEventListener('play', function () {
      disarm();
      remember('on');
      setVol(0);
      withGraph(function () {
        setVol(0);
        fadeTo(ducked ? DUCK : LEVEL, FADE_IN);
        startViz();
      });
      paint();
    });
    audio.addEventListener('pause', function () { stopViz(); paint(); });

    /* ── The reactive channel ───────────────────────────
       One rAF loop, alive only while the song is. It writes two
       custom properties and four bar heights; CSS does the rest.
       Off entirely under reduced motion and on phones. */
    var raf = 0, swell = 0, shimmer = 0;
    var slowLow = 0, slowHigh = 0;   // slow averages, so the vars read as a
                                     // pulse above the mix rather than a
                                     // constant offset that never comes down
    // Bin ranges at fftSize 512 / 48 kHz: ~90–560 Hz (the swell) and
    // ~2.8–7.5 kHz (the shimmer). The four bars split the band between them.
    var BARS = [[2, 8], [8, 22], [22, 48], [48, 96]];
    var slowBars = [0, 0, 0, 0];
    var barVals = ['0.12', '0.12', '0.12', '0.12'];
    var barSets = [];
    dials.forEach(function (d) {
      var bars = d.querySelectorAll('.tone-dial__bars i');
      if (bars.length) barSets.push([].slice.call(bars));
    });

    function vizAllowed() {
      return !reduced && window.innerWidth >= 640;
    }
    function flagNoAnalyser() {
      dials.forEach(function (d) { d.classList.add('no-analyser'); });
    }
    function band(from, to) {
      var s = 0;
      for (var i = from; i < to; i++) s += bins[i];
      return s / (to - from) / 255;
    }
    // How far this instant sits above the running average — a beat, not a level.
    function pulse(now, avg) {
      return Math.max(0, Math.min(1, (now - avg) * 3.2 + 0.1));
    }
    function writeVars() {
      root.style.setProperty('--swell', swell.toFixed(3));
      root.style.setProperty('--shimmer', shimmer.toFixed(3));
    }
    function tick() {
      raf = 0;
      if (!analyser || audio.paused) { decay(); return; }
      analyser.getByteFrequencyData(bins);

      var low = band(1, 6);
      var high = band(30, 80);
      slowLow += (low - slowLow) * 0.02;
      slowHigh += (high - slowHigh) * 0.02;
      swell += (pulse(low, slowLow) - swell) * 0.25;
      shimmer += (pulse(high, slowHigh) - shimmer) * 0.25;
      writeVars();

      // Each bar dances around its own running average. Absolute levels would
      // leave the bass bar pinned at the ceiling for the whole track.
      for (var i = 0; i < BARS.length; i++) {
        var raw = band(BARS[i][0], BARS[i][1]);
        slowBars[i] += (raw - slowBars[i]) * 0.03;
        barVals[i] = Math.max(0.12, Math.min(1, 0.28 + (raw - slowBars[i]) * 3.4)).toFixed(2);
      }
      barSets.forEach(function (bars) {
        for (var j = 0; j < bars.length && j < barVals.length; j++) {
          bars[j].style.setProperty('--b', barVals[j]);
        }
      });
      raf = requestAnimationFrame(tick);
    }
    function decay() {
      swell *= 0.86;
      shimmer *= 0.86;
      if (swell < 0.005) { swell = 0; shimmer = 0; }
      writeVars();
      barSets.forEach(function (bars) {
        for (var i = 0; i < bars.length; i++) bars[i].style.setProperty('--b', '0.12');
      });
      if (swell > 0) requestAnimationFrame(decay);
    }
    function startViz() {
      if (!vizAllowed() || !analyser) { flagNoAnalyser(); return; }
      dials.forEach(function (d) { d.classList.remove('no-analyser'); });
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function stopViz() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      decay();
    }

    /* ── Courtesies ─────────────────────────────────────── */

    // A tab nobody is looking at should not be singing.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (!audio.paused) { hiddenPause = true; audio.pause(); }
      } else if (hiddenPause) {
        hiddenPause = false;
        play(true);
      }
    });

    // The Autonix demo ships muted, but if it is ever unmuted or taken
    // fullscreen it gets the floor and the song ducks under it.
    var vid = document.getElementById('autonix-video');
    if (vid) {
      var syncDuck = function () {
        var loud = !vid.muted && !vid.paused;
        var fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        var next = loud || fs;
        if (next === ducked) return;
        ducked = next;
        if (!audio.paused) fadeTo(ducked ? DUCK : LEVEL, 350);
      };
      ['volumechange', 'play', 'pause'].forEach(function (t) {
        vid.addEventListener(t, syncDuck);
      });
      document.addEventListener('fullscreenchange', syncDuck);
      document.addEventListener('webkitfullscreenchange', syncDuck);
    }

    // M for music.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'm' && e.key !== 'M') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      toggle();
    });

    dials.forEach(function (d) { d.addEventListener('click', toggle); });
    window.addEventListener('langchange', paint);

    paint();
    if (saved === 'off') return;   // silent by choice, and it stays that way
    play(false);
  }

  /* ══════════════════════════════════════════════════════
     MOTION — the pieces that need JS. Everything else
     (the poster swinging onto its nails, the sea drift, the
     lantern gradient itself) is CSS, and all of it is off
     under prefers-reduced-motion.
  ══════════════════════════════════════════════════════ */

  function initMotion() {
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Hero name, one character at a time. initI18n() rewrites these
       nodes' innerHTML on every language switch, so the split has to
       run again after each one — hence the langchange hook. The h1
       carries an aria-label, so the split never reaches a screen reader. */
    function splitNames() {
      document.querySelectorAll('.kin').forEach(function (el) {
        var text = el.textContent;
        // firstElementChild is the tell that the split survived: applyDict()
        // rewrites innerHTML, which wipes the spans while leaving the text
        // (and so the guard attribute) identical.
        if (!text || (el.getAttribute('data-split') === text && el.firstElementChild)) return;
        el.textContent = '';
        for (var i = 0; i < text.length; i++) {
          var s = document.createElement('span');
          s.style.setProperty('--i', String(i));
          s.textContent = text.charAt(i);
          if (text.charAt(i) === ' ') s.style.whiteSpace = 'pre';
          el.appendChild(s);
        }
        el.setAttribute('data-split', text);
      });
    }
    splitNames();
    window.addEventListener('langchange', splitNames);

    /* Number the direct children of each revealed section so they rise
       in sequence instead of all at once. Costs one pass at init and
       no extra observers. */
    document.querySelectorAll('.reveal').forEach(function (sec) {
      var i = 0;
      [].forEach.call(sec.children, function (child) {
        child.classList.add('reveal-child');
        child.style.setProperty('--i', String(i++));
      });
    });

    /* Lantern: project cards pick up a glow that follows the cursor.
       One rAF-throttled handler per card, pointer-fine only. */
    if (reduced || !window.matchMedia ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.querySelectorAll('#projects article').forEach(function (card) {
      var pending = 0;
      card.addEventListener('pointermove', function (e) {
        if (pending) return;
        pending = requestAnimationFrame(function () {
          pending = 0;
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
          card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        });
      }, { passive: true });
    });
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */

  initTheme();
  initI18n();
  initNav();
  initReveal();
  initVideo();
  initMotion();
  initShipSong();
})();
