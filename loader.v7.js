/* ============================================================
   FREEDOM TRACKER LOADER v7 — host on GitHub Pages as
   loader.v7.js. Update lesson stubs to point here.
   Stub (per lesson):
     <div id="freedom-tracker" data-view="full"></div>
     <script src="https://USER.github.io/freedom-tracker/loader.v7.js"><\/script>

   Pairs with Gateway v6.3 (+ CoachGateway / CoachFlow / GatewayReflections).

   WHAT'S IN v7 (consolidates everything since v6)
   ------------------------------------------------------------
   - All of v6: iframe-aware identity, touchless recover, cache-then-
     refresh, optimistic saves, the 4-step wizard, every day/guidance/
     scores/evaluation/goalplan view, copy buttons, project picker,
     read-only window banner.
   - PHASE 2 (long timelines): WEEK-GROUPED NAVIGATION. The flat Day 0-7
     chip strip becomes one week of day-chips at a time, with a
     prev/next-week stepper (hidden while there's only one week), and
     "Today" as the default surface (the week shown follows the day being
     viewed, which starts on the current day). Captures maxTrackedDay so
     the day axis runs far past 7. Long-term-safe header copy.
   - PHASE 6 (long-term surfaces):
       * REFLECTIONS view + tab: one reverse-chron list of richness
         entries, with a band marking the recent days the coach is
         looking at. Scrolling is the navigation. (data-view="reflections"
         and a navigator tab.)
       * Ongoing PROGRESS movement: the Progress view shows all-time
         (since you started) and last-7-day score movement, from the
         Gateway's progressReview. Days-completed extends past Day 7.
   - UNLIMITED PROJECTS + CONFIDENCE OPT-OUT (pairs with Gateway v6.4):
       * Project dropdown shows the behavior-derived label ("label" from
         the Gateway) and, for entitled (unlimited) students, a
         "+ Start a new project" option that creates a project in place
         and drops into the setup wizard. Entitlement comes ONLY from the
         Gateway state response (canCreateProject) - never decided here.
       * data-view="create-project": standalone card for its own lesson.
         Entitled -> the same creation flow. Not entitled -> storefront
         copy with optional buy/upgrade links (editable via the UI Copy
         tab: NEWPROJ_BUY_URL / NEWPROJ_UNLIMITED_URL).
       * Daily score cards offer "I'm 100% confident... never ask again."
         Checking it saves conf=10, stamps the per-user flag on the
         Gateway, and the confidence input stops rendering. Undo lives in
         Goal & Plan ("Ask me about my confidence score again").
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
    HEADER_TODAY: 'Day {DAY}',
    REFRESH_BTN: '↻ Refresh',
    REFRESH_DOING: 'Refreshing…',
    REFRESH_DONE: 'Updated ✓',
    WIZ1_TITLE: 'Welcome{NAME}! Let\u2019s set up your project.',
    WIZ1_LABEL: 'I want to make it easier and more enjoyable to be free from the following Unwanted Behavior (UB):',
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
    WIZ4_BUTTON: 'Let\u2019s Get Started \u2192',
    GOAL_TITLE: 'Your Goal & Plan',
    GOAL_LABEL: 'I want to make it easier and more enjoyable to be free from:',
    GOAL_JS_LABEL: 'Every morning, I\u2019ll do 30 seconds\u20132 minutes of rewiring (the Happiness & Success Jumpstart) at this moment:',
    GOAL_BUTTON: 'Update',
    GOAL_SAVED: 'Updated \u2713',
    GOAL_PREFIX: 'I want to make it easier and more enjoyable to be free from: ',
    GOAL_SUFFIX: '',
    GOAL_JS_PREFIX: 'Every morning, I\u2019ll do 30 seconds\u20132 minutes of rewiring (the Happiness & Success Jumpstart) at this moment: ',
    PLAN_TITLE: 'How This Works',
    PLAN_PARAS: [
      'There is no quit date. You can keep doing your behavior while you rewire your brain.',
      'Instead of quit dates, you do Freedom Experiments from Day 2 onwards. (A Freedom Experiment can be as simple as delaying your behavior for 2 seconds to see how it goes.)',
      'Day 1 takes about an hour. All days from Day 2 onwards take just 7 to 22 minutes each.',
      '<strong>The goal is simple for the first 7 days (the Freedom Proof Sprint):</strong> prove to yourself that you are powerful and capable, and that you can rewire your brain for freedom from an unwanted behavior.',
      'We only care whether you are <strong>more free</strong> from your behavior after 7 days (proof of capabilities), not completely free.',
      'Progress is measured by Freedom Scores recorded during your Daily Check-Ins.',
      'The richer your Daily Check-Ins, the more your AI Coach can help you.',
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
    DAILY_GUIDE_TITLE: 'Daily Rewiring Routine',
    DAILY_GUIDE_LEAD: 'Each day do:',
    DAILY_GUIDE_BULLETS: [
      'Happiness & Success Jumpstart',
      '5\u201320 minutes with the Rapid Behavioral Freedom tool and/or Fear & Anxiety Tool (can do more if you want)',
      'Freedom Experiments where you skip or delay doing your UB and see how it goes (even a 2-second delay counts)',
      'Daily Check-In'
    ],
    DAILY_PROMPT_LABEL: 'Starter prompt for the Rapid Behavioral Freedom tool:',
    DAILY_PROMPT: 'I want to be more free from the following behavior: {UB}. I want to make it easier and more enjoyable to not do it. Here\u2019s my current situation and more about what I\u2019m dealing with right now:',
    DAILY_PROMPT_TIP: 'Paste it in, then talk out whatever\u2019s going on \u2014 brain dumps work great.',
    GROUNDING: 'Here\u2019s what I did today to make it easier and more enjoyable to be free from: ',
    DAY0_UNLOCK_NOTE: 'Complete Day 0 below to unlock the rest of your Freedom Tracker.',
    COACH_INFO_NOTE: 'Your AI Coach helps you based on the information below.',
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
    // Read-only (past editing window)
    READONLY_BANNER: 'This sprint\u2019s editing window has closed. You can still read everything here any time.',
    // Touchless / setup-in-progress (recover returned notFound)
    SETUP_TITLE: 'Setting up your tracker\u2026',
    SETUP_TEXT: 'If you just purchased, your tracker is being created \u2014 give it a moment, then tap Retry. You\u2019ll also get an activation link by email.',
    SETUP_RETRY: 'Retry',
    SETUP_MANUAL: 'Have an activation code? Enter it instead.',
    ACTIVATE_TITLE: 'Activate your Freedom Tracker',
    ACTIVATE_SIGNED_IN: 'You are signed in as ',
    ACTIVATE_NO_EMAIL: 'Enter the email you bought with.',
    ACTIVATE_SUB: 'Your tracker activates automatically when you\u2019re signed in. Clicked your link on another device, or need to enter a code? Paste it below.',
    ACTIVATE_BUTTON: 'Activate',
    ACTIVATE_NEED_CODE: 'Enter your activation code.',
    STALE_TOKEN: 'We couldn\u2019t match your saved activation. We\u2019ll try to sign you in automatically, or you can enter your code below.',
    // Phase 6: Reflections + ongoing progress movement
    REFLECTIONS_TAB: 'Reflections',
    REFLECTIONS_TITLE: 'Your Reflections',
    REFLECTIONS_SUB: 'Everything you\u2019ve logged, newest first. Keep your recent days current to give your AI Coach the best picture. (Your AI Coach does NOT consider your \u201cNotes\u201d field. That is just for you.)',
    REFLECTIONS_EMPTY: 'Nothing logged yet. As you fill in your daily Wins, Experiments, and Opportunities, they\u2019ll gather here.',
    REFLECTIONS_COACH_BAND: 'YOUR AI COACH LOOKS AT THESE RECENT DAYS',
    REFLECTIONS_OLDER: 'Earlier days',
    REFLECT_WINS: 'Wins',
    REFLECT_EXP: 'Experiments',
    REFLECT_OPP: 'Opportunities or Concerns',
    REFLECT_NOTES: 'Notes',
    PROGRESS_MOVE_TITLE: 'Your movement',
    PROGRESS_MOVE_ALLTIME: 'Since you started',
    PROGRESS_MOVE_LAST7: 'Over the last 7 days',
    NEWPROJ_OPTION: '+ Start a new project',
    NEWPROJ_CONFIRM_TITLE: 'Start a new project?',
    NEWPROJ_CONFIRM_TEXT: 'This sets up a fresh project for a new behavior, with its own tracker, baseline, and daily check-ins. Your current project keeps going exactly as it is.',
    NEWPROJ_CONFIRM_BUTTON: 'Start my new project →',
    NEWPROJ_CANCEL: 'Not now',
    NEWPROJ_CREATING: 'Setting up your new project… this can take about half a minute.',
    NEWPROJ_TIME_NOTE: 'Heads up: creating a new project takes about 30–45 seconds, because it builds you a brand-new Freedom Tracker behind the scenes. Only tap below if you really want to start a new project right now.',
    NEWPROJ_LOCKED_TITLE: 'Want to work on another behavior?',
    NEWPROJ_LOCKED_TEXT: 'Creating additional projects isn’t part of your current access.',
    NEWPROJ_BUY_LABEL: 'Get another project',
    NEWPROJ_BUY_URL: '',         // set via the UI Copy tab when the funnel page exists
    NEWPROJ_UNLIMITED_LABEL: 'Go unlimited',
    NEWPROJ_UNLIMITED_URL: '',   // set via the UI Copy tab when the upgrade page exists
    NEWPROJ_LOCKED_FALLBACK: 'Reply to any of my emails and I’ll help you get set up.',
    CONF_OPTOUT_LABEL: 'I’m 100% confident I can rewire my brain for greater freedom — no need to ever ask me again.',
    CONF_ASK_AGAIN: 'Ask me about my confidence score again',
    CONF_ASK_AGAIN_DONE: 'Got it — the confidence question is back.'
  };

  // Cache versions kept at v6 keys (schema is compatible).
  var LS = { identity: 'ag_ft_identity_v6', token: 'ag_ft_token', cache: 'ag_ft_cache_v6' };

  var state = {
    identity: null, token: null,
    view: 'full', fixedDay: null,
    projects: [], activeProjectId: null,
    currentDay: 0, maxDay: 7, maxTrackedDay: 7,
    canCreateProject: false,  // unlimited entitlement, from the Gateway only
    confidence: { optedOut: false, since: '' },   // per-user, from the Gateway
    writable: true,           // active project still in its editing window?
    setup: { stage: 0, ub: '', jumpstart: '' },
    scoreQuestions: null,
    prompts: null,
    completion: null,
    viewingDay: null, viewingWeek: null, dayData: null, scores: null,
    reflections: null,
    tab: 'day',
    dirty: false,             // student has unsaved edits; block re-renders
    _recoverTried: false,     // guards against recover<->state loops
    _refreshing: false,       // soft-refresh in flight
    _refreshFlash: false      // next header render confirms with "Updated"
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
  // Strip ag_token from the visible URL so the strong credential does
  // not linger in history/referrer. Harmless if we cannot modify the URL.
  function stripTokenFromUrl() {
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.has('ag_token')) {
        url.searchParams.delete('ag_token');
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (e) {}
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
          currentDay: state.currentDay, maxDay: state.maxDay, maxTrackedDay: state.maxTrackedDay,
          canCreateProject: state.canCreateProject,
          confidence: state.confidence,
          writable: state.writable,
          setup: state.setup, scoreQuestions: state.scoreQuestions,
          prompts: state.prompts,
          uiCopy: state.uiCopy || null,
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
    state.maxTrackedDay = snap.maxTrackedDay || snap.maxDay || 7;
    state.canCreateProject = snap.canCreateProject === true;
    state.confidence = snap.confidence || { optedOut: false, since: '' };
    state.writable = (snap.writable === false) ? false : true;
    state.setup = snap.setup || state.setup;
    state.scoreQuestions = snap.scoreQuestions || null;
    state.prompts = snap.prompts || null;
    state.completion = snap.completion || null;
    if (snap.uiCopy) { state.uiCopy = snap.uiCopy; applyUiCopy(snap.uiCopy); }
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
    } else if (dv === 'create-project' || dv === 'createproject') {
      state.view = 'createproject';
    } else if (['today', 'progress', 'goalplan', 'full', 'setup', 'evaluate', 'reflections'].indexOf(dv) >= 0) {
      state.view = (dv === 'setup') ? 'full' : dv;
    }
    handleResetParam();
    captureMagicLinkToken();
    stripTokenFromUrl();
    state.token = readLS(LS.token);
    rootEl.addEventListener('input', function () { state.dirty = true; });

    // FAST PAINT: when a token, a cached identity, AND a cached state snapshot
    // are all on this device, paint from cache IMMEDIATELY (zero network), then
    // verify identity + refresh state in the background. This removes the two
    // Systeme identity fetches from the critical path of a returning student.
    var cachedId = readIdentityCache();
    var cachedSnap = state.token ? readStateCache() : null;
    if (state.token && cachedId && cachedSnap) {
      state.identity = cachedId;
      hydrateFromCache(cachedSnap.snapshot);
      if (cachedSnap.snapshot.firstName && !state.identity.firstName) {
        state.identity.firstName = cachedSnap.snapshot.firstName;
      }
      route();                              // instant, from cache
      verifyIdentityThenRefresh_(cachedId); // background: confirm + re-pull
      return;
    }

    // SLOW PATH: nothing to paint from -> fetch identity first, then load.
    getIdentity().then(function (identity) {
      state.identity = identity;
      if (!state.token) {
        // TOUCHLESS: try to find this logged-in student by session
        // identity before ever showing an activation screen.
        return attemptRecover('');
      }
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
  // TOUCHLESS RECOVER
  // ============================================================
  function attemptRecover(notice) {
    state._recoverTried = true;
    var haveIdentity = state.identity && (state.identity.accountId || state.identity.email);
    if (!haveIdentity) { return renderPairing(notice || ''); }
    rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
    callGateway({ action: 'recover' }).then(function (data) {
      if (data.ok && data.token) {
        persistTokenFromResponse(data);
        clearStateCache();
        rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
        loadState(false);
        return;
      }
      if (data.ok && data.notFound) { return renderSettingUp(); }
      if (data.rateLimited) { return renderPairing(data.error || notice || ''); }
      return renderPairing(notice || data.error || '');
    }).catch(function () {
      renderPairing(notice || '');
    });
  }

  function persistTokenFromResponse(data) {
    if (data && data.token && data.token !== state.token) {
      state.token = data.token;
      writeLS(LS.token, data.token);
    }
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
        return readIdentityCache() || { accountId: '', email: '', firstName: '' };
      });
  }

  // Background verify for the fast-paint path. Fetch the fresh Systeme identity;
  // if it names a DIFFERENT student than the cached one we painted from, drop
  // the token + caches and recover cleanly (new person on a shared device).
  // Otherwise adopt the fresh identity and do the normal background refresh.
  // If Systeme is unreachable, keep the cached paint and still refresh state.
  function verifyIdentityThenRefresh_(paintedId) {
    fetchSystemeIdentity().then(function (fresh) {
      writeLS(LS.identity, JSON.stringify({ v: fresh, at: Date.now() }));
      if (!identityMatches_(paintedId, fresh)) {
        resetTokenOnly();
        clearStateCache();
        state.identity = fresh;
        return attemptRecover('');
      }
      state.identity = fresh;
      loadState(true);
    }).catch(function () {
      loadState(true);   // keep the cached identity + paint, still re-pull state
    });
  }

  // Same student? Prefer the permanent accountId; fall back to email. When
  // there isn't enough to compare, treat as a match (never nuke on ambiguity).
  function identityMatches_(a, b) {
    a = a || {}; b = b || {};
    var aid = String(a.accountId || ''), bid = String(b.accountId || '');
    if (aid && bid) { return aid === bid; }
    var ae = String(a.email || '').toLowerCase(), be = String(b.email || '').toLowerCase();
    if (ae && be) { return ae === be; }
    return true;
  }
  function fetchSystemeIdentity() {
    return Promise.all([
      fetch('/api/user/user-data', { credentials: 'same-origin' }).then(asJson),
      fetch('/api/settings/profile', { credentials: 'same-origin' }).then(asJson)
    ]).then(function (results) {
      var userData = results[0] || {};
      var profile = (results[1] && results[1].user) || {};
      var id = {
        accountId: String(userData.id || ''),     // the permanent integer id
        email: String(profile.email || '').toLowerCase(),
        firstName: String(profile.firstName || userData.firstName || '')
      };
      if (!id.accountId && !id.email) throw new Error('No identity in response');
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
  // ============================================================
  // LIVE COPY OVERRIDES — merge sheet-driven copy over the baked COPY.
  // The Gateway's "UI Copy" tab ships its loader slice in state.uiCopy.loader.
  // BAKED_COPY is the pristine default captured once; COPY is recomputed from
  // it on every apply, so removing a sheet row reverts cleanly to the default.
  // An empty/missing override always falls back to the baked string, so a bad
  // or empty cell can never blank the UI.
  // ============================================================
  var BAKED_COPY = null;
  function deepMergeCopy(base, over) {
    if (over == null || typeof over !== 'object') return base;
    var out = {}, k;
    for (k in base) { if (base.hasOwnProperty(k)) out[k] = base[k]; }
    for (k in over) {
      if (!over.hasOwnProperty(k)) continue;
      var ov = over[k];
      if (ov == null || ov === '') continue;
      // [hide] blanks a line out (a blank cell falls back to the default).
      if (typeof ov === 'string' && ov.trim().toLowerCase() === '[hide]') { out[k] = ''; continue; }
      var bv = base ? base[k] : undefined;
      var bvIsArr = Object.prototype.toString.call(bv) === '[object Array]';
      var ovIsObj = ov && typeof ov === 'object' && Object.prototype.toString.call(ov) !== '[object Array]';
      var bvIsObj = bv && typeof bv === 'object' && !bvIsArr;
      if (bvIsArr && typeof ov === 'string') { out[k] = ov.split('\n'); }
      else if (bvIsObj && ovIsObj) { out[k] = deepMergeCopy(bv, ov); }
      else { out[k] = ov; }
    }
    return out;
  }
  function applyUiCopy(uiCopy) {
    if (!BAKED_COPY) BAKED_COPY = COPY;   // capture pristine on first apply
    COPY = deepMergeCopy(BAKED_COPY, uiCopy && uiCopy.loader);
  }

  function callGateway(payload) {
    payload.appKey = CONFIG.APP_KEY;
    payload.accountId = (state.identity && state.identity.accountId) || '';
    payload.email = (state.identity && state.identity.email) || '';
    payload.token = state.token || '';
    return fetch(CONFIG.GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(asJson);
  }
  function loadState(background) {
    var payload = { action: 'state', projectId: state.activeProjectId };
    // Student Refresh sets _forceFresh so the Gateway drops its short-lived
    // registry/UI-Copy caches and re-reads the sheets for a truly fresh pull.
    // One-shot: cleared here so only the refresh call carries it.
    if (state._forceFresh) { payload.fresh = true; state._forceFresh = false; }
    callGateway(payload)
      .then(function (data) {
        if (!data.ok) {
          if (background) return;                  // keep showing cache
          // Foreground failure: token likely stale/invalid. Try touchless
          // recover ONCE before falling back to the activation screen.
          resetTokenOnly();
          clearStateCache();
          if (state._recoverTried) { return renderPairing(COPY.STALE_TOKEN); }
          return attemptRecover(COPY.STALE_TOKEN);
        }
        state._recoverTried = false;
        if (data.uiCopy) { state.uiCopy = data.uiCopy; applyUiCopy(data.uiCopy); }
        persistTokenFromResponse(data);            // inline token persistence
        var before = JSON.stringify([state.setup, state.completion, state.currentDay, state.dayData, state.writable]);
        state.projects = data.projects || [];
        state.activeProjectId = data.activeProjectId;
        state.currentDay = data.currentDay;
        state.maxDay = data.maxDay || 7;
        state.maxTrackedDay = data.maxTrackedDay || data.maxDay || 7;
        state.canCreateProject = data.canCreateProject === true;
        if (data.confidence) state.confidence = data.confidence;
        state.writable = (data.writable === false) ? false : true;
        state.setup = data.setup || { stage: 0, ub: '', jumpstart: '' };
        state.scoreQuestions = data.scoreQuestions || null;
        state.prompts = data.prompts || state.prompts || null;
        state.completion = data.completion || state.completion;
        if (data.day) { cacheDay(data.day); if (!background || !state.dayData) state.dayData = data.day; }
        if (state.viewingDay == null) state.viewingDay = state.currentDay;
        writeStateCache();
        var after = JSON.stringify([state.setup, state.completion, state.currentDay, data.day || state.dayData, state.writable]);
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
  // SOFT REFRESH — student-facing "re-pull fresh data" control.
  // Clears ONLY the cached state snapshot + in-memory day cache, then
  // re-pulls from the Gateway. Deliberately KEEPS the activation token
  // and the active project, so the student stays signed in and on the
  // same project, just with fresh data. (The nuclear reset that also
  // drops the token stays behind AG_FT_RESET / ?ag_reset, for support.)
  // ============================================================
  function softRefresh() {
    if (state._refreshing) return;
    state._refreshing = true;

    var btn = document.getElementById('ft-refresh');
    if (btn) { btn.textContent = COPY.REFRESH_DOING; btn.disabled = true; }

    // Drop the snapshot + per-day cache so nothing stale can be reused.
    // Scores/reflections are re-fetched by their views, so null them too.
    state._dayCache = {};
    state.dayData = null;
    state.scores = null;
    state.reflections = null;
    clearStateCache();

    // Tell the next header render to confirm with "Updated".
    state._refreshFlash = true;
    state._refreshing = false;

    // Force the Gateway to bypass its server-side caches for this pull too.
    state._forceFresh = true;

    // Foreground reload: re-pulls state and re-routes the current view,
    // which (because the caches are gone) re-fetches the day/scores/
    // reflections fresh. The student stays on their current tab and day.
    loadState(false);
  }

  // ============================================================
  // Read-only helper (project past its editing window)
  // ============================================================
  function canEdit_() { return state.writable !== false; }
  function readOnlyBannerHtml() {
    return '<div class="ft-note ft-readonly">' + esc(COPY.READONLY_BANNER) + '</div>';
  }

  // ============================================================
  // Routing — wizard first, then the configured view
  // ============================================================
  function route() {
    state.dirty = false;
    if (state.view === 'createproject') {
      // Entitled + mid-setup: finish the current project's setup first (this
      // also stops a stack of half-configured projects). Everyone else gets
      // the creation card / storefront, wizard or not.
      if (state.canCreateProject && state.setup.stage < 4) return renderWizard();
      return renderCreateProjectView();
    }
    if (state.setup.stage < 4) return renderWizard();
    if (state.view === 'day') return renderFixedDayView(state.fixedDay);
    if (state.view === 'today') return renderTodayView();
    if (state.view === 'day1full') return renderDay1FullView();
    if (state.view === 'day1guidance') return renderDay1Guide();
    if (state.view === 'days2to7full') return renderDays2to7FullView();
    if (state.view === 'dailyguidance') return renderDailyGuideView();
    if (state.view === 'days2to7checkin') return renderDailyCheckinView();
    if (state.view === 'progress') return renderProgressView();
    if (state.view === 'evaluate') return renderEvaluateView();
    if (state.view === 'reflections') return renderReflectionsView();
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
          state.tab = 'day';
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
    var ro = !canEdit_();
    var html = (ro ? readOnlyBannerHtml() : '') +
      '<h3 class="ft-center-h ft-title-gap">' + esc(COPY.GOAL_TITLE) + '</h3>' +
      '<div class="ft-field"><label class="ft-label">' + esc(COPY.GOAL_LABEL) + '</label>' +
      '<textarea id="ft-goal-ub" rows="3"' + (ro ? ' readonly' : '') + '>' + esc(state.setup.ub) + '</textarea></div>' +
      '<div class="ft-field"><label class="ft-label">' + esc(COPY.GOAL_JS_LABEL) + '</label>' +
      '<input type="text" id="ft-goal-js" value="' + esc(state.setup.jumpstart) + '"' + (ro ? ' readonly' : '') + ' /></div>';
    if (!ro) {
      html += '<button id="ft-goal-save">' + esc(COPY.GOAL_BUTTON) + '</button>' +
              '<div class="ft-msg" id="ft-goal-msg"></div>';
    }
    if (state.confidence && state.confidence.optedOut) {
      // The confidence opt-out undo. User-level, so it lives here in the
      // editing hub rather than on any one day's card.
      html += '<p class="ft-sub"><button class="ft-linkbtn" id="ft-conf-again">' +
              esc(COPY.CONF_ASK_AGAIN) + '</button></p>';
    }
    return html + planHtml();
  }
  function wireGoalPlanSave() {
    var again = document.getElementById('ft-conf-again');
    if (again) {
      again.addEventListener('click', function () {
        again.disabled = true;
        callGateway({ action: 'setConfidence', optOut: false })
          .then(function (data) {
            if (!data.ok) { again.disabled = false; return; }
            state.confidence = { optedOut: false, since: '' };
            writeStateCache();
            again.textContent = COPY.CONF_ASK_AGAIN_DONE;
          })
          .catch(function () { again.disabled = false; });
      });
    }
    var btn = document.getElementById('ft-goal-save');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!canEdit_()) return setMsg('ft-goal-msg', COPY.READONLY_BANNER, false);
      var ub = document.getElementById('ft-goal-ub').value.trim();
      var js = document.getElementById('ft-goal-js').value.trim();
      if (!validText(ub)) return setMsg('ft-goal-msg', COPY.WIZ1_ERROR, false);
      if (!validText(js)) return setMsg('ft-goal-msg', COPY.WIZ3_ERROR, false);
      setMsg('ft-goal-msg', COPY.SAVED, true);   // optimistic
      state.dirty = false;
      callGateway({ action: 'updateGoals', projectId: state.activeProjectId, ub: ub, jumpstart: js })
        .then(function (data) {
          if (!data.ok) {
            if (data.windowClosed) { state.writable = false; writeStateCache(); renderGoalPlanView(); return; }
            return setMsg('ft-goal-msg', data.error, false);
          }
          state.setup.ub = data.ub;
          state.setup.jumpstart = data.jumpstart;
          writeStateCache();
          setMsg('ft-goal-msg', COPY.GOAL_SAVED, true);
        })
        .catch(function (err) { setMsg('ft-goal-msg', String(err), false); });
    });
  }

  // ============================================================
  // NEW PROJECT — creation flow (entitled) + storefront (locked).
  // Entitlement is the Gateway's call (state.canCreateProject); the
  // Gateway re-checks server-side, so this UI is presentation only.
  // ============================================================
  function renderCreateProjectView() {
    rootEl.innerHTML = '<div class="ft-card"><div id="ft-body">' +
      (state.canCreateProject ? createConfirmHtml(false) : createLockedHtml()) +
      '</div></div>';
    if (state.canCreateProject) wireCreateConfirm();
  }
  function createConfirmHtml(showCancel) {
    var timeNote = COPY.NEWPROJ_TIME_NOTE
      ? '<div class="ft-note">' + esc(COPY.NEWPROJ_TIME_NOTE) + '</div>' : '';
    // The "Not now" link only makes sense when there is somewhere to go back TO,
    // i.e. the dropdown-initiated create screen (returns to the live project).
    // The standalone create-project lesson has no prior view, so the caller
    // passes false and we omit what would otherwise be a dead link.
    var cancel = (showCancel === false) ? '' :
      '<p class="ft-sub"><button class="ft-linkbtn" id="ft-newproj-cancel">' + esc(COPY.NEWPROJ_CANCEL) + '</button></p>';
    return '<div class="ft-newproj">' +
      '<h4>' + esc(COPY.NEWPROJ_CONFIRM_TITLE) + '</h4>' +
      '<p class="ft-body-text">' + esc(COPY.NEWPROJ_CONFIRM_TEXT) + '</p>' +
      timeNote +
      '<button id="ft-newproj-go">' + esc(COPY.NEWPROJ_CONFIRM_BUTTON) + '</button>' +
      cancel +
      '<div class="ft-msg" id="ft-newproj-msg"></div></div>';
  }
  function createLockedHtml() {
    var html = '<h4>' + esc(COPY.NEWPROJ_LOCKED_TITLE) + '</h4>' +
      '<p class="ft-body-text">' + esc(COPY.NEWPROJ_LOCKED_TEXT) + '</p>';
    var links = '';
    if (COPY.NEWPROJ_BUY_URL) {
      links += '<p class="ft-body-text"><a href="' + esc(COPY.NEWPROJ_BUY_URL) +
        '" target="_blank" rel="noopener"><strong>' + esc(COPY.NEWPROJ_BUY_LABEL) + ' →</strong></a></p>';
    }
    if (COPY.NEWPROJ_UNLIMITED_URL) {
      links += '<p class="ft-body-text"><a href="' + esc(COPY.NEWPROJ_UNLIMITED_URL) +
        '" target="_blank" rel="noopener"><strong>' + esc(COPY.NEWPROJ_UNLIMITED_LABEL) + ' →</strong></a></p>';
    }
    return html + (links || '<p class="ft-body-text">' + esc(COPY.NEWPROJ_LOCKED_FALLBACK) + '</p>');
  }
  function wireCreateConfirm() {
    var go = document.getElementById('ft-newproj-go');
    var cancel = document.getElementById('ft-newproj-cancel');
    if (go) {
      go.addEventListener('click', function () {
        go.disabled = true;
        setMsg('ft-newproj-msg', COPY.NEWPROJ_CREATING, true);
        callGateway({ action: 'createProject' })
          .then(function (data) {
            if (!data.ok) {
              go.disabled = false;
              return setMsg('ft-newproj-msg', data.error, false);
            }
            // Fresh list arrives with the new project selected. Clear every
            // cache and reload: the new project is at setup stage 0, so the
            // student lands straight in the wizard to name the behavior.
            state._creatingSelected = false;   // we are now ON the new project
            state.projects = data.projects || state.projects;
            state.activeProjectId = data.activeProjectId || state.activeProjectId;
            state.viewingDay = null;
            state.viewingWeek = null;
            state.dayData = null;
            state._dayCache = {};
            clearStateCache();
            rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
            loadState(false);
          })
          .catch(function (err) {
            go.disabled = false;
            setMsg('ft-newproj-msg', String(err), false);
          });
      });
    }
    if (cancel) cancel.addEventListener('click', function () {
      state._creatingSelected = false;   // leaving create mode, back to the live project
      route();
    });
  }

  // Enter create mode from the project dropdown: the clean create screen — the
  // account header + dropdown reflecting "+ Start a new project", NO project
  // detail/chips below it, just the create card. A "Not now" returns to the
  // project you were on. Creation still happens only on an explicit confirm.
  function enterCreateMode() {
    state._creatingSelected = true;
    renderShell(createConfirmHtml(true), null);
    wireCreateConfirm();
  }

  // ============================================================
  // Shared shell
  // ============================================================
  function renderShell(contentHtml, chipsContent) {
    var name = (state.identity && state.identity.firstName) || '';
    var html = '<div class="ft-card">';
    html += '<div class="ft-head">';
    html += '<div><h3>' + (name ? esc(name) + '\u2019s ' : '') + 'Freedom Tracker</h3>';
    var dayText = esc(COPY.HEADER_TODAY.replace('{DAY}', state.currentDay));
    var refreshLabel = state._refreshFlash ? COPY.REFRESH_DONE : COPY.REFRESH_BTN;
    html += '<p class="ft-sub">' + dayText +
      ' <span class="ft-sep">·</span> ' +
      '<button class="ft-refreshlink" id="ft-refresh">' + esc(refreshLabel) + '</button></p></div>';
    if (state.projects.length > 1 || (state.canCreateProject && state.projects.length > 0)) {
      // Number projects by age (oldest = Project 1), list newest-first.
      var byOldest = state.projects.slice().sort(function (a, b) {
        var ad = String(a.day0Date || ''), bd = String(b.day0Date || '');
        if (ad !== bd) return ad < bd ? -1 : 1;
        return (b.currentDay || 0) - (a.currentDay || 0);
      });
      var ordinalById = {};
      for (var oi = 0; oi < byOldest.length; oi++) {
        ordinalById[byOldest[oi].projectId] = oi + 1;
      }
      var byNewest = state.projects.slice().sort(function (a, b) {
        var a2 = String(a.day0Date || ''), b2 = String(b.day0Date || '');
        if (a2 !== b2) return a2 < b2 ? 1 : -1;
        return (a.currentDay || 0) - (b.currentDay || 0);
      });
      html += '<select id="ft-project">';
      for (var i = 0; i < byNewest.length; i++) {
        var p = byNewest[i];
        // Behavior-derived label from the Gateway when it exists; "Project N"
        // for pre-label projects.
        var optLabel = p.label ? p.label : ('Project ' + ordinalById[p.projectId]);
        html += '<option value="' + esc(p.projectId) + '"' +
          (p.projectId === state.activeProjectId && !state._creatingSelected ? ' selected' : '') + '>' +
          esc(optLabel) + ' (Day ' + p.currentDay + ')</option>';
      }
      if (state.canCreateProject) {
        html += '<option value="__new__"' + (state._creatingSelected ? ' selected' : '') + '>' +
          esc(COPY.NEWPROJ_OPTION) + '</option>';
      }
      html += '</select>';
    }
    html += '</div>';
    if (chipsContent) html += chipsContent;
    html += '<div id="ft-body">' + (contentHtml || '') + '</div>';
    html += '</div>';
    rootEl.innerHTML = html;
    var picker = document.getElementById('ft-project');
    if (picker) {
      picker.addEventListener('change', function () {
        if (this.value === '__new__') {
          // Clean create screen: the dropdown reflects the "+ Start a new
          // project" selection, no project detail/chips below it, just the
          // create card. Creation only happens on an explicit confirm.
          enterCreateMode();
          return;
        }
        state._creatingSelected = false;
        state.activeProjectId = this.value;
        state.viewingDay = null;
        state.viewingWeek = null;
        state.dayData = null;
        state._dayCache = {};
        clearStateCache();
        rootEl.innerHTML = '<div class="ft-card ft-center">' + COPY.LOADING + '</div>';
        loadState(false);
      });
    }
    var refreshBtn = document.getElementById('ft-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', softRefresh);
    }
    if (state._refreshFlash) {
      // We just rendered the "Updated" confirmation. Consume the flag and
      // revert the control back to its idle label after a beat.
      state._refreshFlash = false;
      setTimeout(function () {
        var c = document.getElementById('ft-refresh');
        if (c) { c.textContent = COPY.REFRESH_BTN; c.disabled = false; }
      }, 2000);
    }
  }

  // ============================================================
  // WEEK-GROUPED NAVIGATION (Phase 2) + Reflections tab (Phase 6)
  //   Week 1   = Days 0-7. Week N>=2 = Days (7*(N-1)+1)..(7*N).
  //   "Today" is the default surface: the week shown follows the day
  //   being viewed on every full render. Arrows browse weeks locally
  //   without disturbing the day card below. The week stepper hides
  //   itself while there is only one week (the sprint).
  // ============================================================
  function renderNavigator() {
    state.viewingWeek = weekOfDay_(state.viewingDay == null ? state.currentDay : state.viewingDay);

    // Onboarding gate: a brand-new student (still on Day 0, Day 0 not yet
    // completed) sees ONLY the Day 0 card — no chips, no tabs. The full
    // navigator unlocks the moment Day 0 is complete (see wireDaySave).
    var day0Done = state.completion && state.completion[0];
    if (state.currentDay <= 0 && !day0Done) {
      state.tab = 'day';
      state.viewingDay = 0;
      renderShell('', null);
      state.dayData = (state._dayCache && state._dayCache[0]) || null;
      loadDayInto(0, {});
      return;
    }

    renderShell('', chipsHtml());
    wireChips();
    if (state.tab === 'goalplan') { setBody(goalPlanEditHtml()); wireGoalPlanSave(); }
    else if (state.tab === 'scores') { loadScoresInto(); }
    else if (state.tab === 'reflections') { loadReflectionsInto(); }
    else if (state.viewingDay >= 1) {
      setBody(dailyGuideHtml() + '<div id="ft-day-holder"></div>');
      wireCopyButtons();
      loadDayInto(state.viewingDay, { holder: 'ft-day-holder' });
    }
    else loadDayInto(state.viewingDay, {});
  }
  function weekOfDay_(d) {
    d = Number(d) || 0;
    return (d <= 7) ? 1 : (Math.floor((d - 1) / 7) + 1);
  }
  function daysInWeek_(w) {
    var days = [];
    if (w <= 1) { for (var d = 0; d <= 7; d++) days.push(d); }
    else { for (var d2 = 7 * (w - 1) + 1; d2 <= 7 * w; d2++) days.push(d2); }
    return days;
  }
  function maxWeek_() { return weekOfDay_(state.currentDay); }
  function clampWeek_(w) {
    if (w < 1) w = 1;
    var mx = maxWeek_();
    if (w > mx) w = mx;
    return w;
  }
  function chipsHtml() {
    return '<div class="ft-nav">' + chipsInnerHtml_() + '</div>';
  }
  function chipsInnerHtml_() {
    var week = clampWeek_(state.viewingWeek == null ? weekOfDay_(state.currentDay) : state.viewingWeek);
    state.viewingWeek = week;
    var top = (typeof state.maxTrackedDay === 'number' && state.maxTrackedDay) ? state.maxTrackedDay : 400;

    // Persistent tabs.
    var html = '<div class="ft-chips">';
    html += chip('goalplan', 'Goal & Plan', state.tab === 'goalplan', false, false);
    html += chip('scores', COPY.SCORES_TAB, state.tab === 'scores', false, false);
    html += chip('reflections', COPY.REFLECTIONS_TAB, state.tab === 'reflections', false, false);
    html += '</div>';

    // Week stepper (only when there is more than one week).
    var mx = maxWeek_();
    if (mx > 1) {
      html += '<div class="ft-weeknav">';
      html += '<button class="ft-weekarrow" data-week-step="-1"' + (week <= 1 ? ' disabled' : '') + '>\u2190</button>';
      html += '<span class="ft-weeklabel">Week ' + week + '</span>';
      html += '<button class="ft-weekarrow" data-week-step="1"' + (week >= mx ? ' disabled' : '') + '>\u2192</button>';
      html += '</div>';
    }

    // This week's day chips (capped at the tracked max).
    html += '<div class="ft-chips ft-weekdays">';
    var days = daysInWeek_(week);
    for (var i = 0; i < days.length; i++) {
      var d = days[i];
      if (d > top) break;
      var done = state.completion && state.completion[d];
      var attention = !done && d < state.currentDay;
      var active = state.tab === 'day' && d === state.viewingDay;
      html += chip('day-' + d, 'Day ' + d + (done ? ' \u2713' : ''), active, d === state.currentDay, attention);
    }
    html += '</div>';
    return html;
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
        if (id === 'reflections') { state.tab = 'reflections'; return renderNavigator(); }
        state.tab = 'day';
        state.viewingDay = Number(id.split('-')[1]);
        state.viewingWeek = weekOfDay_(state.viewingDay);
        state.dayData = (state._dayCache && state._dayCache[state.viewingDay]) || null;
        renderNavigator();
      });
    }
    var arrows = rootEl.querySelectorAll('[data-week-step]');
    for (var a = 0; a < arrows.length; a++) {
      arrows[a].addEventListener('click', function () {
        // Browse weeks WITHOUT disturbing the day card below; only the
        // chip strip re-renders. Clicking a day then commits the view.
        var cur = (state.viewingWeek == null) ? weekOfDay_(state.currentDay) : state.viewingWeek;
        state.viewingWeek = clampWeek_(cur + Number(this.getAttribute('data-week-step')));
        refreshChips();
      });
    }
  }
  function refreshChips() {
    var nav = rootEl.querySelector('.ft-nav');
    if (nav) { nav.innerHTML = chipsInnerHtml_(); wireChips(); }
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
  // Daily check-in: always lands on the actual current day (not clamped to 2-7).
  // Day 0 and Day 1 render as daily check-in cards here (variant 'daily');
  // everywhere else they keep their special cards. The daily variant for the low
  // days bypasses the shared day cache so it never collides with the special-card
  // version of the same day number.
  function renderDailyCheckinView() {
    var day = state.currentDay;
    if (day < 0) day = 0;
    if (day > state.maxTrackedDay) day = state.maxTrackedDay;
    renderShell('', null);
    state.viewingDay = day;
    state.dayData = (day <= 1) ? null : ((state._dayCache && state._dayCache[day]) || null);
    loadDayInto(day, { variant: 'daily' });
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
      promptBoxHtml(COPY.D1G_PROMPT_LABEL, (state.prompts && state.prompts.day1) || COPY.D1G_PROMPT, COPY.PROMPT_TIP) +
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
      promptBoxHtml(COPY.DAILY_PROMPT_LABEL, (state.prompts && state.prompts.daily) || COPY.DAILY_PROMPT, COPY.DAILY_PROMPT_TIP);
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
        // Then fetch ongoing movement (all-time + last-7) and inject at top.
        callGateway({ action: 'progressReview', projectId: state.activeProjectId })
          .then(function (pr) {
            if (pr && pr.ok && pr.hasData) {
              var box = document.getElementById('ft-progress-movement');
              if (box) box.innerHTML = progressMovementHtml(pr);
            }
          }).catch(function () {});
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }
  function progressHtml() {
    var html = '<h4>' + esc(COPY.PROGRESS_TITLE) + '</h4>';
    if (state.setup.ub) {
      html += '<p class="ft-body-text">' + esc(COPY.PROGRESS_UB) + '<strong>' + esc(state.setup.ub) + '</strong></p>';
    }
    html += '<div id="ft-progress-movement"></div>';   // filled by progressReview
    html += trajectoryHtml();
    if (state.completion) {
      html += '<h4>Days completed</h4><div class="ft-chips">';
      var topDay = Math.min(state.currentDay || 0, state.maxTrackedDay || 400);
      if (topDay < state.maxDay) topDay = state.maxDay;   // always show through the sprint
      for (var d = 0; d <= topDay; d++) {
        var done = state.completion[d];
        html += '<span class="ft-chip ft-chip-static' + (done ? ' ft-chip-done' : '') + '">Day ' + d + (done ? ' \u2713' : '') + '</span>';
      }
      html += '</div>';
    }
    html += '<h4 style="margin-top:16px;">All ' + esc(COPY.SCORES_TAB) + '</h4>' + scoresGridHtml();
    return html;
  }
  function progressMovementHtml(pr) {
    var metrics = [['easy', 'Easy'], ['enjoy', 'Enjoyable'], ['conf', 'Confidence']];
    function deltaRow(deltas) {
      var s = '';
      for (var m = 0; m < metrics.length; m++) {
        var d = deltas[metrics[m][0]];
        if (!d) continue;
        var chg = (d.change == null) ? '' : (' (' + (d.change >= 0 ? '+' : '') + d.change + ')');
        s += '<div class="ft-traj"><span class="ft-traj-label">' + metrics[m][1] + ':</span> ' +
          esc((d.from == null ? '?' : d.from) + ' \u2192 ' + d.to) + esc(chg) + '</div>';
      }
      return s;
    }
    var html = '<div class="ft-move-box"><div class="ft-move-title">' + esc(COPY.PROGRESS_MOVE_TITLE) + '</div>';
    if (pr.fromBaseline) {
      html += '<div class="ft-move-sub">' + esc(COPY.PROGRESS_MOVE_ALLTIME) + '</div>' + deltaRow(pr.fromBaseline);
    }
    if (pr.last7) {
      html += '<div class="ft-move-sub" style="margin-top:10px;">' + esc(COPY.PROGRESS_MOVE_LAST7) + '</div>' + deltaRow(pr.last7.deltas);
    }
    html += '</div>';
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
        setBody('<h4>' + esc(data.copy.tierTitle) + '</h4>' + deltasHtml + tierHtml);
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }

  // ============================================================
  // Reflections (Phase 6) — one reverse-chron list + coach band
  // ============================================================
  function renderReflectionsView() {
    renderShell('<div class="ft-center ft-sub">Loading your reflections\u2026</div>', null);
    loadReflectionsInto();
  }
  function loadReflectionsInto() {
    setBody('<div class="ft-center ft-sub">Loading your reflections\u2026</div>');
    callGateway({ action: 'reflections', projectId: state.activeProjectId })
      .then(function (data) {
        if (!data.ok) return setBody(badMsg(data.error));
        state.reflections = data;
        setBody(reflectionsHtml(data));
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }
  function reflectionsHtml(data) {
    var entries = data.entries || [];
    var html = '<h4>' + esc(COPY.REFLECTIONS_TITLE) + '</h4>' +
               '<p class="ft-sub">' + esc(COPY.REFLECTIONS_SUB) + '</p>';
    if (!entries.length) {
      return html + '<div class="ft-note">' + esc(COPY.REFLECTIONS_EMPTY) + '</div>';
    }
    var inWin = [], older = [];
    for (var i = 0; i < entries.length; i++) {
      (entries[i].inCoachWindow ? inWin : older).push(entries[i]);
    }
    if (inWin.length) {
      html += '<div class="ft-coachband">' + esc(COPY.REFLECTIONS_COACH_BAND) + '</div>';
      for (var a = 0; a < inWin.length; a++) html += reflectionEntryHtml(inWin[a], true);
    }
    if (older.length) {
      html += '<div class="ft-reflect-divider">' + esc(COPY.REFLECTIONS_OLDER) + '</div>';
      for (var b = 0; b < older.length; b++) html += reflectionEntryHtml(older[b], false);
    }
    return html;
  }
  function reflectionEntryHtml(e, inWin) {
    var html = '<div class="ft-reflect-entry' + (inWin ? ' ft-reflect-win' : '') + '">';
    html += '<div class="ft-reflect-day">Day ' + e.day + (e.date ? (' \u00b7 ' + esc(e.date)) : '') + '</div>';
    if (e.wins) html += reflectField_(COPY.REFLECT_WINS, e.wins);
    if (e.experiments) html += reflectField_(COPY.REFLECT_EXP, e.experiments);
    if (e.opportunities) html += reflectField_(COPY.REFLECT_OPP, e.opportunities);
    if (e.notes) html += reflectField_(COPY.REFLECT_NOTES, e.notes);
    html += '</div>';
    return html;
  }
  function reflectField_(label, text) {
    return '<div class="ft-reflect-field"><span class="ft-reflect-label">' + esc(label) + ':</span> ' +
      esc(text).replace(/\n/g, '<br>') + '</div>';
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
        setBody('<h4>' + esc(COPY.SCORES_TAB) + '</h4>' + (canEdit_() ? '' : readOnlyBannerHtml()) +
          '<p class="ft-sub">' + esc(COPY.SCORES_SUB) + '</p>' + scoresGridHtml());
        wireScoresSave();
      })
      .catch(function (err) { setBody(badMsg(String(err))); });
  }
  function scoresGridHtml() {
    var ro = !canEdit_();
    // Once confident-forever, the confidence column stays visible as history
    // but goes read-only: the Gateway fills 10s alongside any edit anyway.
    var confOut = state.confidence && state.confidence.optedOut;
    var html = '<div class="ft-scores-grid ft-scores-head"><div></div><div>Easy</div><div>Enjoyable</div><div>Confidence</div></div>';
    for (var i = 0; i < state.scores.length; i++) {
      var row = state.scores[i];
      html += '<div class="ft-scores-grid"><div class="ft-score-label">' + esc(row.label) + '</div>';
      var metrics = ['easy', 'enjoy', 'conf'];
      for (var m = 0; m < metrics.length; m++) {
        var v = row.values[metrics[m]];
        var lock = ro || (confOut && metrics[m] === 'conf' && row.key !== 'base');
        html += '<div><input type="number" min="0" max="10" step="1" data-cp="' + esc(row.key) + '" data-metric="' + metrics[m] + '" value="' + esc(v == null ? '' : v) + '"' + (lock ? ' readonly' : '') + ' /></div>';
      }
      html += '</div>';
    }
    if (!ro) {
      html += '<button id="ft-save-scores">' + esc(COPY.SAVE_SCORES_BUTTON) + '</button><div class="ft-msg" id="ft-scores-msg"></div>';
    }
    return html;
  }
  function wireScoresSave() {
    var btn = document.getElementById('ft-save-scores');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!canEdit_()) return setMsg('ft-scores-msg', COPY.READONLY_BANNER, false);
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
          if (!data.ok) {
            if (data.windowClosed) { state.writable = false; writeStateCache(); loadScoresInto(); return; }
            return setMsg('ft-scores-msg', data.error, false);
          }
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
    var variant = opts.variant || null;
    // The daily-check-in variant for Day 0/1 produces a DIFFERENT card than the
    // special get-ready / Power Hour version of the same day, so it must not read
    // or write the shared day cache (which is keyed by day number only).
    var bypassCache = (variant === 'daily' && day <= 1);
    var cached = (!bypassCache && state._dayCache) ? state._dayCache[day] : null;
    if (cached) {
      state.dayData = cached;
      renderDayCard(cached, opts);
      callGateway(getDayPayload_(day, variant))
        .then(function (data) {
          if (!data.ok) return;
          if (!bypassCache) cacheDay(data.day);
          if (state.viewingDay === day && safeToRerender() &&
              JSON.stringify(data.day) !== JSON.stringify(cached)) {
            state.dayData = data.day;
            renderDayCard(data.day, opts);
          }
        }).catch(function () {});
      return;
    }
    setBodyTarget(opts.holder, '<div class="ft-center ft-sub">Loading Day ' + day + '\u2026</div>');
    callGateway(getDayPayload_(day, variant))
      .then(function (data) {
        if (!data.ok) return setBodyTarget(opts.holder, badMsg(data.error));
        state.dayData = data.day;
        if (!bypassCache) cacheDay(data.day);
        renderDayCard(data.day, opts);
      })
      .catch(function (err) { setBodyTarget(opts.holder, badMsg(String(err))); });
  }
  function getDayPayload_(day, variant) {
    var payload = { action: 'getDay', projectId: state.activeProjectId, day: day };
    if (variant) payload.variant = variant;
    return payload;
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
  function renderDay0Card(dd, opts) {
    var ro = !canEdit_();
    var html = '<h4>' + esc(dd.title) + '</h4>';
    if (ro) html += readOnlyBannerHtml();
    if (dd.day < state.currentDay) html += '<div class="ft-note">' + esc(COPY.PAST_DAY_NOTE) + '</div>';
    else if (dd.day > state.currentDay) html += '<div class="ft-note">' + esc(COPY.FUTURE_DAY_NOTE) + '</div>';
    var ub = state.setup.ub || 'your unwanted behavior';
    if ((state.currentDay <= 0) && !(state.completion && state.completion[0])) {
      html += '<div class="ft-note ft-unlocknote">' + esc(COPY.DAY0_UNLOCK_NOTE) + '</div>';
    }
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
      '<div class="ft-field"><label class="ft-check"><input type="checkbox" data-key="d0_all"' + (checked ? ' checked' : '') + (ro ? ' disabled' : '') + ' /> <span>' + esc(fieldLabel_(dd, 'd0_all')) + '</span></label></div>' +
      '<div class="ft-step-h">' + esc(COPY.DAY0.PREP_HEADER) + '</div>' +
      '<p class="ft-body-text">' + esc(COPY.DAY0.PREP_TEXT1) + '</p>' +
      '<p class="ft-body-text">' + esc(COPY.DAY0.PREP_TEXT2) + '</p>' +
      '<div class="ft-field"><label class="ft-label">' + esc(fieldLabel_(dd, 'd0_ph_plan')) + '</label>' +
      '<input type="text" data-key="d0_ph_plan" value="' + esc(ph) + '"' + (ro ? ' readonly' : '') + ' /></div>' +
      (ro ? '' : '<button id="ft-save">' + esc(btnLabel) + '</button><div class="ft-msg" id="ft-save-msg"></div>') +
      '</div>';
    setBodyTarget(opts.holder, html);
    if (!ro) wireDaySave(dd, opts);
  }
  function renderDayCard(dd, opts) {
    if (dd.day === 0 && !dd.gridDay) return renderDay0Card(dd, opts);
    var ro = !canEdit_();
    var html = '<h4>' + esc(dd.title) + '</h4>';
    if (ro) html += readOnlyBannerHtml();
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
    if ((dd.day >= 1 || dd.gridDay) && state.setup.ub) {
      html += '<div class="ft-grounding">' + esc(COPY.GROUNDING) + '<strong>' + esc(state.setup.ub) + '</strong></div>';
      if (dd.day >= 2 || dd.gridDay) {
        html += '<p class="ft-sub ft-coach-note">' + esc(COPY.COACH_INFO_NOTE) + '</p>';
      }
      html += '<div class="ft-divider"></div>';
    }
    if (dd.day === 1 && !dd.gridDay) html += '<div class="ft-step-h">' + esc(COPY.D1_TOOLS_HEADER) + '</div>';
    for (var i = 0; i < dd.fields.length; i++) {
      var f = dd.fields[i];
      if ((dd.day >= 2 || dd.gridDay) && f.key === 'jumpstart') html += '<h4 class="ft-center-h ft-group-h">' + esc(COPY.SECTION_KEY_EFFORTS) + '</h4>';
      if ((dd.day >= 2 || dd.gridDay) && f.key === 'wins') html += '<h4 class="ft-center-h ft-group-h">' + esc(COPY.SECTION_REFLECTION) + '</h4>';
      if (f.missing) {
        html += '<div class="ft-field ft-sub">\u26a0 "' + esc(f.label) + '" isn\u2019t wired up yet (named range missing).</div>';
        continue;
      }
      html += '<div class="ft-field">';
      if (f.intro) html += '<p class="ft-body-text ft-intro">' + esc(f.intro) + '</p>';
      if (f.type === 'check') {
        html += '<label class="ft-check"><input type="checkbox" data-key="' + esc(f.key) + '"' + (f.value ? ' checked' : '') + (ro ? ' disabled' : '') + ' /> <span>' + esc(f.label) + '</span></label>';
      } else if (f.type === 'number') {
        html += '<label class="ft-label">' + esc(f.label) + '</label><input type="number" min="0" step="1" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '"' + (ro ? ' readonly' : '') + ' />';
      } else if (f.type === 'textarea') {
        html += '<label class="ft-label">' + esc(f.label) + '</label><textarea rows="3" data-key="' + esc(f.key) + '"' + (ro ? ' readonly' : '') + '>' + esc(f.value == null ? '' : f.value) + '</textarea>';
      } else {
        html += '<label class="ft-label">' + esc(f.label) + '</label><input type="text" data-key="' + esc(f.key) + '" value="' + esc(f.value == null ? '' : f.value) + '"' + (ro ? ' readonly' : '') + ' />';
      }
      html += '</div>';
    }
    if (dd.scores) {
      // Confidence opt-out: once the student has declared complete confidence
      // (per-user flag from the Gateway), the confidence question stops
      // rendering - the Gateway writes conf=10 alongside their real scores.
      var confOut = state.confidence && state.confidence.optedOut;
      html += '<div class="ft-dayscores"><h4 class="ft-center-h ft-scores-h">' + esc(dd.scores.label) + '</h4>';
      var mks = confOut ? ['easy', 'enjoy'] : ['easy', 'enjoy', 'conf'];
      var qs = dd.scores.questions || state.scoreQuestions || {};
      for (var m = 0; m < mks.length; m++) {
        var v = dd.scores.values[mks[m]];
        html += '<div class="ft-field"><label class="ft-label">' + esc(qs[mks[m]] || mks[m]) + '</label>' +
          '<input type="number" min="0" max="10" step="1" data-dayscore="' + mks[m] + '" value="' + esc(v == null ? '' : v) + '"' + (ro ? ' readonly' : '') + ' /></div>';
      }
      if (!confOut && !ro) {
        html += '<div class="ft-field"><label class="ft-check"><input type="checkbox" data-confforever />' +
          ' <span>' + esc(COPY.CONF_OPTOUT_LABEL) + '</span></label></div>';
      }
      html += '</div>';
    }
    if (!ro) html += '<button id="ft-save">Save Day ' + dd.day + '</button><div class="ft-msg" id="ft-save-msg"></div>';
    setBodyTarget(opts.holder, html);
    var catchup = document.getElementById('ft-catchup');
    if (catchup) {
      catchup.addEventListener('click', function () {
        state.viewingDay = Number(this.getAttribute('data-day'));
        state.dayData = (state._dayCache && state._dayCache[state.viewingDay]) || null;
        route();
      });
    }
    if (!ro) wireDaySave(dd, opts);
  }
  function wireDaySave(dd, opts) {
    var btn = document.getElementById('ft-save');
    if (!btn) return;
    // "100% confident, never ask again": ticking it locks the confidence
    // input at 10 so what the student sees matches what will be saved.
    var confWrap = opts.holder ? document.getElementById(opts.holder) : document.getElementById('ft-body');
    var confBox = confWrap ? confWrap.querySelector('[data-confforever]') : null;
    if (confBox) {
      confBox.addEventListener('change', function () {
        var ci = confWrap.querySelector('[data-dayscore="conf"]');
        if (!ci) return;
        if (this.checked) { ci.value = 10; ci.readOnly = true; }
        else { ci.readOnly = false; }
      });
    }
    btn.addEventListener('click', function () {
      if (!canEdit_()) return setMsg('ft-save-msg', COPY.READONLY_BANNER, false);
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
      var confForever = !!(confBox && confBox.checked);
      if (confForever) {
        if (!dayScores) dayScores = {};
        if (dayScores.conf == null) dayScores.conf = 10;
      }
      setMsg('ft-save-msg', COPY.SAVED, true);   // optimistic
      state.dirty = false;
      var savePayload = { action: 'save', projectId: state.activeProjectId, day: dd.day, fields: fields, dayScores: dayScores };
      if (confForever) savePayload.confidentForever = true;
      if (opts.variant) savePayload.variant = opts.variant;
      callGateway(savePayload)
        .then(function (data) {
          if (!data.ok) {
            if (data.windowClosed) { state.writable = false; writeStateCache(); renderDayCard(dd, opts); return; }
            return setMsg('ft-save-msg', data.error, false);
          }
          if (confForever) {
            state.confidence = { optedOut: true, since: new Date().toISOString() };
          }
          state.dayData = data.day;
          cacheDay(data.day);
          state.completion = data.completion || state.completion;
          writeStateCache();
          setMsg('ft-save-msg', COPY.SAVED, true);
          if (dd.day === 0) {
            var b = document.getElementById('ft-save');
            if (b) b.textContent = COPY.DAY0.BUTTON_DONE;
            if (state.view === 'full' && state.completion && state.completion[0]) {
              return route();   // Day 0 just completed: unlock the full navigator
            }
          }
          if (state.view === 'full') refreshChips();
        })
        .catch(function (err) { setMsg('ft-save-msg', String(err), false); });
    });
  }

  // ============================================================
  // Setting-up card (recover returned notFound) + Pairing / Activate
  // ============================================================
  function renderSettingUp() {
    rootEl.innerHTML =
      '<div class="ft-card">' +
        '<h3>' + esc(COPY.SETUP_TITLE) + '</h3>' +
        '<p class="ft-sub">' + esc(COPY.SETUP_TEXT) + '</p>' +
        '<button id="ft-setup-retry">' + esc(COPY.SETUP_RETRY) + '</button>' +
        '<div class="ft-msg" id="ft-setup-msg"></div>' +
        '<p class="ft-sub" style="margin-top:14px;"><button class="ft-linkbtn" id="ft-setup-manual">' + esc(COPY.SETUP_MANUAL) + '</button></p>' +
      '</div>';
    document.getElementById('ft-setup-retry').addEventListener('click', function () {
      state._recoverTried = false;
      attemptRecover('');
    });
    document.getElementById('ft-setup-manual').addEventListener('click', function () {
      renderPairing('');
    });
  }
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
      var t = document.getElementById('ft-token').value.trim().toLowerCase();
      if (!t) return setMsg('ft-pair-msg', COPY.ACTIVATE_NEED_CODE, false);
      state.token = t;
      setMsg('ft-pair-msg', 'Checking\u2026', true);
      callGateway({ action: 'activate' }).then(function (data) {
        if (!data.ok) return setMsg('ft-pair-msg', data.error, false);
        persistTokenFromResponse(data);
        writeLS(LS.token, state.token);
        clearStateCache();
        state._recoverTried = false;
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
  // Styles
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
      // Phase 2: week-grouped navigation
      '#freedom-tracker .ft-nav{margin:12px 0 22px 0;}' +
      '#freedom-tracker .ft-nav .ft-chips{margin:0 0 10px 0;}' +
      '#freedom-tracker .ft-weeknav{display:flex;align-items:center;justify-content:center;gap:14px;margin:4px 0 10px 0;}' +
      '#freedom-tracker .ft-weeklabel{font-size:15px;font-weight:700;color:#1a2733;min-width:64px;text-align:center;}' +
      '#freedom-tracker .ft-weekarrow{background:#eef3f6;color:#1f6f5c;border:1px solid #d8e0e7;border-radius:8px;padding:6px 16px;font-size:18px;font-weight:700;cursor:pointer;width:auto;min-height:0;margin:0;line-height:1;}' +
      '#freedom-tracker .ft-weekarrow:active{opacity:.85;}' +
      '#freedom-tracker .ft-weekarrow:disabled{opacity:.4;cursor:default;}' +
      '#freedom-tracker .ft-weekdays{margin:0;}' +
      // Phase 6: reflections + coach band + movement
      '#freedom-tracker .ft-coachband{background:#eef6f3;border:1px solid #bcd9cf;border-radius:8px;padding:8px 12px;font-size:12.5px;font-weight:700;color:#1f6f5c;text-transform:uppercase;letter-spacing:.03em;margin:14px 0 10px 0;}' +
      '#freedom-tracker .ft-reflect-divider{font-size:12.5px;font-weight:700;color:#5b6b7a;text-transform:uppercase;letter-spacing:.03em;border-top:1px solid #e2e8ee;padding-top:12px;margin:18px 0 10px 0;}' +
      '#freedom-tracker .ft-reflect-entry{border:1px solid #e2e8ee;border-radius:10px;padding:12px 14px;margin-bottom:10px;background:#fff;}' +
      '#freedom-tracker .ft-reflect-win{border-color:#bcd9cf;background:#fafdfb;}' +
      '#freedom-tracker .ft-reflect-day{font-size:13px;font-weight:800;color:#1a2733;margin-bottom:7px;}' +
      '#freedom-tracker .ft-reflect-field{font-size:14.5px;margin-bottom:6px;line-height:1.5;}' +
      '#freedom-tracker .ft-reflect-field:last-child{margin-bottom:0;}' +
      '#freedom-tracker .ft-reflect-label{font-weight:700;color:#1f6f5c;}' +
      '#freedom-tracker .ft-move-box{background:#f7faf9;border:1px solid #cfe0d9;border-radius:10px;padding:13px 15px;margin:6px 0 14px 0;}' +
      '#freedom-tracker .ft-move-title{font-size:14px;font-weight:800;color:#1f6f5c;margin-bottom:8px;}' +
      '#freedom-tracker .ft-move-sub{font-size:12.5px;font-weight:700;color:#5b6b7a;text-transform:uppercase;letter-spacing:.03em;margin-bottom:5px;}' +
      '#freedom-tracker .ft-field{margin-bottom:18px;text-align:left;}' +
      '#freedom-tracker .ft-label{display:block;font-size:15.5px;font-weight:700;margin-bottom:6px;text-align:left;}' +
      '#freedom-tracker .ft-check{display:flex;align-items:flex-start;gap:10px;font-size:15.5px;text-align:left;cursor:pointer;}' +
      '#freedom-tracker .ft-check input{margin-top:2px;width:22px;height:22px;flex:none;accent-color:#1f6f5c;cursor:pointer;}' +
      '#freedom-tracker input[type=text],#freedom-tracker input[type=email],#freedom-tracker input[type=number],#freedom-tracker textarea{width:100%;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:8px;padding:11px;font-size:16px;text-align:left;font-family:inherit;color:inherit;}' +
      '#freedom-tracker textarea{resize:vertical;}' +
      '#freedom-tracker input[readonly],#freedom-tracker textarea[readonly]{background:#f4f7f9;color:#5b6b7a;}' +
      '#freedom-tracker button{background:#1f6f5c;color:#fff;border:none;border-radius:8px;padding:12px 18px;font-size:16px;font-weight:700;cursor:pointer;width:100%;margin-top:14px;min-height:44px;}' +
      '#freedom-tracker button:active{opacity:.85;}' +
      '#freedom-tracker button:disabled{opacity:.5;cursor:default;}' +
      '#freedom-tracker .ft-linkbtn{background:none;border:none;color:#1f6f5c;text-decoration:underline;font-size:14px;font-weight:700;cursor:pointer;width:auto;padding:0;margin:0;display:inline;min-height:0;}' +
      '#freedom-tracker .ft-refreshlink{background:none;border:none;color:#5b6b7a;font-size:13px;font-weight:700;cursor:pointer;width:auto;padding:0;margin:0;display:inline;min-height:0;border-radius:0;}' +
      '#freedom-tracker .ft-refreshlink:hover{color:#1f6f5c;}' +
      '#freedom-tracker .ft-refreshlink:disabled{opacity:.6;cursor:default;}' +
      '#freedom-tracker .ft-sep{color:#c4cfd9;}' +
      '#freedom-tracker .ft-copybtn{margin-top:8px;}' +
      '#freedom-tracker .ft-msg{font-size:14px;margin-top:8px;min-height:18px;text-align:left;}' +
      '#freedom-tracker .ft-good{color:#1f6f5c;}' +
      '#freedom-tracker .ft-bad{color:#b3392f;}' +
      '#freedom-tracker .ft-note{background:#fdf6e3;border:1px solid #ead9a6;border-radius:8px;padding:10px 12px;font-size:14px;margin-bottom:14px;text-align:left;}' +
      '#freedom-tracker .ft-readonly{background:#eef3f6;border-color:#c4cfd9;color:#5b6b7a;}' +
      '#freedom-tracker .ft-grounding{background:#eef6f3;border:1px solid #bcd9cf;border-radius:8px;padding:10px 12px;font-size:15px;margin-bottom:14px;text-align:left;}' +
      '#freedom-tracker .ft-coach-note{margin:-6px 0 14px 0;font-style:italic;color:#5b6b7a;}' +
      '#freedom-tracker .ft-unlocknote{background:#eaf3fb;border-color:#b9d6ee;color:#1a4971;}' +
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
