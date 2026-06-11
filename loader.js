/* ============================================================
   FREEDOM TRACKER LOADER — host on GitHub Pages, include from
   lessons with one script tag (see lesson-stub.html).

   Because this file is hosted (not pasted into Systeme.io's
   editor), we can write normal JavaScript again — no
   angle-bracket restrictions.

   FLOW:
   1. Identity: try Systeme.io internal API (same-origin fetch,
      HttpOnly cookies auto-attached) → slug + email + firstName.
      Falls back to cached identity, then manual entry.
   2. Token: captured from a magic-link URL param (?ag_token=...)
      on first visit and stored in localStorage. Manual paste
      fallback included. One master token per student.
   3. Data: POSTs to the Gateway as text/plain (no CORS
      preflight). Renders: project picker (if multiple),
      day chips 0..7 + Scores, today-first day card, save.
   ============================================================ */
(function () {
  'use strict';

  // ============================================================
  // CONFIG — set these two, host the file, done.
  // ============================================================
  var CONFIG = {
    GATEWAY_URL: 'https://script.google.com/macros/s/AKfycbxokJhAPaX6PvvQDJPQAJZa2NFQ1F5_bwz22yZQoqPclSPCO4GPhzESsB18AidstYmQ/exec',
    APP_KEY: '2br02b_AKfycbxokJhAPaX6PvvQDJPQAJZa2NFQ1F5_bwz22yZQoqPclSPCO4GPhzESsB18AidstYmQ_otter',
    CONTAINER_ID: 'freedom-tracker',
    IDENTITY_CACHE_HOURS: 24
  };

  var LS = {
    identity: 'ag_ft_identity',   // {slug,email,firstName,fetchedAt}
    token: 'ag_ft_token'
  };

  var state = {
    identity: null,
    token: null,
    projects: [],
    activeProjectId: null,
    currentDay: 0,
    maxDay: 7,
    viewingDay: null,    // which day chip is selected
    dayData: null,
    scores: null,
    view: 'day'          // 'day' | 'scores'
  };

  // ============================================================
  // Boot
  // ============================================================
  function boot() {
    var root = document.getElementById(CONFIG.CONTAINER_ID);
    if (!root) return;
    injectStyles();
    root.innerHTML = '<div class="ft-card ft-center">Loading your Freedom Tracker\u2026</div>';

    captureMagicLinkToken();
    state.token = readLS(LS.token);

    getIdentity().then(function (identity) {
      state.identity = identity;
      if (!state.token) return renderPairing(root);
      loadState(root);
    });
  }

  // ============================================================
  // Identity (Systeme.io internal API → cache → manual)
  // ============================================================
  function getIdentity() {
    return fetchSystemeIdentity()
      .then(function (id) {
        writeLS(LS.identity, JSON.stringify({ v: id, at: Date.now() }));
        return id;
      })
      .catch(function () {
        var cached = readIdentityCache();
        return cached || { slug: '', email: '', firstName: '' };
      });
  }

  function fetchSystemeIdentity() {
    return Promise.all([
      fetch('/api/user/user-data', { credentials: 'same-origin' }).then(asJson),
      fetch('/api/settings/profile', { credentials: 'same-origin' }).then(asJson)
    ]).then(function (results) {
      var userData = results[0] || {};
      var profile = (results[1] && results[1].user) || {};
      var id = {
        slug: String(userData.slug || ''),
        email: String(profile.email || '').toLowerCase(),
        firstName: String(profile.firstName || userData.firstName || '')
      };
      if (!id.slug && !id.email) throw new Error('No identity in response');
      return id;
    });
  }

  function readIdentityCache() {
    try {
      var raw = readLS(LS.identity);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var ageHours = (Date.now() - parsed.at) / 3600000;
      if (ageHours > CONFIG.IDENTITY_CACHE_HOURS) return null;
      return parsed.v;
    } catch (e) { return null; }
  }

  function asJson(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  // ============================================================
  // Magic link token capture (?ag_token=...)
  // ============================================================
  function captureMagicLinkToken() {
    try {
      var params = new URLSearchParams(window.location.search);
      var t = params.get('ag_token');
      if (t) writeLS(LS.token, t.trim());
    } catch (e) {}
  }

  // ============================================================
  // Gateway client
  // ============================================================
  function callGateway(payload) {
    payload.appKey = CONFIG.APP_KEY;
    payload.slug = (state.identity && state.identity.slug) || '';
    payload.email = (state.identity && state.identity.email) || '';
    payload.token = state.token || '';
    return fetch(CONFIG.GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(asJson);
  }

  function loadState(root) {
    root.innerHTML = '<div class="ft-card ft-center">Loading your Freedom Tracker\u2026</div>';
    callGateway({ action: 'state', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return renderError(root, data.error);
        state.projects = data.projects || [];
        state.activeProjectId = data.activeProjectId;
        state.currentDay = data.currentDay;
        state.maxDay = data.maxDay || 7;
        state.viewingDay = (state.viewingDay == null) ? data.currentDay : state.viewingDay;
        state.dayData = data.day;
        state.view = 'day';
        render(root);
      })
      .catch(function (err) { renderError(root, String(err)); });
  }

  // ============================================================
  // Pairing screen (no token yet)
  // ============================================================
  function renderPairing(root) {
    var emailNote = state.identity && state.identity.email
      ? 'You are signed in as <strong>' + esc(state.identity.email) + '</strong>.'
      : 'Enter the email you bought with.';

    root.innerHTML =
      '<div class="ft-card">' +
        '<h3>Activate your Freedom Tracker</h3>' +
        '<p class="ft-sub">' + emailNote + ' Your tracker activates automatically from the link in your welcome email. Clicked it already on another device? Paste your activation code below.</p>' +
        (state.identity && state.identity.email ? '' :
          '<input type="email" id="ft-email" placeholder="Your email" />') +
        '<input type="text" id="ft-token" placeholder="Activation code (from your welcome email)" />' +
        '<button id="ft-activate">Activate</button>' +
        '<div class="ft-msg" id="ft-pair-msg"></div>' +
      '</div>';

    document.getElementById('ft-activate').addEventListener('click', function () {
      var manualEmail = document.getElementById('ft-email');
      if (manualEmail && manualEmail.value) {
        state.identity = state.identity || {};
        state.identity.email = manualEmail.value.trim().toLowerCase();
      }
      var t = document.getElementById('ft-token').value.trim();
      if (!t) return setMsg('ft-pair-msg', 'Enter your activation code.', false);
      state.token = t;
      setMsg('ft-pair-msg', 'Checking\u2026', true);
      callGateway({ action: 'activate' }).then(function (data) {
        if (!data.ok) return setMsg('ft-pair-msg', data.error, false);
        writeLS(LS.token, t);
        loadState(root);
      }).catch(function (err) { setMsg('ft-pair-msg', String(err), false); });
    });
  }

  // ============================================================
  // Main render
  // ============================================================
  function render(root) {
    var html = '<div class="ft-card">';

    // Greeting + project picker
    var name = (state.identity && state.identity.firstName) || '';
    html += '<div class="ft-head">';
    html += '<div><h3>' + (name ? esc(name) + '\u2019s ' : '') + 'Freedom Tracker</h3>';
    html += '<p class="ft-sub">Today is Day ' + state.currentDay + ' of your sprint.</p></div>';
    if (state.projects.length > 1) {
      html += '<select id="ft-project">';
      for (var i = 0; i < state.projects.length; i++) {
        var p = state.projects[i];
        html += '<option value="' + esc(p.projectId) + '"' +
          (p.projectId === state.activeProjectId ? ' selected' : '') + '>' +
          esc(p.name) + ' (Day ' + p.currentDay + ')</option>';
      }
      html += '</select>';
    }
    html += '</div>';

    // Day chips + Scores chip
    html += '<div class="ft-chips">';
    for (var d = 0; d <= state.maxDay; d++) {
      var cls = 'ft-chip';
      if (state.view === 'day' && d === state.viewingDay) cls += ' ft-chip-active';
      if (d === state.currentDay) cls += ' ft-chip-today';
      html += '<button class="' + cls + '" data-day="' + d + '">Day ' + d + '</button>';
    }
    html += '<button class="ft-chip' + (state.view === 'scores' ? ' ft-chip-active' : '') + '" data-day="scores">Scores</button>';
    html += '</div>';

    html += '<div id="ft-body"></div>';
    html += '</div>';
    root.innerHTML = html;

    // Wire chips
    var chips = root.querySelectorAll('.ft-chip');
    for (var c = 0; c < chips.length; c++) {
      chips[c].addEventListener('click', function () {
        var v = this.getAttribute('data-day');
        if (v === 'scores') return showScores(root);
        showDay(root, Number(v));
      });
    }

    // Wire project picker
    var picker = document.getElementById('ft-project');
    if (picker) {
      picker.addEventListener('change', function () {
        state.activeProjectId = this.value;
        state.viewingDay = null;     // recompute "today" for the new project
        loadState(root);
      });
    }

    if (state.view === 'scores') renderScores();
    else renderDay();
  }

  function showDay(root, day) {
    state.view = 'day';
    state.viewingDay = day;
    state.dayData = null;
    render(root);
    callGateway({ action: 'getDay', projectId: state.activeProjectId, day: day })
      .then(function (data) {
        if (!data.ok) return setBody('<div class="ft-msg ft-bad">' + esc(data.error) + '</div>');
        state.dayData = data.day;
        renderDay();
      })
      .catch(function (err) { setBody('<div class="ft-msg ft-bad">' + esc(String(err)) + '</div>'); });
  }

  function showScores(root) {
    state.view = 'scores';
    state.scores = null;
    render(root);
    callGateway({ action: 'scores', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return setBody('<div class="ft-msg ft-bad">' + esc(data.error) + '</div>');
        state.scores = data.scores;
        renderScores();
      })
      .catch(function (err) { setBody('<div class="ft-msg ft-bad">' + esc(String(err)) + '</div>'); });
  }

  // ============================================================
  // Day card
  // ============================================================
  function renderDay() {
    if (!state.dayData) return setBody('<div class="ft-center ft-sub">Loading Day ' + state.viewingDay + '\u2026</div>');
    var dd = state.dayData;
    var html = '<h4>' + esc(dd.title) + '</h4>';

    if (state.viewingDay < state.currentDay) {
      html += '<div class="ft-note">You\u2019re viewing a past day \u2014 you can still complete or edit it.</div>';
    } else if (state.viewingDay > state.currentDay) {
      html += '<div class="ft-note">This day hasn\u2019t arrived yet \u2014 no need to fill it in early.</div>';
    }

    for (var i = 0; i < dd.fields.length; i++) {
      var f = dd.fields[i];
      if (f.missing) {
        html += '<div class="ft-field ft-sub">\u26a0 "' + esc(f.label) + '" isn\u2019t wired up yet (named range missing).</div>';
        continue;
      }
      html += '<div class="ft-field">';
      if (f.type === 'check') {
        html += '<label class="ft-check"><input type="checkbox" data-key="' + esc(f.key) + '"' +
          (f.value ? ' checked' : '') + ' /> ' + esc(f.label) + '</label>';
      } else if (f.type === 'number') {
        html += '<label class="ft-label">' + esc(f.label) + '</label>' +
          '<input type="number" min="0" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '" />';
      } else if (f.type === 'textarea') {
        html += '<label class="ft-label">' + esc(f.label) + '</label>' +
          '<textarea rows="3" data-key="' + esc(f.key) + '">' + esc(f.value == null ? '' : f.value) + '</textarea>';
      } else {
        html += '<label class="ft-label">' + esc(f.label) + '</label>' +
          '<input type="text" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '" />';
      }
      html += '</div>';
    }

    html += '<button id="ft-save">Save Day ' + dd.day + '</button>';
    html += '<div class="ft-msg" id="ft-save-msg"></div>';
    setBody(html);

    document.getElementById('ft-save').addEventListener('click', function () {
      var fields = {};
      var inputs = document.querySelectorAll('#ft-body [data-key]');
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        fields[el.getAttribute('data-key')] = (el.type === 'checkbox') ? el.checked : el.value;
      }
      setMsg('ft-save-msg', 'Saving\u2026', true);
      callGateway({ action: 'save', projectId: state.activeProjectId, day: dd.day, fields: fields })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-save-msg', data.error, false);
          state.dayData = data.day;
          setMsg('ft-save-msg', 'Saved \u2713', true);
        })
        .catch(function (err) { setMsg('ft-save-msg', String(err), false); });
    });
  }

  // ============================================================
  // Scores view
  // ============================================================
  function renderScores() {
    if (!state.scores) return setBody('<div class="ft-center ft-sub">Loading scores\u2026</div>');
    var html = '<h4>Freedom Scores</h4>' +
      '<p class="ft-sub">0 = not at all, 10 = completely. Watch these climb across the sprint.</p>' +
      '<div class="ft-scores-grid ft-scores-head"><div></div><div>Easy</div><div>Enjoyable</div><div>Confidence</div></div>';

    for (var i = 0; i < state.scores.length; i++) {
      var row = state.scores[i];
      html += '<div class="ft-scores-grid">' +
        '<div class="ft-score-label">' + esc(row.label) + '</div>';
      var metrics = ['easy', 'enjoy', 'conf'];
      for (var m = 0; m < metrics.length; m++) {
        var v = row.values[metrics[m]];
        html += '<div><input type="number" min="0" max="10" data-cp="' + esc(row.key) + '" data-metric="' + metrics[m] + '" value="' + esc(v == null ? '' : v) + '" /></div>';
      }
      html += '</div>';
    }

    html += '<button id="ft-save-scores">Save Scores</button>';
    html += '<div class="ft-msg" id="ft-scores-msg"></div>';
    setBody(html);

    document.getElementById('ft-save-scores').addEventListener('click', function () {
      var scores = {};
      var inputs = document.querySelectorAll('#ft-body [data-cp]');
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        if (el.value === '') continue;
        var cp = el.getAttribute('data-cp');
        if (!scores[cp]) scores[cp] = {};
        scores[cp][el.getAttribute('data-metric')] = Number(el.value);
      }
      setMsg('ft-scores-msg', 'Saving\u2026', true);
      callGateway({ action: 'saveScores', projectId: state.activeProjectId, scores: scores })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-scores-msg', data.error, false);
          state.scores = data.scores;
          setMsg('ft-scores-msg', 'Saved \u2713', true);
        })
        .catch(function (err) { setMsg('ft-scores-msg', String(err), false); });
    });
  }

  // ============================================================
  // Small helpers
  // ============================================================
  function setBody(html) {
    var el = document.getElementById('ft-body');
    if (el) el.innerHTML = html;
  }

  function setMsg(id, text, ok) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'ft-msg ' + (ok ? 'ft-good' : 'ft-bad');
  }

  function renderError(root, message) {
    root.innerHTML = '<div class="ft-card"><div class="ft-msg ft-bad">' + esc(message) + '</div>' +
      '<button id="ft-retry">Try again</button></div>';
    document.getElementById('ft-retry').addEventListener('click', function () {
      state.token = readLS(LS.token);
      boot();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function readLS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function injectStyles() {
    if (document.getElementById('ft-styles')) return;
    var css =
      '#freedom-tracker{max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a2733;line-height:1.5;}' +
      '#freedom-tracker .ft-card{background:#fff;border:1px solid #d8e0e7;border-radius:12px;padding:18px;}' +
      '#freedom-tracker h3{margin:0 0 2px 0;font-size:17px;}' +
      '#freedom-tracker h4{margin:6px 0 10px 0;font-size:15px;}' +
      '#freedom-tracker .ft-sub{font-size:12.5px;color:#5b6b7a;margin:0 0 10px 0;}' +
      '#freedom-tracker .ft-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;}' +
      '#freedom-tracker select{border:1px solid #c4cfd9;border-radius:8px;padding:8px;font-size:13px;}' +
      '#freedom-tracker .ft-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 14px 0;}' +
      '#freedom-tracker .ft-chip{background:#eef3f6;color:#1a2733;border:1px solid #d8e0e7;border-radius:999px;padding:6px 12px;font-size:12.5px;cursor:pointer;width:auto;}' +
      '#freedom-tracker .ft-chip-today{border-color:#1f6f5c;font-weight:700;}' +
      '#freedom-tracker .ft-chip-active{background:#1f6f5c;color:#fff;border-color:#1f6f5c;}' +
      '#freedom-tracker .ft-field{margin-bottom:12px;}' +
      '#freedom-tracker .ft-label{display:block;font-size:13px;font-weight:600;margin-bottom:4px;}' +
      '#freedom-tracker .ft-check{display:flex;align-items:flex-start;gap:8px;font-size:14px;}' +
      '#freedom-tracker .ft-check input{margin-top:3px;}' +
      '#freedom-tracker input[type=text],#freedom-tracker input[type=email],#freedom-tracker input[type=number],#freedom-tracker textarea{width:100%;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:8px;padding:9px;font-size:14px;}' +
      '#freedom-tracker textarea{resize:vertical;}' +
      '#freedom-tracker button{background:#1f6f5c;color:#fff;border:none;border-radius:8px;padding:11px 16px;font-size:14px;font-weight:600;cursor:pointer;width:100%;margin-top:4px;}' +
      '#freedom-tracker button:active{opacity:.85;}' +
      '#freedom-tracker .ft-msg{font-size:13px;margin-top:8px;min-height:18px;}' +
      '#freedom-tracker .ft-good{color:#1f6f5c;}' +
      '#freedom-tracker .ft-bad{color:#b3392f;}' +
      '#freedom-tracker .ft-note{background:#fdf6e3;border:1px solid #ead9a6;border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:12px;}' +
      '#freedom-tracker .ft-center{text-align:center;color:#5b6b7a;font-size:13.5px;}' +
      '#freedom-tracker .ft-scores-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:6px;align-items:center;margin-bottom:6px;}' +
      '#freedom-tracker .ft-scores-head{font-size:11.5px;font-weight:700;color:#5b6b7a;}' +
      '#freedom-tracker .ft-score-label{font-size:12px;}';
    var style = document.createElement('style');
    style.id = 'ft-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Go.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
