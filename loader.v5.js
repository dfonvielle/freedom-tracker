/* ============================================================
   FREEDOM TRACKER LOADER v5 — host on GitHub Pages as
   loader.v5.js (new filename; update lesson stubs).
   Stub (per lesson):
     <div id="freedom-tracker" data-view="full"></div>
     <script src="https://USER.github.io/freedom-tracker/loader.v5.js"><\/script>

   Views (data-view):
     full               navigator with chips; Days 1-7 show
                        guidance + check-in together
     day1-full          Day 1 guidance + Day 1 check-in
     day1-guidance      Day 1 guidance only
     day1-checkin       Day 1 check-in only
     days2to7-full      daily guidance + today's check-in
                        (clamped to Days 2-7; catch-up nav)
     days2to7-guidance  daily guidance only
     days2to7-checkin   today's check-in only (clamped 2-7)
     today              guidance + check-in for the current day
     day:N              check-in only for day N
     progress | goalplan | evaluate    (default: full)
   Legacy aliases still work: day1guide -> day1-guidance,
   dailyguide -> days2to7-guidance, setup -> full.
   The 4-step setup wizard intercepts every view until done.

   v5 (design pass; pair with Gateway v5):
   - COPY below: ALL loader-side student-facing text, now
     including the "How This Works" plan (PLAN_TITLE/PLAN_PARAS,
     <strong>/<em> allowed) and the Day 0 education (COPY.DAY0).
     The Gateway no longer sends 'plan'.
   - Spacing pass: 18px fields, 14px button gap, 22px below
     chips, ft-title-gap, dashed dividers, grouped sections.
   - Wizard copy updates; Goal & Plan green boxes reworded.
   - DAY 0: education sections + dashed "Complete Day 0" box
     with ONE checkbox (d0_all; Gateway maps it to all five
     ranges) + Power Hour input + dynamic button label.
   - DAY 1: guidance with tool notes + withdrawal line (incl.
     medical-supervision note); check-in with grounding box,
     divider, tools header, centered scores header.
   - DAYS 2-7: guidance title + 4 bullets; check-in grouped
     under centered "Key Efforts" / "Reflection" headers;
     centered "Day N Freedom Scores".
   - EVALUATE: no Day 7 average shown; tier text rendered as
     paragraphs (Gateway sends arrays); sendoff removed.
   - State cache key bumped (ag_ft_cache_v5) so v4 caches are
     ignored after the switch.
   - All v2-v4 behaviors retained: iframe-aware magic link
     (?ag_token=...), ?ag_reset=1 + AG_FT_RESET(), stale-token
     recovery, text/plain POSTs, manual activation fallback,
     cache-then-refresh + optimistic saves.
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
    IDENTITY_CACHE_HOURS: 24,
    STATE_CACHE_HOURS: 48
  };
  /**
   * ============================================================
   * COPY — EDIT ALL LOADER-SIDE STUDENT-FACING TEXT HERE.
   * {UB} is replaced with the student's unwanted behavior.
   * PLAN_PARAS and D1G_WITHDRAWAL allow <strong>/<em> HTML.
   * ============================================================
   */
  var COPY = {
    LOADING: 'Loading your Freedom Tracker\u2026',
    HEADER_TODAY: 'Today is Day {DAY} of your sprint.',
    WIZ1_TITLE: 'Welcome{NAME}! Let\u2019s set up your sprint.',
    WIZ1_LABEL: 'For this one-week sprint, I want to make it easier and more enjoyable to be free from the following Unwanted Behavior (UB):',
    WIZ1_PLACEHOLDER: 'Your behavior \u2014 or just write "my UB" to keep it private',
    WIZ1_BUTTON: 'Continue \u2192',
    WIZ1_ERROR: 'Name the behavior \u2014 "my UB" is fine if you\u2019d rather keep it private.',
    WIZ2_TITLE: 'Your baseline Freedom Scores before any rewiring',
    WIZ2_SUB: 'In 7 days, you\u2019ll look back at these numbers to see proof of change. There are no bad scores (all zeros are fine)! Low initial scores only make the improvement more satisfying.',
    WIZ2_BUTTON: 'Save my baseline \u2192',
    SCORE_ERROR: 'Scores must be whole numbers from 0 to 10.',
    WIZ3_TITLE: 'Pick your daily rewiring moment',
    WIZ3_SUB: 'Each morning of the sprint you\u2019ll do 30 seconds to 2 minutes of rewiring (the Happiness & Success Jumpstart). Anchor this rewiring moment to something you already do every morning. For example: while brushing your teeth, while the coffee brews, in the shower, while getting dressed.',
    WIZ3_LABEL: 'I\u2019ll do my morning rewiring (the H&S Jumpstart) at this time and place:',
    WIZ3_PLACEHOLDER: 'e.g. 7am, while my coffee brews',
    WIZ3_BUTTON: 'Continue \u2192',
    WIZ3_ERROR: 'Pick a real time and place \u2014 e.g. "7am, while my coffee brews".',
    WIZ4_BUTTON: 'Start My Sprint \u2192',
    GOAL_TITLE: 'Your Goal & Plan',
    GOAL_LABEL: 'I want to make it easier and more enjoyable to be free from:',
    GOAL_JS_LABEL: 'Every morning, I\u2019ll do 30 seconds\u20132 minutes of rewiring (the Happiness & Success Jumpstart) at this moment:',
    GOAL_BUTTON: 'Update',
    GOAL_SAVED: 'Updated \u2713',
    GOAL_PREFIX: 'I want to make it easier and more enjoyable to be free from: ',
    GOAL_SUFFIX: '',
    GOAL_JS_PREFIX: 'Every morning, I\u2019ll do 30 seconds\u20132 minutes of rewiring (the Happiness & Success Jumpstart) at this moment: ',
    PLAN_TITLE: 'How This Works',
    PLAN_PARAS: [   // <strong>/<em> allowed (rendered as HTML)
      'There is no quit date in this sprint. You can keep doing your behavior while you rewire your brain.',
      'Day 1 takes about an hour. Days 2 through 7 take just 7 to 22 minutes each.',
      '<strong>The goal is simple:</strong> prove to yourself that you are powerful and capable, and that you can rewire your brain for freedom from an unwanted behavior.',
      'We only care whether you are <strong>more free</strong> from your behavior after 7 days (proof of capabilities), not completely free.',
      'Progress is measured by Freedom Scores recorded during your daily check-ins.',
      '<em>You\u2019re guided through all of this step by step.</em>'
    ],
    DAY0: {
      INTRO2: 'To do this, understand how you\u2019ll create this change, and then look forward to doing it.',
      SECTIONS: [
        { h: 'Step 1: Understand the Problem', paras: [
          'Your brain is currently wired for a behavior, which is why you find it challenging to not do it.'
        ] },
        { h: 'Step 2: Understand the Solution', paras: [
          'Rewire your brain to find it easier and more enjoyable to not do the behavior.'
        ] },
        { h: 'Step 3: Understand the SYBR Method', paras: [
          'SYBR = Systematic Brain Rewiring.',
          'Your brain is a prediction machine. We create Prediction Errors every day, forcing your brain to rewire itself to make better future predictions.',
          'We do this by using positive emotion in unexpected ways with targeted brain rewiring.',
          'The AI Tools (starting on Day 1) will guide you through creating these Prediction Errors.'
        ] },
        { h: 'Step 4: Understand the Role of Positive Emotion', paras: [
          'Positive emotion rewires your brain fast. (Just think of a time you kissed someone, "sparks flew", and your thoughts and behavior quickly changed.)',
          'For the SYBR Method, you\u2019ll often be guided through steps to feel better, calmer, and happier (like with the Calm Happy Focus Technique).',
          'If you struggle with feeling positive emotion, no worries. Simply feeling calmer and more relaxed is already enough to create Prediction Errors.',
          'The key is to at least allow yourself to feel positive emotion (like happiness and excitement) to open the door for these emotions and larger Prediction Errors.'
        ] },
        { h: 'Step 5: Look Forward to Rewiring for Freedom', paras: [
          'Look forward to rewiring your brain for freedom from your unwanted behavior starting tomorrow on Day 1.',
          'Let yourself feel as happy and excited about this as possible to already create a Prediction Error (gaining freedom might be fun and exciting, rather than hard and stressful).',
          'Whether you actually feel happy or excited, at least allow yourself to feel this way, and be open to this sprint being a powerful, exciting experience.'
        ] }
      ],
      COMPLETE_HEADER: 'Complete Day 0',
      PREP_HEADER: 'Prepare for Tomorrow (Day 1)',
      PREP_TEXT1: 'Tomorrow you\u2019ll do the Freedom Power Hour, where you focus on rewiring for 1 hour for a big rewiring headstart. After Day 1, the time decreases to 7-22 minutes per day.',
      PREP_TEXT2: 'For right now, just pick a time and place where you\u2019ll do the Freedom Power Hour.',
      BUTTON_NEW: 'Complete Day 0',
      BUTTON_DONE: 'Update Day 0'
    },
    D1G_TITLE: 'Day 1 Guidance: Your Freedom Power Hour',
    D1G_INTRO: 'For about one hour, use these AI tools, in this exact order. Each one rewires from a different angle:',
    D1G_TOOLS: [
      { name: 'No-Brainer Willpower Eliminator' },
      { name: 'Minimalist Plan', note: '(includes H&S Jumpstart setup and keys for rewiring)' },
      { name: 'Feel Good Start' },
      { name: 'Create Joyous Chaos', note: '(pro tip: push CJC as far as you can for powerful rewiring)' }
    ],
    D1G_WITHDRAWAL: 'Optional: the Withdrawal Helper, if withdrawal is a concern. <em>(If your behavior involves serious physical withdrawal, get medical supervision.)</em>',
    D1G_AFTER: 'After using these tools, do the Day 1 Check-In to log everything.',
    D1G_PROMPT_LABEL: 'Paste this starter prompt into each tool:',
    D1G_PROMPT: 'I want to make it easier and more enjoyable to not do the following behavior: {UB}',
    PROMPT_TIP: 'Pro tip: after pasting, add a voice-to-text brain dump about your situation. The more you give the tools, the better the output.',
    COPY_BUTTON: 'Copy prompt',
    COPIED: 'Copied \u2713',
    COPY_FALLBACK: 'Press and hold the text above to copy it.',
    DAILY_GUIDE_TITLE: 'Daily Rewiring Routine for Days 2-7',
    DAILY_GUIDE_LEAD: 'Each day do:',
    DAILY_GUIDE_BULLETS: [
      'Happiness & Success Jumpstart',
      '5\u201320 minutes with the Rapid Behavioral Freedom tool (can do more if you want)',
      'Freedom Experiments where you skip or delay doing your UB and see how it goes (even a 2-second delay counts)',
      'Daily Check-In'
    ],
    DAILY_PROMPT_LABEL: 'Starter prompt for the Rapid Behavioral Freedom tool:',
    DAILY_PROMPT: 'I want to be more free from the following behavior: {UB}. I want to make it easier and more enjoyable to not do it. Here\u2019s my current situation and more about what I\u2019m dealing with right now:',
    DAILY_PROMPT_TIP: 'Paste it in, then talk out whatever\u2019s going on \u2014 brain dumps work great.',
    GROUNDING: 'Here\u2019s what I did today to make it easier and more enjoyable to be free from: ',
    D1_TOOLS_HEADER: 'These are the tools I used today for the Freedom Power Hour:',
    SECTION_KEY_EFFORTS: 'Key Efforts',
    SECTION_REFLECTION: 'Reflection',
    PAST_DAY_NOTE: 'You\u2019re viewing a past day \u2014 you can still complete or edit it.',
    FUTURE_DAY_NOTE: 'This day hasn\u2019t arrived yet \u2014 no need to fill it in early.',
    CATCHUP_DAY1: 'Your Day 1 Power Hour is still waiting \u2014 it\u2019s the engine of this whole sprint.',
    CATCHUP_OTHER: 'Day {DAY} isn\u2019t finished yet \u2014 it only takes a few minutes.',
    CATCHUP_BUTTON: 'Catch up on Day {DAY} \u2192',
    SCORES_TAB: 'Freedom Scores',
    SCORES_SUB: 'Your daily scores save automatically from each day\u2019s card \u2014 this view is your overview (and where to fix typos).',
    PROGRESS_TITLE: 'Your Freedom Journey',
    PROGRESS_UB: 'Breaking more free from: ',
    SAVE_SCORES_BUTTON: 'Save Freedom Scores',
    EVAL_NUDGE: 'Head to your Daily Check-In to keep going \u2014 the finish line is close.',
    SAVED: 'Saved \u2713',
    SAVING: 'Saving\u2026',
    ACTIVATE_TITLE: 'Activate your Freedom Tracker',
    ACTIVATE_SIGNED_IN: 'You are signed in as ',
    ACTIVATE_NO_EMAIL: 'Enter the email you bought with.',
    ACTIVATE_SUB: 'Your tracker activates automatically from the link in your welcome email. Clicked it already on another device? Paste your activation code below.',
    ACTIVATE_BUTTON: 'Activate',
    ACTIVATE_NEED_CODE: 'Enter your activation code.',
    STALE_TOKEN: 'This device had a previous activation that doesn\u2019t match your account. Click the activation link from YOUR welcome email, or enter your code below.'
  };
  var LS = { identity: 'ag_ft_identity', token: 'ag_ft_token', cache: 'ag_ft_cache_v5' };
  var state = {
    identity: null, token: null,
    view: 'full', fixedDay: null,
    projects: [], activeProjectId: null,
    currentDay: 0, maxDay: 7,
    setup: { stage: 0, ub: '', jumpstart: '' },
    scoreQuestions: null,
    completion: null,
    viewingDay: null, dayData: null, scores: null,
    tab: 'day',
    dirty: false            // student has unsaved edits; block re-renders
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
    if (t) {
      var prev = readLS(LS.token);
      writeLS(LS.token, t);
      if (prev && prev !== t) clearStateCache();   // new student on this device
    }
  }
  function handleResetParam() { if (readParam('ag_reset')) resetStorage(); }
  function resetStorage() {
    try { localStorage.removeItem(LS.token); } catch (e) {}
    try { localStorage.removeItem(LS.identity); } catch (e) {}
    clearStateCache();
  }
  try {
    window.AG_FT_RESET = function () {
      resetStorage();
      console.log('Freedom Tracker storage cleared. Reload the page.');
    };
  } catch (e) {}
  // ============================================================
  // State cache (cache-then-refresh)
  // ============================================================
  function cacheKey() { return LS.cache; }
  function readStateCache() {
    try {
      var raw = localStorage.getItem(cacheKey());
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.token !== state.token) return null;
      if ((Date.now() - parsed.at) / 3600000 > CONFIG.STATE_CACHE_HOURS) return null;
      return parsed;
    } catch (e) { return null; }
  }
  function writeStateCache() {
    try {
      localStorage.setItem(cacheKey(), JSON.stringify({
        at: Date.now(),
        token: state.token,
        snapshot: {
          projects: state.projects, activeProjectId: state.activeProjectId,
          currentDay: state.currentDay, maxDay: state.maxDay,
          setup: state.setup, scoreQuestions: state.scoreQuestions,
          completion: state.completion,
          firstName: (state.identity && state.identity.firstName) || '',
          days: state._dayCache || {}
        }
      }));
    } catch (e) {}
  }
  function clearStateCache() { try { localStorage.removeItem(cacheKey()); } catch (e) {} }
  function hydrateFromCache(snap) {
    state.projects = snap.projects || [];
    state.activeProjectId = snap.activeProjectId;
    state.currentDay = snap.currentDay || 0;
    state.maxDay = snap.maxDay || 7;
    state.setup = snap.setup || state.setup;
    state.scoreQuestions = snap.scoreQuestions || null;
    state.completion = snap.completion || null;
    state._dayCache = snap.days || {};
    if (state.viewingDay == null) state.viewingDay = state.currentDay;
    state.dayData = state._dayCache[state.currentDay] || null;
  }
  function cacheDay(dayData) {
    if (!dayData) return;
    state._dayCache = state._dayCache || {};
    state._dayCache[dayData.day] = dayData;
    writeStateCache();
  }
  function safeToRerender() {
    if (state.dirty) return false;
    try {
      var a = document.activeElement;
      if (a && rootEl.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) return false;
    } catch (e) {}
    return true;
  }
  // ============================================================
  // Boot
  // ============================================================
  function boot() {
    rootEl = document.getElementById(CONFIG.CONTAINER_ID);
    if (!rootEl) return;
    injectStyles();
    var dv = (rootEl.getAttribute('data-view') || 'full').trim().toLowerCase();
    state.view = 'full';
    state.fixedDay = null;
    if (dv.indexOf('day:') === 0) {
      state.view = 'day';
      state.fixedDay = Number(dv.split(':')[1]);
      if (isNaN(state.fixedDay)) { state.view = 'full'; state.fixedDay = null; }
    } else if (dv === 'day1-checkin') {
      state.view = 'day';
      state.fixedDay = 1;
    } else if (dv === 'day1-full') {
      state.view = 'day1full';
    } else if (dv === 'day1-guidance' || dv === 'day1guide') {
      state.view = 'day1guidance';
    } else if (dv === 'days2to7-full') {
      state.view = 'days2to7full';
    } else if (dv === 'days2to7-guidance' || dv === 'dailyguide') {
      state.view = 'dailyguidance';
    } else if (dv === 'days2to7-checkin') {
      state.view = 'days2to7checkin';
    } else if (['today', 'progress', 'goalplan', 'full', 'setup', 'evaluate'].indexOf(dv) >= 0) {
      state.view = (dv === 'setup') ? 'full' : dv;
    }
    handleResetParam();
    captureMagicLinkToken();
    state.token = readLS(LS.token);
    // Track unsaved edits globally (one delegated listener).
    rootEl.addEventListener('input', function () { state.dirty = true; });
    getIdentity().then(function (identity) {
      state.identity = identity;
      if (!state.token) return renderPairing('');
      // CACHE-THEN-REFRESH: instant render from cache, then refresh.
      var cached = readStateCache();
      if (cached) {
        hydrateFromCache(cached.snapshot);
        if (cached.snapshot.firstName && state.identity && !state.identity.firstName) {
          state.identity.firstName = cached.snapshot.firstName;
        }
        route();
        loadState(true);    // background refresh
      } else {
        rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
        loadState(false);
      }
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
  function loadState(background) {
    callGateway({ action: 'state', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) {
          resetTokenOnly();
          clearStateCache();
          return renderPairing(COPY.STALE_TOKEN);
        }
        var before = JSON.stringify([state.setup, state.completion, state.currentDay, state.dayData]);
        state.projects = data.projects || [];
        state.activeProjectId = data.activeProjectId;
        state.currentDay = data.currentDay;
        state.maxDay = data.maxDay || 7;
        state.setup = data.setup || { stage: 0, ub: '', jumpstart: '' };
        state.scoreQuestions = data.scoreQuestions || null;
        state.completion = data.completion || state.completion;
        if (data.day) { cacheDay(data.day); if (!background || !state.dayData) state.dayData = data.day; }
        if (state.viewingDay == null) state.viewingDay = state.currentDay;
        writeStateCache();
        var after = JSON.stringify([state.setup, state.completion, state.currentDay, data.day || state.dayData]);
        if (!background) return route();
        if (before !== after && safeToRerender()) {
          if (data.day && state.viewingDay === data.day.day) state.dayData = data.day;
          route();
        }
      })
      .catch(function (err) {
        if (!background) renderFatal(String(err));
      });
  }
  function resetTokenOnly() {
    state.token = null;
    try { localStorage.removeItem(LS.token); } catch (e) {}
  }
  // ============================================================
  // Routing — wizard first, then the configured view
  // ============================================================
  function route() {
    state.dirty = false;
    if (state.setup.stage < 4) return renderWizard();
    if (state.view === 'day') return renderFixedDayView(state.fixedDay);
    if (state.view === 'today') return renderTodayView();
    if (state.view === 'day1full') return renderDay1FullView();
    if (state.view === 'day1guidance') return renderDay1Guide();
    if (state.view === 'days2to7full') return renderDays2to7FullView();
    if (state.view === 'dailyguidance') return renderDailyGuideView();
    if (state.view === 'days2to7checkin') return renderFixedDayView(clampDay2to7_());
    if (state.view === 'progress') return renderProgressView();
    if (state.view === 'evaluate') return renderEvaluateView();
    if (state.view === 'goalplan') return renderGoalPlanView();
    return renderNavigator();
  }
  function clampDay2to7_() {
    var d = state.currentDay;
    if (d < 2) d = 2;
    if (d > state.maxDay) d = state.maxDay;
    return d;
  }
  // ============================================================
  // Validation (mirrors the Gateway)
  // ============================================================
  function validText(s) {
    s = String(s || '').trim();
    return !!s && s.toLowerCase() !== 'tbd';
  }
  function validScore(v) {
    var n = Number(v);
    return !isNaN(n) && n >= 0 && n <= 10 && n === Math.round(n);
  }
  // ============================================================
  // Setup wizard — 4 steps
  // ============================================================
  function renderWizard() {
    var stage = state.setup.stage;
    if (stage === 0) return wizardStepUb();
    if (stage === 1) return wizardStepBaseline();
    if (stage === 2) return wizardStepJumpstart();
    return wizardStepGoalPlan();
  }
  function wizardDots(step) {
    var html = '<div class="ft-dots">';
    for (var i = 1; i <= 4; i++) html += '<span class="ft-dot' + (i <= step ? ' ft-dot-on' : '') + '"></span>';
    return html + '<span class="ft-dots-label">Step ' + step + ' of 4</span></div>';
  }
  function wizardStepUb() {
    var name = (state.identity && state.identity.firstName) ? ', ' + state.identity.firstName : '';
    rootEl.innerHTML =
      '<div class="ft-card">' + wizardDots(1) +
        '<h3 class="ft-title-gap">' + esc(COPY.WIZ1_TITLE.replace('{NAME}', name)) + '</h3>' +
        '<label class="ft-label">' + esc(COPY.WIZ1_LABEL) + '</label>' +
        '<textarea id="ft-ub" rows="3" placeholder="' + esc(COPY.WIZ1_PLACEHOLDER) + '">' + esc(state.setup.ub) + '</textarea>' +
        '<button id="ft-next">' + esc(COPY.WIZ1_BUTTON) + '</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';
    document.getElementById('ft-next').addEventListener('click', function () {
      var ub = document.getElementById('ft-ub').value.trim();
      if (!validText(ub)) return setMsg('ft-wiz-msg', COPY.WIZ1_ERROR, false);
      setMsg('ft-wiz-msg', COPY.SAVING, true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'ub', ub: ub })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = data.stage;
          state.setup.ub = data.ub;
          writeStateCache();
          renderWizard();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }
  function scoreQuestion(key) {
    var q = state.scoreQuestions || {};
    var fallback = { easy: 'Easy (0-10)', enjoy: 'Enjoyable (0-10)', conf: 'Confidence (0-10)' };
    return q[key] || fallback[key];
  }
  function scoreInputHtml(key, idPrefix, value) {
    return '<div class="ft-field"><label class="ft-label">' + esc(scoreQuestion(key)) + '</label>' +
      '<input type="number" min="0" max="10" step="1" id="' + idPrefix + key + '" placeholder="0-10" value="' + esc(value == null ? '' : value) + '" /></div>';
  }
  function wizardStepBaseline() {
    rootEl.innerHTML =
      '<div class="ft-card">' + wizardDots(2) +
        '<h3>' + esc(COPY.WIZ2_TITLE) + '</h3>' +
        '<p class="ft-sub">' + esc(COPY.WIZ2_SUB) + '</p>' +
        '<div class="ft-divider"></div>' +
        scoreInputHtml('easy', 'ft-sc-', null) +
        scoreInputHtml('enjoy', 'ft-sc-', null) +
        scoreInputHtml('conf', 'ft-sc-', null) +
        '<button id="ft-next">' + esc(COPY.WIZ2_BUTTON) + '</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';
    document.getElementById('ft-next').addEventListener('click', function () {
      var scores = {};
      var keys = ['easy', 'enjoy', 'conf'];
      for (var i = 0; i < keys.length; i++) {
        var v = document.getElementById('ft-sc-' + keys[i]).value;
        if (!validScore(v)) return setMsg('ft-wiz-msg', COPY.SCORE_ERROR, false);
        scores[keys[i]] = Number(v);
      }
      setMsg('ft-wiz-msg', COPY.SAVING, true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'baseline', scores: scores })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = data.stage;
          writeStateCache();
          renderWizard();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }
  function wizardStepJumpstart() {
    rootEl.innerHTML =
      '<div class="ft-card">' + wizardDots(3) +
        '<h3>' + esc(COPY.WIZ3_TITLE) + '</h3>' +
        '<p class="ft-sub ft-title-gap">' + esc(COPY.WIZ3_SUB) + '</p>' +
        '<label class="ft-label">' + esc(COPY.WIZ3_LABEL) + '</label>' +
        '<input type="text" id="ft-js" placeholder="' + esc(COPY.WIZ3_PLACEHOLDER) + '" value="' + esc(state.setup.jumpstart) + '" />' +
        '<button id="ft-next">' + esc(COPY.WIZ3_BUTTON) + '</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';
    document.getElementById('ft-next').addEventListener('click', function () {
      var js = document.getElementById('ft-js').value.trim();
      if (!validText(js)) return setMsg('ft-wiz-msg', COPY.WIZ3_ERROR, false);
      setMsg('ft-wiz-msg', COPY.SAVING, true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'jumpstart', jumpstart: js })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = data.stage;
          state.setup.jumpstart = data.jumpstart;
          writeStateCache();
          renderWizard();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }
  function wizardStepGoalPlan() {
    rootEl.innerHTML =
      '<div class="ft-card">' + wizardDots(4) +
        goalPlanReadOnlyHtml() +
        '<button id="ft-unlock">' + esc(COPY.WIZ4_BUTTON) + '</button>' +
        '<div class="ft-msg" id="ft-wiz-msg"></div>' +
      '</div>';
    document.getElementById('ft-unlock').addEventListener('click', function () {
      setMsg('ft-wiz-msg', 'Unlocking\u2026', true);
      callGateway({ action: 'setupSave', projectId: state.activeProjectId, step: 'complete' })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-wiz-msg', data.error, false);
          state.setup.stage = 4;
          state.currentDay = data.currentDay;
          state.viewingDay = data.currentDay;
          state.dayData = data.day;
          state.completion = data.completion;
          cacheDay(data.day);
          writeStateCache();
          route();
        })
        .catch(function (err) { setMsg('ft-wiz-msg', String(err), false); });
    });
  }
  function goalPlanReadOnlyHtml() {
    var ub = state.setup.ub || 'your unwanted behavior';
    var html = '<h3 class="ft-center-h ft-title-gap">' + esc(COPY.GOAL_TITLE) + '</h3>' +
      '<div class="ft-goal">' + esc(COPY.GOAL_PREFIX) + '<strong>' + esc(ub) + '</strong>' + esc(COPY.GOAL_SUFFIX) + '</div>';
    if (state.setup.jumpstart) {
      html += '<div class="ft-goal">' + esc(COPY.GOAL_JS_PREFIX) + '<strong>' + esc(state.setup.jumpstart) + '</strong></div>';
    }
    html += planHtml();
    return html;
  }
  function planHtml() {
    var html = '<div class="ft-planwrap"><h3 class="ft-center-h">' + esc(COPY.PLAN_TITLE) + '</h3>';
    for (var i = 0; i < COPY.PLAN_PARAS.length; i++) {
      html += '<p class="ft-body-text ft-plan-p">' + COPY.PLAN_PARAS[i] + '</p>';
    }
    return html + '</div>';
  }
  // ============================================================
  // Goal & Plan view — the editing hub
  // ============================================================
  function renderGoalPlanView() {
    renderShell(goalPlanEditHtml(), null);
    wireGoalPlanSave();
  }
  function goalPlanEditHtml() {
    return '<h3 class="ft-center-h ft-title-gap">' + esc(COPY.GOAL_TITLE) + '</h3>' +
      '<div class="ft-field"><label class="ft-label">' + esc(COPY.GOAL_LABEL) + '</label>' +
      '<textarea id="ft-goal-ub" rows="3">' + esc(state.setup.ub) + '</textarea></div>' +
      '<div class="ft-field"><label class="ft-label">' + esc(COPY.GOAL_JS_LABEL) + '</label>' +
      '<input type="text" id="ft-goal-js" value="' + esc(state.setup.jumpstart) + '" /></div>' +
      '<button id="ft-goal-save">' + esc(COPY.GOAL_BUTTON) + '</button>' +
      '<div class="ft-msg" id="ft-goal-msg"></div>' +
      planHtml();
  }
  function wireGoalPlanSave() {
    var btn = document.getElementById('ft-goal-save');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var ub = document.getElementById('ft-goal-ub').value.trim();
      var js = document.getElementById('ft-goal-js').value.trim();
      if (!validText(ub)) return setMsg('ft-goal-msg', COPY.WIZ1_ERROR, false);
      if (!validText(js)) return setMsg('ft-goal-msg', COPY.WIZ3_ERROR, false);
      setMsg('ft-goal-msg', COPY.SAVED, true);   // optimistic
      state.dirty = false;
      callGateway({ action: 'updateGoals', projectId: state.activeProjectId, ub: ub, jumpstart: js })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-goal-msg', data.error, false);
          state.setup.ub = data.ub;
          state.setup.jumpstart = data.jumpstart;
          writeStateCache();
          setMsg('ft-goal-msg', COPY.GOAL_SAVED, true);
        })
        .catch(function (err) { setMsg('ft-goal-msg', String(err), false); });
    });
  }
  // ============================================================
  // Shared shell + navigator
  // ============================================================
  function renderShell(contentHtml, chipsHtml) {
    var name = (state.identity && state.identity.firstName) || '';
    var html = '<div class="ft-card">';
    html += '<div class="ft-head">';
    html += '<div><h3>' + (name ? esc(name) + '\u2019s ' : '') + 'Freedom Tracker</h3>';
    html += '<p class="ft-sub">' + esc(COPY.HEADER_TODAY.replace('{DAY}', state.currentDay)) + '</p></div>';
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
        state._dayCache = {};
        clearStateCache();
        rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
        loadState(false);
      });
    }
  }
  function renderNavigator() {
    renderShell('', chipsHtml());
    wireChips();
    if (state.tab === 'goalplan') { setBody(goalPlanEditHtml()); wireGoalPlanSave(); }
    else if (state.tab === 'scores') { loadScoresInto(); }
    else if (state.viewingDay >= 1) {
      // v5: full view shows guidance + check-in together for Days 1-7.
      setBody(dailyGuideHtml() + '<div id="ft-day-holder"></div>');
      wireCopyButtons();
      loadDayInto(state.viewingDay, { holder: 'ft-day-holder' });
    }
    else loadDayInto(state.viewingDay, {});
  }
  function chipsHtml() {
    var html = '<div class="ft-chips">';
    html += chip('goalplan', 'Goal & Plan', state.tab === 'goalplan', false, false);
    for (var d = 0; d <= state.maxDay; d++) {
      var done = state.completion && state.completion[d];
      var attention = !done && d < state.currentDay;
      var active = state.tab === 'day' && d === state.viewingDay;
      html += chip('day-' + d, 'Day ' + d + (done ? ' \u2713' : ''), active, d === state.currentDay, attention);
    }
    html += chip('scores', COPY.SCORES_TAB, state.tab === 'scores', false, false);
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
        state.dayData = (state._dayCache && state._dayCache[state.viewingDay]) || null;
        renderNavigator();
      });
    }
  }
  function refreshChips() {
    var chipsEl = rootEl.querySelector('.ft-chips');
    if (chipsEl) { chipsEl.outerHTML = chipsHtml(); wireChips(); }
  }
  // ============================================================
  // Views: day:N / today / day1-* / days2to7-* / progress / evaluate
  // ============================================================
  function renderFixedDayView(day) {
    renderShell('', null);
    state.viewingDay = day;
    state.dayData = (state._dayCache && state._dayCache[day]) || null;
    loadDayInto(day, {});
  }
  function renderTodayView() {
    state.viewingDay = (state.viewingDay == null) ? state.currentDay : state.viewingDay;
    renderShell(dailyGuideHtml(), null);
    wireCopyButtons();
    var holder = document.createElement('div');
    holder.id = 'ft-day-holder';
    document.getElementById('ft-body').appendChild(holder);
    state.dayData = (state._dayCache && state._dayCache[state.viewingDay]) || null;
    loadDayInto(state.viewingDay, { showCatchUp: true, holder: 'ft-day-holder' });
  }
  function renderDay1FullView() {
    state.viewingDay = 1;
    renderShell('<div class="ft-guide">' + day1GuideInnerHtml() + '</div><div id="ft-day-holder"></div>', null);
    wireCopyButtons();
    state.dayData = (state._dayCache && state._dayCache[1]) || null;
    loadDayInto(1, { holder: 'ft-day-holder' });
  }
  function renderDays2to7FullView() {
    state.viewingDay = (state.viewingDay == null) ? clampDay2to7_() : state.viewingDay;
    renderShell(dailyGuideHtml(), null);
    wireCopyButtons();
    var holder = document.createElement('div');
    holder.id = 'ft-day-holder';
    document.getElementById('ft-body').appendChild(holder);
    state.dayData = (state._dayCache && state._dayCache[state.viewingDay]) || null;
    loadDayInto(state.viewingDay, { showCatchUp: true, holder: 'ft-day-holder' });
  }
  function day1GuideInnerHtml() {
    var toolsHtml = '<ol class="ft-ol">';
    for (var i = 0; i < COPY.D1G_TOOLS.length; i++) {
      var tool = COPY.D1G_TOOLS[i];
      toolsHtml += '<li>' + esc(tool.name) +
        (tool.note ? ' \u2192 <em class="ft-tool-note">' + esc(tool.note) + '</em>' : '') + '</li>';
    }
    toolsHtml += '</ol>';
    return '<h4>' + esc(COPY.D1G_TITLE) + '</h4>' +
      '<p class="ft-body-text">' + esc(COPY.D1G_INTRO) + '</p>' +
      toolsHtml +
      '<p class="ft-body-text">' + COPY.D1G_WITHDRAWAL + '</p>' +
      promptBoxHtml(COPY.D1G_PROMPT_LABEL, COPY.D1G_PROMPT, COPY.PROMPT_TIP) +
      '<p class="ft-body-text">' + esc(COPY.D1G_AFTER) + '</p>';
  }
  function renderDay1Guide() {
    renderShell(day1GuideInnerHtml(), null);
    wireCopyButtons();
  }
  function dailyGuideInnerHtml() {
    var bullets = '<ul class="ft-ul">';
    for (var i = 0; i < COPY.DAILY_GUIDE_BULLETS.length; i++) bullets += '<li>' + esc(COPY.DAILY_GUIDE_BULLETS[i]) + '</li>';
    bullets += '</ul>';
    return '<h4 class="ft-center-h">' + esc(COPY.DAILY_GUIDE_TITLE) + '</h4>' +
      '<p class="ft-body-text">' + esc(COPY.DAILY_GUIDE_LEAD) + '</p>' +
      bullets +
      promptBoxHtml(COPY.DAILY_PROMPT_LABEL, COPY.DAILY_PROMPT, COPY.DAILY_PROMPT_TIP);
  }
  function renderDailyGuideView() {
    renderShell(dailyGuideInnerHtml(), null);
    wireCopyButtons();
  }
  function dailyGuideHtml() {
    if (state.viewingDay === 1) return '<div class="ft-guide">' + day1GuideInnerHtml() + '</div>';
    if (state.viewingDay < 2) return '';
    return '<div class="ft-guide">' + dailyGuideInnerHtml() + '</div>';
  }
  function promptBoxHtml(label, template, tip) {
    var text = template.replace('{UB}', state.setup.ub || 'my unwanted behavior');
    return '<div class="ft-promptbox">' +
      '<div class="ft-label">' + esc(label) + '</div>' +
      '<textarea class="ft-prompt" readonly rows="3" data-prompt-text>' + esc(text) + '</textarea>' +
      '<button class="ft-copybtn" data-copy>' + esc(COPY.COPY_BUTTON) + '</button>' +
      '<div class="ft-msg" data-copy-msg></div>' +
      '<p class="ft-sub" style="margin-top:8px;">' + esc(tip) + '</p>' +
      '</div>';
  }
  function wireCopyButtons() {
    var btns = rootEl.querySelectorAll('[data-copy]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var box = this.closest('.ft-promptbox');
        var ta = box.querySelector('[data-prompt-text]');
        var msg = box.querySelector('[data-copy-msg]');
        var btn = this;
        var text = ta.value;
        function done() {
          btn.textContent = COPY.COPIED;
          setTimeout(function () { btn.textContent = COPY.COPY_BUTTON; }, 2000);
        }
        function fallback() {
          try {
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, 99999);
            if (document.execCommand('copy')) return done();
          } catch (e) {}
          msg.textContent = COPY.COPY_FALLBACK;
          msg.className = 'ft-msg ft-good';
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(fallback);
        } else {
          fallback();
        }
      });
    }
  }
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
    var html = '<h4>' + esc(COPY.PROGRESS_TITLE) + '</h4>';
    if (state.setup.ub) {
      html += '<p class="ft-body-text">' + esc(COPY.PROGRESS_UB) + '<strong>' + esc(state.setup.ub) + '</strong></p>';
    }
    html += trajectoryHtml();
    if (state.completion) {
      html += '<h4>Days completed</h4><div class="ft-chips">';
      for (var d = 0; d <= state.maxDay; d++) {
        var done = state.completion[d];
        html += '<span class="ft-chip ft-chip-static' + (done ? ' ft-chip-done' : '') + '">Day ' + d + (done ? ' \u2713' : '') + '</span>';
      }
      html += '</div>';
    }
    html += '<h4 style="margin-top:16px;">All ' + esc(COPY.SCORES_TAB) + '</h4>' + scoresGridHtml();
    return html;
  }
  function trajectoryHtml() {
    var metrics = [['easy', 'Easy'], ['enjoy', 'Enjoyable'], ['conf', 'Confidence']];
    var html = '<div class="ft-traj-box">';
    for (var m = 0; m < metrics.length; m++) {
      var seq = [];
      for (var i = 0; i < state.scores.length; i++) {
        var v = state.scores[i].values[metrics[m][0]];
        if (v != null) seq.push(v);
      }
      html += '<div class="ft-traj"><span class="ft-traj-label">' + metrics[m][1] + ':</span> ' +
        (seq.length ? esc(seq.join(' \u2192 ')) : '<span class="ft-sub" style="display:inline;">no entries yet</span>') + '</div>';
    }
    return html + '</div>';
  }
  function renderEvaluateView() {
    renderShell('<div class="ft-center ft-sub">Loading your evaluation\u2026</div>', null);
    callGateway({ action: 'evaluation', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return setBody(badMsg(data.error));
        state.scores = data.scores;
        if (!data.unlocked) {
          setBody(
            '<h4>' + esc(data.copy.lockedTitle) + '</h4>' +
            '<div class="ft-note">' + esc(data.copy.lockedText) + '</div>' +
            trajectoryHtml() +
            '<p class="ft-body-text">' + esc(COPY.EVAL_NUDGE) + '</p>'
          );
          return;
        }
        var metrics = [['easy', 'Easy'], ['enjoy', 'Enjoyable'], ['conf', 'Confidence']];
        var deltasHtml = '<div class="ft-traj-box">';
        for (var m = 0; m < metrics.length; m++) {
          var d = data.deltas[metrics[m][0]];
          var change = (d.change == null) ? '' : ' (' + (d.change >= 0 ? '+' : '') + d.change + ')';
          deltasHtml += '<div class="ft-traj"><span class="ft-traj-label">' + metrics[m][1] + ':</span> ' +
            esc((d.from == null ? '?' : d.from) + ' \u2192 ' + d.to) + esc(change) + '</div>';
        }
        deltasHtml += '</div>';
        var tierParas = data.copy.tierText;
        if (typeof tierParas === 'string') tierParas = [tierParas];
        var tierHtml = '';
        for (var t = 0; t < tierParas.length; t++) {
          tierHtml += '<p class="ft-body-text">' + esc(tierParas[t]) + '</p>';
        }
        setBody(
          '<h4>' + esc(data.copy.tierTitle) + '</h4>' +
          deltasHtml +
          tierHtml
        );
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }
  // ============================================================
  // Freedom Scores grid
  // ============================================================
  function loadScoresInto() {
    setBody('<div class="ft-center ft-sub">Loading ' + esc(COPY.SCORES_TAB) + '\u2026</div>');
    callGateway({ action: 'scores', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return setBody(badMsg(data.error));
        state.scores = data.scores;
        setBody('<h4>' + esc(COPY.SCORES_TAB) + '</h4><p class="ft-sub">' + esc(COPY.SCORES_SUB) + '</p>' + scoresGridHtml());
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
        html += '<div><input type="number" min="0" max="10" step="1" data-cp="' + esc(row.key) + '" data-metric="' + metrics[m] + '" value="' + esc(v == null ? '' : v) + '" /></div>';
      }
      html += '</div>';
    }
    html += '<button id="ft-save-scores">' + esc(COPY.SAVE_SCORES_BUTTON) + '</button><div class="ft-msg" id="ft-scores-msg"></div>';
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
        if (!validScore(el.value)) return setMsg('ft-scores-msg', COPY.SCORE_ERROR, false);
        var cp = el.getAttribute('data-cp');
        if (!scores[cp]) scores[cp] = {};
        scores[cp][el.getAttribute('data-metric')] = Number(el.value);
      }
      setMsg('ft-scores-msg', COPY.SAVED, true);   // optimistic
      state.dirty = false;
      callGateway({ action: 'saveScores', projectId: state.activeProjectId, scores: scores })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-scores-msg', data.error, false);
          state.scores = data.scores;
          setMsg('ft-scores-msg', COPY.SAVED, true);
        })
        .catch(function (err) { setMsg('ft-scores-msg', String(err), false); });
    });
  }
  // ============================================================
  // Day cards
  // ============================================================
  function loadDayInto(day, opts) {
    opts = opts || {};
    var cached = state._dayCache && state._dayCache[day];
    if (cached) {
      state.dayData = cached;
      renderDayCard(cached, opts);
      // Background refresh of this day.
      callGateway({ action: 'getDay', projectId: state.activeProjectId, day: day })
        .then(function (data) {
          if (!data.ok) return;
          cacheDay(data.day);
          if (state.viewingDay === day && safeToRerender() &&
              JSON.stringify(data.day) !== JSON.stringify(cached)) {
            state.dayData = data.day;
            renderDayCard(data.day, opts);
          }
        }).catch(function () {});
      return;
    }
    setBodyTarget(opts.holder, '<div class="ft-center ft-sub">Loading Day ' + day + '\u2026</div>');
    callGateway({ action: 'getDay', projectId: state.activeProjectId, day: day })
      .then(function (data) {
        if (!data.ok) return setBodyTarget(opts.holder, badMsg(data.error));
        state.dayData = data.day;
        cacheDay(data.day);
        renderDayCard(data.day, opts);
      })
      .catch(function (err) { setBodyTarget(opts.holder, badMsg(String(err))); });
  }
  function firstIncompletePastDay() {
    if (!state.completion) return null;
    for (var d = 0; d < state.currentDay; d++) {
      if (!state.completion[d]) return d;
    }
    return null;
  }
  function fieldVal_(dd, key) {
    for (var i = 0; i < dd.fields.length; i++) if (dd.fields[i].key === key) return dd.fields[i].value;
    return null;
  }
  function fieldLabel_(dd, key) {
    for (var i = 0; i < dd.fields.length; i++) if (dd.fields[i].key === key) return dd.fields[i].label;
    return '';
  }
  // v5: Day 0 has its own card — education sections + dashed
  // "Complete Day 0" box (one checkbox + Power Hour time/place).
  function renderDay0Card(dd, opts) {
    var html = '<h4>' + esc(dd.title) + '</h4>';
    if (dd.day < state.currentDay) html += '<div class="ft-note">' + esc(COPY.PAST_DAY_NOTE) + '</div>';
    else if (dd.day > state.currentDay) html += '<div class="ft-note">' + esc(COPY.FUTURE_DAY_NOTE) + '</div>';
    var ub = state.setup.ub || 'your unwanted behavior';
    html += '<div class="ft-goal">' + esc(COPY.GOAL_PREFIX) + '<strong>' + esc(ub) + '</strong></div>';
    html += '<p class="ft-body-text">' + esc(COPY.DAY0.INTRO2) + '</p>';
    for (var s = 0; s < COPY.DAY0.SECTIONS.length; s++) {
      var sec = COPY.DAY0.SECTIONS[s];
      html += '<div class="ft-step-h">' + esc(sec.h) + '</div>';
      for (var p = 0; p < sec.paras.length; p++) html += '<p class="ft-body-text">' + esc(sec.paras[p]) + '</p>';
    }
    var checked = fieldVal_(dd, 'd0_all') === true;
    var ph = String(fieldVal_(dd, 'd0_ph_plan') || '').trim();
    var btnLabel = (!checked && !ph) ? COPY.DAY0.BUTTON_NEW : COPY.DAY0.BUTTON_DONE;
    html += '<div class="ft-completebox">' +
      '<h4 class="ft-center-h">' + esc(COPY.DAY0.COMPLETE_HEADER) + '</h4>' +
      '<div class="ft-field"><label class="ft-check"><input type="checkbox" data-key="d0_all"' + (checked ? ' checked' : '') + ' /> <span>' + esc(fieldLabel_(dd, 'd0_all')) + '</span></label></div>' +
      '<div class="ft-step-h">' + esc(COPY.DAY0.PREP_HEADER) + '</div>' +
      '<p class="ft-body-text">' + esc(COPY.DAY0.PREP_TEXT1) + '</p>' +
      '<p class="ft-body-text">' + esc(COPY.DAY0.PREP_TEXT2) + '</p>' +
      '<div class="ft-field"><label class="ft-label">' + esc(fieldLabel_(dd, 'd0_ph_plan')) + '</label>' +
      '<input type="text" data-key="d0_ph_plan" value="' + esc(ph) + '" /></div>' +
      '<button id="ft-save">' + esc(btnLabel) + '</button><div class="ft-msg" id="ft-save-msg"></div>' +
      '</div>';
    setBodyTarget(opts.holder, html);
    wireDaySave(dd, opts);
  }
  function renderDayCard(dd, opts) {
    if (dd.day === 0) return renderDay0Card(dd, opts);
    var html = '<h4>' + esc(dd.title) + '</h4>';
    if (opts.showCatchUp) {
      var missed = firstIncompletePastDay();
      if (missed != null && missed !== dd.day) {
        var msg = (missed === 1) ? COPY.CATCHUP_DAY1 : COPY.CATCHUP_OTHER.replace('{DAY}', missed);
        html += '<div class="ft-note">' + esc(msg) +
          ' <button class="ft-linkbtn" id="ft-catchup" data-day="' + missed + '">' +
          esc(COPY.CATCHUP_BUTTON.replace('{DAY}', missed)) + '</button></div>';
      }
    }
    if (dd.day < state.currentDay) html += '<div class="ft-note">' + esc(COPY.PAST_DAY_NOTE) + '</div>';
    else if (dd.day > state.currentDay) html += '<div class="ft-note">' + esc(COPY.FUTURE_DAY_NOTE) + '</div>';
    if (dd.day >= 1 && state.setup.ub) {
      html += '<div class="ft-grounding">' + esc(COPY.GROUNDING) + '<strong>' + esc(state.setup.ub) + '</strong></div>' +
        '<div class="ft-divider"></div>';
    }
    if (dd.day === 1) html += '<div class="ft-step-h">' + esc(COPY.D1_TOOLS_HEADER) + '</div>';
    for (var i = 0; i < dd.fields.length; i++) {
      var f = dd.fields[i];
      if (dd.day >= 2 && f.key === 'jumpstart') html += '<h4 class="ft-center-h ft-group-h">' + esc(COPY.SECTION_KEY_EFFORTS) + '</h4>';
      if (dd.day >= 2 && f.key === 'wins') html += '<h4 class="ft-center-h ft-group-h">' + esc(COPY.SECTION_REFLECTION) + '</h4>';
      if (f.missing) {
        html += '<div class="ft-field ft-sub">\u26a0 "' + esc(f.label) + '" isn\u2019t wired up yet (named range missing).</div>';
        continue;
      }
      html += '<div class="ft-field">';
      if (f.intro) html += '<p class="ft-body-text ft-intro">' + esc(f.intro) + '</p>';
      if (f.type === 'check') {
        html += '<label class="ft-check"><input type="checkbox" data-key="' + esc(f.key) + '"' + (f.value ? ' checked' : '') + ' /> <span>' + esc(f.label) + '</span></label>';
      } else if (f.type === 'number') {
        html += '<label class="ft-label">' + esc(f.label) + '</label><input type="number" min="0" step="1" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '" />';
      } else if (f.type === 'textarea') {
        html += '<label class="ft-label">' + esc(f.label) + '</label><textarea rows="3" data-key="' + esc(f.key) + '">' + esc(f.value == null ? '' : f.value) + '</textarea>';
      } else {
        html += '<label class="ft-label">' + esc(f.label) + '</label><input type="text" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '" />';
      }
      html += '</div>';
    }
    if (dd.scores) {
      html += '<div class="ft-dayscores"><h4 class="ft-center-h ft-scores-h">' + esc(dd.scores.label) + '</h4>';
      var mks = ['easy', 'enjoy', 'conf'];
      var qs = dd.scores.questions || state.scoreQuestions || {};
      for (var m = 0; m < mks.length; m++) {
        var v = dd.scores.values[mks[m]];
        html += '<div class="ft-field"><label class="ft-label">' + esc(qs[mks[m]] || mks[m]) + '</label>' +
          '<input type="number" min="0" max="10" step="1" data-dayscore="' + mks[m] + '" value="' + esc(v == null ? '' : v) + '" /></div>';
      }
      html += '</div>';
    }
    html += '<button id="ft-save">Save Day ' + dd.day + '</button><div class="ft-msg" id="ft-save-msg"></div>';
    setBodyTarget(opts.holder, html);
    var catchup = document.getElementById('ft-catchup');
    if (catchup) {
      catchup.addEventListener('click', function () {
        state.viewingDay = Number(this.getAttribute('data-day'));
        state.dayData = (state._dayCache && state._dayCache[state.viewingDay]) || null;
        route();
      });
    }
    wireDaySave(dd, opts);
  }
  function wireDaySave(dd, opts) {
    document.getElementById('ft-save').addEventListener('click', function () {
      var container = opts.holder ? document.getElementById(opts.holder) : document.getElementById('ft-body');
      var fields = {};
      var inputs = container.querySelectorAll('[data-key]');
      for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        fields[el.getAttribute('data-key')] = (el.type === 'checkbox') ? el.checked : el.value;
      }
      var dayScores = null;
      var scoreInputs = container.querySelectorAll('[data-dayscore]');
      for (var s = 0; s < scoreInputs.length; s++) {
        if (scoreInputs[s].value === '') continue;
        if (!validScore(scoreInputs[s].value)) return setMsg('ft-save-msg', COPY.SCORE_ERROR, false);
        if (!dayScores) dayScores = {};
        dayScores[scoreInputs[s].getAttribute('data-dayscore')] = Number(scoreInputs[s].value);
      }
      setMsg('ft-save-msg', COPY.SAVED, true);   // optimistic
      state.dirty = false;
      callGateway({ action: 'save', projectId: state.activeProjectId, day: dd.day, fields: fields, dayScores: dayScores })
        .then(function (data) {
          if (!data.ok) return setMsg('ft-save-msg', data.error, false);
          state.dayData = data.day;
          cacheDay(data.day);
          state.completion = data.completion || state.completion;
          writeStateCache();
          setMsg('ft-save-msg', COPY.SAVED, true);
          if (dd.day === 0) {
            var b = document.getElementById('ft-save');
            if (b) b.textContent = COPY.DAY0.BUTTON_DONE;
          }
          if (state.view === 'full') refreshChips();
        })
        .catch(function (err) { setMsg('ft-save-msg', String(err), false); });
    });
  }
  // ============================================================
  // Pairing / Activate screen
  // ============================================================
  function renderPairing(notice) {
    var emailNote = state.identity && state.identity.email
      ? COPY.ACTIVATE_SIGNED_IN + '<strong>' + esc(state.identity.email) + '</strong>.'
      : esc(COPY.ACTIVATE_NO_EMAIL);
    rootEl.innerHTML =
      '<div class="ft-card">' +
        '<h3>' + esc(COPY.ACTIVATE_TITLE) + '</h3>' +
        (notice ? '<div class="ft-note">' + esc(notice) + '</div>' : '') +
        '<p class="ft-sub">' + emailNote + ' ' + esc(COPY.ACTIVATE_SUB) + '</p>' +
        (state.identity && state.identity.email ? '' : '<input type="email" id="ft-email" placeholder="Your email" />') +
        '<input type="text" id="ft-token" placeholder="Activation code (from your welcome email)" />' +
        '<button id="ft-activate">' + esc(COPY.ACTIVATE_BUTTON) + '</button>' +
        '<div class="ft-msg" id="ft-pair-msg"></div>' +
      '</div>';
    document.getElementById('ft-activate').addEventListener('click', function () {
      var manualEmail = document.getElementById('ft-email');
      if (manualEmail && manualEmail.value) {
        state.identity = state.identity || {};
        state.identity.email = manualEmail.value.trim().toLowerCase();
      }
      var t = document.getElementById('ft-token').value.trim();
      if (!t) return setMsg('ft-pair-msg', COPY.ACTIVATE_NEED_CODE, false);
      state.token = t;
      setMsg('ft-pair-msg', 'Checking\u2026', true);
      callGateway({ action: 'activate' }).then(function (data) {
        if (!data.ok) return setMsg('ft-pair-msg', data.error, false);
        writeLS(LS.token, t);
        clearStateCache();
        rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
        loadState(false);
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
  function setBodyTarget(holderId, html) {
    var el = holderId ? document.getElementById(holderId) : document.getElementById('ft-body');
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
  // ============================================================
  // Styles — v5 spacing + legibility pass
  // ============================================================
  function injectStyles() {
    if (document.getElementById('ft-styles')) return;
    var css =
      '#freedom-tracker{max-width:620px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a2733;line-height:1.55;text-align:left;}' +
      '#freedom-tracker .ft-card{background:#fff;border:1px solid #d8e0e7;border-radius:12px;padding:20px;text-align:left;}' +
      '#freedom-tracker h3{margin:0 0 6px 0;font-size:19px;text-align:left;}' +
      '#freedom-tracker h4{margin:8px 0 12px 0;font-size:17px;text-align:left;}' +
      '#freedom-tracker .ft-center-h{text-align:center;}' +
      '#freedom-tracker .ft-sub{font-size:13.5px;color:#5b6b7a;margin:0 0 12px 0;text-align:left;}' +
      '#freedom-tracker .ft-body-text{font-size:15px;margin:0 0 12px 0;text-align:left;}' +
      '#freedom-tracker .ft-intro{margin-bottom:8px;}' +
      '#freedom-tracker .ft-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;}' +
      '#freedom-tracker select{border:1px solid #c4cfd9;border-radius:8px;padding:10px;font-size:16px;}' +
      '#freedom-tracker .ft-chips{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 22px 0;}' +
      '#freedom-tracker .ft-chip{background:#eef3f6;color:#1a2733;border:1px solid #d8e0e7;border-radius:999px;padding:9px 14px;font-size:14px;cursor:pointer;width:auto;position:relative;min-height:0;margin:0;}' +
      '#freedom-tracker .ft-chip-today{border-color:#1f6f5c;font-weight:700;}' +
      '#freedom-tracker .ft-chip-active{background:#1f6f5c;color:#fff;border-color:#1f6f5c;}' +
      '#freedom-tracker .ft-chip-dot::after{content:"";position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:#d99a2b;}' +
      '#freedom-tracker .ft-chip-static{cursor:default;}' +
      '#freedom-tracker .ft-chip-done{border-color:#1f6f5c;color:#1f6f5c;font-weight:600;}' +
      '#freedom-tracker .ft-field{margin-bottom:18px;text-align:left;}' +
      '#freedom-tracker .ft-label{display:block;font-size:15.5px;font-weight:700;margin-bottom:6px;text-align:left;}' +
      '#freedom-tracker .ft-check{display:flex;align-items:flex-start;gap:10px;font-size:15.5px;text-align:left;cursor:pointer;}' +
      '#freedom-tracker .ft-check input{margin-top:2px;width:22px;height:22px;flex:none;accent-color:#1f6f5c;cursor:pointer;}' +
      '#freedom-tracker input[type=text],#freedom-tracker input[type=email],#freedom-tracker input[type=number],#freedom-tracker textarea{width:100%;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:8px;padding:11px;font-size:16px;text-align:left;font-family:inherit;color:inherit;}' +
      '#freedom-tracker textarea{resize:vertical;}' +
      '#freedom-tracker button{background:#1f6f5c;color:#fff;border:none;border-radius:8px;padding:12px 18px;font-size:16px;font-weight:700;cursor:pointer;width:100%;margin-top:14px;min-height:44px;}' +
      '#freedom-tracker button:active{opacity:.85;}' +
      '#freedom-tracker .ft-linkbtn{background:none;border:none;color:#1f6f5c;text-decoration:underline;font-size:14px;font-weight:700;cursor:pointer;width:auto;padding:0;margin:0;display:inline;min-height:0;}' +
      '#freedom-tracker .ft-copybtn{margin-top:8px;}' +
      '#freedom-tracker .ft-msg{font-size:14px;margin-top:8px;min-height:18px;text-align:left;}' +
      '#freedom-tracker .ft-good{color:#1f6f5c;}' +
      '#freedom-tracker .ft-bad{color:#b3392f;}' +
      '#freedom-tracker .ft-note{background:#fdf6e3;border:1px solid #ead9a6;border-radius:8px;padding:10px 12px;font-size:14px;margin-bottom:14px;text-align:left;}' +
      '#freedom-tracker .ft-grounding{background:#eef6f3;border:1px solid #bcd9cf;border-radius:8px;padding:10px 12px;font-size:15px;margin-bottom:14px;text-align:left;}' +
      '#freedom-tracker .ft-center{text-align:center;color:#5b6b7a;font-size:14.5px;padding:8px 0;}' +
      '#freedom-tracker .ft-scores-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:7px;align-items:center;margin-bottom:7px;}' +
      '#freedom-tracker .ft-scores-head{font-size:13px;font-weight:700;color:#5b6b7a;}' +
      '#freedom-tracker .ft-score-label{font-size:13.5px;text-align:left;}' +
      '#freedom-tracker .ft-dots{display:flex;align-items:center;gap:6px;margin-bottom:14px;}' +
      '#freedom-tracker .ft-dot{width:10px;height:10px;border-radius:50%;background:#d8e0e7;}' +
      '#freedom-tracker .ft-dot-on{background:#1f6f5c;}' +
      '#freedom-tracker .ft-dots-label{font-size:13px;color:#5b6b7a;margin-left:5px;}' +
      '#freedom-tracker .ft-goal{background:#eef6f3;border:1px solid #bcd9cf;border-radius:8px;padding:12px 14px;font-size:15.5px;margin-bottom:16px;text-align:left;}' +
      '#freedom-tracker .ft-dayscores{background:#f4f7f9;border-radius:10px;padding:14px;margin:6px 0 14px 0;text-align:left;}' +
      '#freedom-tracker .ft-traj-box{background:#eef6f3;border:1px solid #bcd9cf;border-radius:10px;padding:14px;margin-bottom:16px;text-align:left;}' +
      '#freedom-tracker .ft-traj{font-size:15.5px;margin-bottom:5px;text-align:left;}' +
      '#freedom-tracker .ft-traj-label{font-weight:700;}' +
      '#freedom-tracker .ft-guide{background:#f4f7f9;border:1px solid #d8e0e7;border-radius:10px;padding:14px;margin-bottom:16px;text-align:left;}' +
      '#freedom-tracker .ft-promptbox{background:#fff;border:1px dashed #1f6f5c;border-radius:10px;padding:12px;margin:10px 0;text-align:left;}' +
      '#freedom-tracker .ft-prompt{background:#f9fbfa;font-size:15px;}' +
      '#freedom-tracker .ft-ol{font-size:15.5px;margin:0 0 14px 0;padding-left:24px;text-align:left;}' +
      '#freedom-tracker .ft-ol li{margin-bottom:6px;}' +
      '#freedom-tracker .ft-title-gap{margin-bottom:18px;}' +
      '#freedom-tracker .ft-divider{border-top:1px dashed #c4cfd9;margin:18px 0;}' +
      '#freedom-tracker .ft-step-h{font-size:15.5px;font-weight:700;margin:18px 0 6px 0;text-align:left;}' +
      '#freedom-tracker .ft-completebox{border:2px dashed #1f6f5c;border-radius:10px;padding:16px;margin-top:24px;text-align:left;}' +
      '#freedom-tracker .ft-completebox h4{margin-top:0;}' +
      '#freedom-tracker .ft-planwrap{margin-top:24px;}' +
      '#freedom-tracker .ft-plan-p{margin-bottom:12px;}' +
      '#freedom-tracker .ft-ul{font-size:15.5px;margin:0 0 14px 0;padding-left:24px;text-align:left;}' +
      '#freedom-tracker .ft-ul li{margin-bottom:6px;}' +
      '#freedom-tracker .ft-group-h{margin-top:24px;}' +
      '#freedom-tracker .ft-scores-h{margin:0 0 16px 0;}' +
      '#freedom-tracker .ft-tool-note{color:#5b6b7a;font-style:italic;font-weight:400;}';
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
