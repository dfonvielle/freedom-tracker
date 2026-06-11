/* ============================================================
   FREEDOM TRACKER LOADER v3 — host on GitHub Pages.

   PER-LESSON VIEW CONFIG (the big v3 feature): the stub's div
   chooses what this lesson shows via data-view:

     <div id="freedom-tracker" data-view="full"></div>
     <script src="https://USER.github.io/freedom-tracker/loader.v3.js"></script>

   Views:
     full      Full navigator: Goal & Plan + Day 0-7 + Scores
               chips, defaults to today. (Lesson 1 / hub.)
     day:N     One day's card only (e.g. data-view="day:0").
               Focused lessons.
     today     Current day's card only, with catch-up nudges.
               (The "Daily Check-In" lesson for days 2-7.)
     progress  Score trajectory + scores grid + completion
               overview. ("My Progress" lesson.)
     goalplan  Goal & Plan card only.
   Default if no data-view: full.

   SETUP WIZARD: until the student finishes setup (stage 3 in
   the Registry), EVERY view shows the wizard instead:
     1. Name your unwanted behavior  ->  2. Baseline Freedom
     Scores  ->  3. Goal & Plan + "Unlock my full tracker".
   Then it drops them on today's card and never appears again.

   Everything from v2 is retained: iframe-aware magic link
   (?ag_token=...), ?ag_reset=1 + AG_FT_RESET() testing helpers,
   stale-token auto-recovery on shared computers, text/plain
   POSTs, manual activation fallback.
   ============================================================ */
(function () {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  var CONFIG = {
    GATEWAY_URL: 'https://script.google.com/macros/s/AKfycbxokJhAPaX6PvvQDJPQAJZa2NFQ1F5_bwz22yZQoqPclSPCO4GPhzESsB18AidstYmQ/exec',
    APP_KEY: '2br02b_AKfycbxokJhAPaX6PvvQDJPQAJZa2NFQ1F5_bwz22yZQoqPclSPCO4GPhzESsB18AidstYmQ_otter',
    CONTAINER_ID: 'freedom-tracker',
    IDENTITY_CACHE_HOURS: 24
  };

  var LS = { identity: 'ag_ft_identity', token: 'ag_ft_token' };

  var state = {
    identity: null,
    token: null,
    view: 'full',        // from data-view
    fixedDay: null,      // for day:N views
    projects: [],
    activeProjectId: null,
    currentDay: 0,
    maxDay: 7,
    setup: { stage: 0, ub: '' },
    plan: '',
    completion: null,
    viewingDay: null,
    dayData: null,
    scores: null,
    tab: 'day'           // navigator tab: 'goalplan' | 'day' | 'scores'
  };

  var rootEl = null;

  // ============================================================
  // URL params — iframe-aware (self, parent, referrer)
  // ============================================================
  function candidateUrls() {
    var urls = [];
    try { urls.push(window.location.href); } catch (e) {}
    try { if (window.parent && window.parent !== window) urls.push(window.parent.location.href); } catch (e) {}
    try { if (document.referrer) urls.push(document.referrer); } catch (e) {}
    return urls;
  }

  function readParam(name) {
    var urls = candidateUrls();
    for (var i = 0; i < urls.length; i++) {
      try {
        var v = new URL(urls[i]).searchParams.get(name);
        if (v) return v.trim();
      } catch (e) {}
    }
    return null;
  }

  function captureMagicLinkToken() {
    var t = readParam('ag_token');
    if (t) writeLS(LS.token, t);
  }

  function handleResetParam() { if (readParam('ag_reset')) resetStorage(); }

  function resetStorage() {
    try { localStorage.removeItem(LS.token); } catch (e) {}
    try { localStorage.removeItem(LS.identity); } catch (e) {}
  }

  try {
    window.AG_FT_RESET = function () {
      resetStorage();
      console.log('Freedom Tracker storage cleared. Reload the page.');
    };
  } catch (e) {}

  // ============================================================
  // Boot
  // ============================================================
  function boot() {
    rootEl = document.getElementById(CONFIG.CONTAINER_ID);
    if (!rootEl) return;
    injectStyles();

    var dv = (rootEl.getAttribute('data-view') || 'full').trim().toLowerCase();
    if (dv.indexOf('day:') === 0) {
      state.view = 'day';
      state.fixedDay = Number(dv.split(':')[1]);
      if (isNaN(state.fixedDay)) { state.view = 'full'; state.fixedDay = null; }
    } else if (dv === 'today' || dv === 'progress' || dv === 'goalplan' || dv === 'full' || dv === 'setup') {
      state.view = (dv === 'setup') ? 'full' : dv;
    } else {
      state.view = 'full';
    }

    rootEl.innerHTML = '<div class="ft-card ft-center">Loading your Freedom Tracker\u2026</div>';

    handleResetParam();
    captureMagicLinkToken();
    state.token = readLS(LS.token);

    getIdentity().then(function (identity) {
      state.identity = identity;
      if (!state.token) return renderPairing('');
      loadState();
    });
  }

  // ============================================================
  // Identity (fresh fetch first; cache fallback)
  // ============================================================
  function getIdentity() {
    return fetchSystemeIdentity()
      .then(function (id) {
        writeLS(LS.identity, JSON.stringify({ v: id, at: Date.now() }));
        return id;
      })
      .catch(function () {
        return readIdentityCache() || { slug: '', email: '', firstName: '' };
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
      if ((Date.now() - parsed.at) / 3600000 > CONFIG.IDENTITY_CACHE_HOURS) return null;
      return parsed.v;
    } catch (e) { return null; }
  }

  function asJson(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
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

  function loadState() {
    rootEl.innerHTML = '<div class="ft-card ft-center">Loading your Freedom Tracker\u2026</div>';
    callGateway({ action: 'state', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) {
          resetTokenOnly();
          return renderPairing(
            'This device had a previous activation that doesn\u2019t match your account. ' +
            'Click the activation link from YOUR welcome email, or enter your code below.');
        }
        state.projects = data.projects || [];
        state.activeProjectId = data.activeProjectId;
        state.currentDay = data.currentDay;
        state.maxDay = data.maxDay || 7;
        state.setup = data.setup || { stage: 0, ub: '' };
        state.plan = data.plan || '';
        state.completion = data.completion || null;
        state.dayData = data.day || null;
        if (state.viewingDay == null) state.viewingDay = state.currentDay;
        route();
      })
      .catch(function (err) { renderFatal(String(err)); });
  }

  function resetTokenOnly() {
    state.token = null;
    try { localStorage.removeItem(LS.token); } catch (e) {}
  }

  // ============================================================
  // Routing — wizard first, then the configured view
  // ============================================================
  function route() {
    if (state.setup.stage < 3) return renderWizard();
    if (state.view === 'day') return renderFixedDayView(state.fixedDay);
    if (state.view === 'today') return renderTodayView();
    if (state.view === 'progress') return renderProgressView();
    if (state.view === 'goalplan') return renderShell(goalPlanHtml(), null);
    return renderNavigator();   // 'full'
  }

  // ============================================================
  // Setup wizard (stages 0 -> 1 -> 2 -> 3)
  // ============================================================
  function renderWizard() {
    var stage = state.setup.stage;
    if (stage === 0) return wizardStepUb();
    if (stage === 1) return wizardStepBaseline();
    return wizardStepGoalPlan();
  }

  function wizardDots(step) {
    var html = '<div class="ft-dots">';
    for (var i = 1; i <= 3; i++) {
      html += '<span class="ft-dot' + (i <= step ? ' ft-dot-on' : '') + '"></span>';
    }
    return html + '<span class="ft-dots-label">Step ' + step + ' of 3</span></div>';
  }

  function wizardStepUb() {
    var name = (state.identity && state.identity.firstName) || '';
    rootEl.innerHTML =
      '<div class="ft-card">' +
        wizardDots(1) +
        '<h3>' + (name ? 'Welcome, ' + esc(name) + '!' : 'Welcome!') + ' Let\u2019s set up your sprint.</h3>' +
        '<p class="ft-sub">For this one-week sprint, I want to break more free from the following unwanted behavior (UB):</p>' +
        '<input type="text" id="ft-ub" placeholder=\'Your behavior \u2014 or just write "my UB" to keep it private\' value="' + esc(state.setup.ub) + '" />' +
        '<button id="ft-next">Continue \u2192</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';

    document.getElementById('ft-next').addEventListener('click', function () {
      var ub = document.getElementById('ft-ub').value.trim();
      if (!ub) return setMsg('ft-wiz-msg', 'Name the behavior \u2014 "my UB" is fine if you\u2019d rather keep it private.', false);
      setMsg('ft-wiz-msg', 'Saving\u2026', true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'ub', ub: ub })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = data.stage;
          state.setup.ub = data.ub;
          renderWizard();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }

  function wizardStepBaseline() {
    rootEl.innerHTML =
      '<div class="ft-card">' +
        wizardDots(2) +
        '<h3>Your baseline \u2014 before any rewiring</h3>' +
        '<p class="ft-sub">In 7 days you\u2019ll look back at these numbers as your proof of change. Be honest \u2014 low scores now make the climb more satisfying. 0 = not at all, 10 = completely.</p>' +
        scoreInputHtml('easy', 'How easy / no big deal is it right now to NOT do your UB?') +
        scoreInputHtml('enjoy', 'How enjoyable is it right now to not do it / be free from it?') +
        scoreInputHtml('conf', 'How confident are you that you can rewire your brain for greater freedom?') +
        '<button id="ft-next">Save my baseline \u2192</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';

    document.getElementById('ft-next').addEventListener('click', function () {
      var scores = {};
      var keys = ['easy', 'enjoy', 'conf'];
      for (var i = 0; i < keys.length; i++) {
        var v = document.getElementById('ft-sc-' + keys[i]).value;
        if (v === '') return setMsg('ft-wiz-msg', 'Please enter all three scores (0-10).', false);
        scores[keys[i]] = Number(v);
      }
      setMsg('ft-wiz-msg', 'Saving\u2026', true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'baseline', scores: scores })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = data.stage;
          renderWizard();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }

  function scoreInputHtml(key, label) {
    return '<div class="ft-field"><label class="ft-label">' + esc(label) + '</label>' +
      '<input type="number" min="0" max="10" id="ft-sc-' + key + '" placeholder="0-10" /></div>';
  }

  function wizardStepGoalPlan() {
    rootEl.innerHTML =
      '<div class="ft-card">' +
        wizardDots(3) +
        goalPlanInnerHtml() +
        '<button id="ft-unlock">Unlock my full tracker \u2192</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';

    document.getElementById('ft-unlock').addEventListener('click', function () {
      setMsg('ft-wiz-msg', 'Unlocking\u2026', true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'complete' })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = 3;
          state.currentDay = data.currentDay;
          state.viewingDay = data.currentDay;
          state.dayData = data.day;
          state.completion = data.completion;
          route();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }

  // ============================================================
  // Goal & Plan content (wizard step 3 + chip + goalplan view)
  // ============================================================
  function goalPlanInnerHtml() {
    var ub = state.setup.ub || 'your unwanted behavior';
    return '<h3>Your Goal &amp; Plan</h3>' +
      '<div class="ft-goal">YOUR GOAL: greater freedom from <strong>' + esc(ub) + '</strong> \u2014 proven to yourself in 7 days.</div>' +
      '<div class="ft-plan">' + esc(state.plan) + '</div>';
  }

  function goalPlanHtml() {
    return goalPlanInnerHtml();
  }

  // ============================================================
  // Views
  // ============================================================

  // Shared shell: header (+ project picker) and a content area.
  function renderShell(contentHtml, chipsHtml) {
    var name = (state.identity && state.identity.firstName) || '';
    var html = '<div class="ft-card">';
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
    if (chipsHtml) html += chipsHtml;
    html += '<div id="ft-body">' + (contentHtml || '') + '</div>';
    html += '</div>';
    rootEl.innerHTML = html;

    var picker = document.getElementById('ft-project');
    if (picker) {
      picker.addEventListener('change', function () {
        state.activeProjectId = this.value;
        state.viewingDay = null;
        state.dayData = null;
        loadState();
      });
    }
  }

  // ---------- FULL navigator ----------
  function renderNavigator() {
    renderShell('', chipsHtml());
    wireChips();
    if (state.tab === 'goalplan') setBody(goalPlanHtml());
    else if (state.tab === 'scores') { setBody(''); loadScoresInto(); }
    else loadDayInto(state.viewingDay);
  }

  function chipsHtml() {
    var html = '<div class="ft-chips">';
    html += chip('goalplan', 'Goal & Plan', state.tab === 'goalplan', false, false);
    for (var d = 0; d <= state.maxDay; d++) {
      var done = state.completion && state.completion[d];
      var isPastIncomplete = !done && d < state.currentDay;
      var active = state.tab === 'day' && d === state.viewingDay;
      var label = 'Day ' + d + (done ? ' \u2713' : '');
      html += chip('day-' + d, label, active, d === state.currentDay, isPastIncomplete);
    }
    html += chip('scores', 'Scores', state.tab === 'scores', false, false);
    return html + '</div>';
  }

  function chip(id, label, active, today, attention) {
    var cls = 'ft-chip';
    if (active) cls += ' ft-chip-active';
    if (today) cls += ' ft-chip-today';
    if (attention) cls += ' ft-chip-dot';
    return '<button class="' + cls + '" data-chip="' + id + '">' + esc(label) + '</button>';
  }

  function wireChips() {
    var chips = rootEl.querySelectorAll('[data-chip]');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        var id = this.getAttribute('data-chip');
        if (id === 'goalplan') { state.tab = 'goalplan'; return renderNavigator(); }
        if (id === 'scores') { state.tab = 'scores'; return renderNavigator(); }
        state.tab = 'day';
        state.viewingDay = Number(id.split('-')[1]);
        state.dayData = null;
        renderNavigator();
      });
    }
  }

  // ---------- day:N (focused lesson) ----------
  function renderFixedDayView(day) {
    renderShell('', null);
    loadDayInto(day, { fixed: true });
  }

  // ---------- today (Daily Check-In lesson) ----------
  function renderTodayView() {
    state.viewingDay = (state.viewingDay == null) ? state.currentDay : state.viewingDay;
    renderShell('', null);
    loadDayInto(state.viewingDay, { showCatchUp: true });
  }

  // ---------- progress ----------
  function renderProgressView() {
    renderShell('<div class="ft-center ft-sub">Loading your progress\u2026</div>', null);
    callGateway({ action: 'scores', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return setBody(badMsg(data.error));
        state.scores = data.scores;
        setBody(progressHtml());
        wireScoresSave();
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }

  function progressHtml() {
    var html = '<h4>Your Freedom Journey</h4>';

    // Trajectories
    var metrics = [['easy', 'Easy'], ['enjoy', 'Enjoyable'], ['conf', 'Confidence']];
    html += '<div class="ft-traj-box">';
    for (var m = 0; m < metrics.length; m++) {
      var seq = [];
      for (var i = 0; i < state.scores.length; i++) {
        var v = state.scores[i].values[metrics[m][0]];
        if (v != null) seq.push(v);
      }
      html += '<div class="ft-traj"><span class="ft-traj-label">' + metrics[m][1] + ':</span> ' +
        (seq.length ? esc(seq.join(' \u2192 ')) : '<span class="ft-sub">no entries yet</span>') + '</div>';
    }
    html += '</div>';

    // Completion overview
    if (state.completion) {
      html += '<h4>Days completed</h4><div class="ft-chips">';
      for (var d = 0; d <= state.maxDay; d++) {
        var done = state.completion[d];
        html += '<span class="ft-chip ft-chip-static' + (done ? ' ft-chip-done' : '') + '">Day ' + d + (done ? ' \u2713' : '') + '</span>';
      }
      html += '</div>';
    }

    // Full scores grid (corrections welcome)
    html += '<h4 style="margin-top:14px;">All Freedom Scores</h4>' + scoresGridHtml();
    return html;
  }

  // ---------- scores grid (navigator tab + progress view) ----------
  function loadScoresInto() {
    setBody('<div class="ft-center ft-sub">Loading scores\u2026</div>');
    callGateway({ action: 'scores', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return setBody(badMsg(data.error));
        state.scores = data.scores;
        setBody('<h4>Freedom Scores</h4><p class="ft-sub">Your daily scores save automatically from each day\u2019s card \u2014 this view is your overview (and where to fix typos).</p>' + scoresGridHtml());
        wireScoresSave();
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }

  function scoresGridHtml() {
    var html = '<div class="ft-scores-grid ft-scores-head"><div></div><div>Easy</div><div>Enjoyable</div><div>Confidence</div></div>';
    for (var i = 0; i < state.scores.length; i++) {
      var row = state.scores[i];
      html += '<div class="ft-scores-grid"><div class="ft-score-label">' + esc(row.label) + '</div>';
      var metrics = ['easy', 'enjoy', 'conf'];
      for (var m = 0; m < metrics.length; m++) {
        var v = row.values[metrics[m]];
        html += '<div><input type="number" min="0" max="10" data-cp="' + esc(row.key) + '" data-metric="' + metrics[m] + '" value="' + esc(v == null ? '' : v) + '" /></div>';
      }
      html += '</div>';
    }
    html += '<button id="ft-save-scores">Save Scores</button><div class="ft-msg" id="ft-scores-msg"></div>';
    return html;
  }

  function wireScoresSave() {
    var btn = document.getElementById('ft-save-scores');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var scores = {};
      var inputs = rootEl.querySelectorAll('[data-cp]');
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
  // Day card
  // ============================================================
  function loadDayInto(day, opts) {
    opts = opts || {};
    if (state.dayData && state.dayData.day === day) return renderDayCard(state.dayData, opts);
    setBody('<div class="ft-center ft-sub">Loading Day ' + day + '\u2026</div>');
    callGateway({ action: 'getDay', projectId: state.activeProjectId, day: day })
      .then(function (data) {
        if (!data.ok) return setBody(badMsg(data.error));
        state.dayData = data.day;
        renderDayCard(data.day, opts);
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }

  function firstIncompletePastDay() {
    if (!state.completion) return null;
    for (var d = 0; d < state.currentDay; d++) {
      if (!state.completion[d]) return d;
    }
    return null;
  }

  function renderDayCard(dd, opts) {
    var html = '<h4>' + esc(dd.title) + '</h4>';

    // Catch-up nudge (guidance, never a gate)
    if (opts.showCatchUp) {
      var missed = firstIncompletePastDay();
      if (missed != null && missed !== dd.day) {
        var msg = (missed === 1)
          ? 'Your Day 1 Power Hour is still waiting \u2014 it\u2019s the engine of this whole sprint.'
          : 'Day ' + missed + ' isn\u2019t finished yet \u2014 it only takes a few minutes.';
        html += '<div class="ft-note">' + esc(msg) +
          ' <button class="ft-linkbtn" id="ft-catchup" data-day="' + missed + '">Catch up on Day ' + missed + ' \u2192</button></div>';
      }
    }

    if (dd.day < state.currentDay) {
      html += '<div class="ft-note">You\u2019re viewing a past day \u2014 you can still complete or edit it.</div>';
    } else if (dd.day > state.currentDay) {
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
        html += '<label class="ft-check"><input type="checkbox" data-key="' + esc(f.key) + '"' + (f.value ? ' checked' : '') + ' /> ' + esc(f.label) + '</label>';
      } else if (f.type === 'number') {
        html += '<label class="ft-label">' + esc(f.label) + '</label><input type="number" min="0" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '" />';
      } else if (f.type === 'textarea') {
        html += '<label class="ft-label">' + esc(f.label) + '</label><textarea rows="3" data-key="' + esc(f.key) + '">' + esc(f.value == null ? '' : f.value) + '</textarea>';
      } else {
        html += '<label class="ft-label">' + esc(f.label) + '</label><input type="text" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '" />';
      }
      html += '</div>';
    }

    // Folded scores section
    if (dd.scores) {
      html += '<div class="ft-dayscores"><div class="ft-label" style="margin-bottom:8px;">' + esc(dd.scores.label) + ' <span class="ft-sub" style="display:inline;">(0-10)</span></div>';
      var mks = ['easy', 'enjoy', 'conf'];
      for (var m = 0; m < mks.length; m++) {
        var v = dd.scores.values[mks[m]];
        html += '<div class="ft-field"><label class="ft-label">' + esc(dd.scores.metricLabels[mks[m]]) + '</label>' +
          '<input type="number" min="0" max="10" data-dayscore="' + mks[m] + '" value="' + esc(v == null ? '' : v) + '" /></div>';
      }
      html += '</div>';
    }

    html += '<button id="ft-save">Save Day ' + dd.day + '</button><div class="ft-msg" id="ft-save-msg"></div>';
    setBody(html);

    var catchup = document.getElementById('ft-catchup');
    if (catchup) {
      catchup.addEventListener('click', function () {
        state.viewingDay = Number(this.getAttribute('data-day'));
        state.dayData = null;
        if (state.view === 'today') renderTodayView();
        else renderNavigator();
      });
    }

    document.getElementById('ft-save').addEventListener('click', function () {
      var fields = {};
      var inputs = rootEl.querySelectorAll('#ft-body [data-key]');
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        fields[el.getAttribute('data-key')] = (el.type === 'checkbox') ? el.checked : el.value;
      }
      var dayScores = null;
      var scoreInputs = rootEl.querySelectorAll('#ft-body [data-dayscore]');
      for (var s = 0; s < scoreInputs.length; s++) {
        if (scoreInputs[s].value === '') continue;
        if (!dayScores) dayScores = {};
        dayScores[scoreInputs[s].getAttribute('data-dayscore')] = Number(scoreInputs[s].value);
      }
      setMsg('ft-save-msg', 'Saving\u2026', true);
      callGateway({ action: 'save', projectId: state.activeProjectId, day: dd.day, fields: fields, dayScores: dayScores })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-save-msg', data.error, false);
          state.dayData = data.day;
          state.completion = data.completion || state.completion;
          setMsg('ft-save-msg', 'Saved \u2713', true);
          // Refresh chips so a freshly earned checkmark shows up.
          if (state.view === 'full') {
            var chipsEl = rootEl.querySelector('.ft-chips');
            if (chipsEl) {
              chipsEl.outerHTML = chipsHtml();
              wireChips();
            }
          }
        })
        .catch(function (err) { setMsg('ft-save-msg', String(err), false); });
    });
  }

  // ============================================================
  // Pairing / Activate screen
  // ============================================================
  function renderPairing(notice) {
    var emailNote = state.identity && state.identity.email
      ? 'You are signed in as <strong>' + esc(state.identity.email) + '</strong>.'
      : 'Enter the email you bought with.';

    rootEl.innerHTML =
      '<div class="ft-card">' +
        '<h3>Activate your Freedom Tracker</h3>' +
        (notice ? '<div class="ft-note">' + esc(notice) + '</div>' : '') +
        '<p class="ft-sub">' + emailNote + ' Your tracker activates automatically from the link in your welcome email. Clicked it already on another device? Paste your activation code below.</p>' +
        (state.identity && state.identity.email ? '' : '<input type="email" id="ft-email" placeholder="Your email" />') +
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
        loadState();
      }).catch(function (err) { setMsg('ft-pair-msg', String(err), false); });
    });
  }

  // ============================================================
  // Small helpers
  // ============================================================
  function setBody(html) {
    var el = document.getElementById('ft-body');
    if (el) el.innerHTML = html;
  }

  function badMsg(text) { return '<div class="ft-msg ft-bad">' + esc(text) + '</div>'; }

  function setMsg(id, text, ok) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'ft-msg ' + (ok ? 'ft-good' : 'ft-bad');
  }

  function renderFatal(message) {
    rootEl.innerHTML = '<div class="ft-card">' + badMsg(message) +
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
      '#freedom-tracker h3{margin:0 0 6px 0;font-size:17px;}' +
      '#freedom-tracker h4{margin:6px 0 10px 0;font-size:15px;}' +
      '#freedom-tracker .ft-sub{font-size:12.5px;color:#5b6b7a;margin:0 0 10px 0;}' +
      '#freedom-tracker .ft-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;}' +
      '#freedom-tracker select{border:1px solid #c4cfd9;border-radius:8px;padding:8px;font-size:13px;}' +
      '#freedom-tracker .ft-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 14px 0;}' +
      '#freedom-tracker .ft-chip{background:#eef3f6;color:#1a2733;border:1px solid #d8e0e7;border-radius:999px;padding:6px 12px;font-size:12.5px;cursor:pointer;width:auto;position:relative;}' +
      '#freedom-tracker .ft-chip-today{border-color:#1f6f5c;font-weight:700;}' +
      '#freedom-tracker .ft-chip-active{background:#1f6f5c;color:#fff;border-color:#1f6f5c;}' +
      '#freedom-tracker .ft-chip-dot::after{content:"";position:absolute;top:2px;right:2px;width:7px;height:7px;border-radius:50%;background:#d99a2b;}' +
      '#freedom-tracker .ft-chip-static{cursor:default;}' +
      '#freedom-tracker .ft-chip-done{border-color:#1f6f5c;color:#1f6f5c;font-weight:600;}' +
      '#freedom-tracker .ft-field{margin-bottom:12px;}' +
      '#freedom-tracker .ft-label{display:block;font-size:13px;font-weight:600;margin-bottom:4px;}' +
      '#freedom-tracker .ft-check{display:flex;align-items:flex-start;gap:8px;font-size:14px;}' +
      '#freedom-tracker .ft-check input{margin-top:3px;}' +
      '#freedom-tracker input[type=text],#freedom-tracker input[type=email],#freedom-tracker input[type=number],#freedom-tracker textarea{width:100%;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:8px;padding:9px;font-size:14px;}' +
      '#freedom-tracker textarea{resize:vertical;}' +
      '#freedom-tracker button{background:#1f6f5c;color:#fff;border:none;border-radius:8px;padding:11px 16px;font-size:14px;font-weight:600;cursor:pointer;width:100%;margin-top:4px;}' +
      '#freedom-tracker button:active{opacity:.85;}' +
      '#freedom-tracker .ft-linkbtn{background:none;border:none;color:#1f6f5c;text-decoration:underline;font-size:12.5px;font-weight:700;cursor:pointer;width:auto;padding:0;margin:0;display:inline;}' +
      '#freedom-tracker .ft-msg{font-size:13px;margin-top:8px;min-height:18px;}' +
      '#freedom-tracker .ft-good{color:#1f6f5c;}' +
      '#freedom-tracker .ft-bad{color:#b3392f;}' +
      '#freedom-tracker .ft-note{background:#fdf6e3;border:1px solid #ead9a6;border-radius:8px;padding:8px 10px;font-size:12.5px;margin-bottom:12px;}' +
      '#freedom-tracker .ft-center{text-align:center;color:#5b6b7a;font-size:13.5px;}' +
      '#freedom-tracker .ft-scores-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:6px;align-items:center;margin-bottom:6px;}' +
      '#freedom-tracker .ft-scores-head{font-size:11.5px;font-weight:700;color:#5b6b7a;}' +
      '#freedom-tracker .ft-score-label{font-size:12px;}' +
      '#freedom-tracker .ft-dots{display:flex;align-items:center;gap:5px;margin-bottom:12px;}' +
      '#freedom-tracker .ft-dot{width:9px;height:9px;border-radius:50%;background:#d8e0e7;}' +
      '#freedom-tracker .ft-dot-on{background:#1f6f5c;}' +
      '#freedom-tracker .ft-dots-label{font-size:11.5px;color:#5b6b7a;margin-left:4px;}' +
      '#freedom-tracker .ft-goal{background:#eef6f3;border:1px solid #bcd9cf;border-radius:8px;padding:10px 12px;font-size:14px;margin-bottom:12px;}' +
      '#freedom-tracker .ft-plan{white-space:pre-wrap;font-size:13.5px;margin-bottom:14px;}' +
      '#freedom-tracker .ft-dayscores{background:#f4f7f9;border-radius:10px;padding:12px;margin:4px 0 12px 0;}' +
      '#freedom-tracker .ft-traj-box{background:#eef6f3;border:1px solid #bcd9cf;border-radius:10px;padding:12px;margin-bottom:14px;}' +
      '#freedom-tracker .ft-traj{font-size:14px;margin-bottom:4px;}' +
      '#freedom-tracker .ft-traj-label{font-weight:700;}';
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
