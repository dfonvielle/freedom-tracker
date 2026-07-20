/* ============================================================
   FREEDOM COACH LOADER v3  ·  host on GitHub Pages as coach.v3.js
   ------------------------------------------------------------
   v2 (guided emotion-first flow) plus the FREEDOM HOME HANDOFF:
   whenever a loaded prompt renders, v3 dispatches a DOM event so a
   host page (freedom-home) can hand the prompt straight to the tool
   on the same page — no copy-paste hop between lessons.

   EVENTS (both on document, detail = { prompt, tool })
     fc:prompt       fired when a prompt bubble renders (not on replay).
                     Lets the host pre-arm the right tool.
     fc:prompt-send  fired when the student taps "Load into the tool
                     below" — the host mounts the tool with the prompt
                     injected as the first message.
   The button renders ONLY when window.FREEDOM_HOME === true (set by
   freedom-home before this script loads). Everywhere else v3 looks
   and behaves exactly like v2 — the copy-prompt UI always remains as
   the universal fallback.

   Update the lesson stub to point at coach.v3.js:
     <div id="freedom-coach"></div>
     <script src="https://USER.github.io/freedom-tracker/coach.v3.js"><\/script>

   PAIRS WITH: CoachGateway.gs + CoachAi.gs + CoachFlow.gs in the
   Gateway project, and the 'Coach Thoughts' / 'Coach Feelings' tabs.

   SAFETY (handled server-side, surfaced here)
     - The guided flow's free-text is distress-screened in the Gateway
       (CoachFlow's coachBuildPrompt) before anything is assembled. A
       distressed message comes back as a calm support reply with no
       prompt and no proposal; this widget renders it gently.
     - The coach only ever writes the richness fields on the current
       day, through the same review-card + apply path as before.
   ============================================================ */
   (function () {
    'use strict';

    // ============================================================
    // CONFIG  (same Gateway + key as loader.v6.js)
    // ============================================================
    var CONFIG = {
      GATEWAY_URL: 'https://script.google.com/macros/s/AKfycbxokJhAPaX6PvvQDJPQAJZa2NFQ1F5_bwz22yZQoqPclSPCO4GPhzESsB18AidstYmQ/exec',
      APP_KEY: '2br02b_AKfycbxokJhAPaX6PvvQDJPQAJZa2NFQ1F5_bwz22yZQoqPclSPCO4GPhzESsB18AidstYmQ_otter',
      CONTAINER_ID: 'freedom-coach'
    };

    /* ============================================================
     * COPY  ·  EDIT ALL COACH-WIDGET STUDENT-FACING TEXT HERE.
     * ============================================================ */
    var COPY = {
      LOADING: 'Opening your coach\u2026',
      HEADER: '{NAME}Freedom AI Coach',
      SUBLINE: 'Day {DAY}',
      REFRESH_BTN: '\u21bb Refresh',
      REFRESH_DOING: 'Refreshing\u2026',
      REFRESH_DONE: 'Updated \u2713',
      INTRO: 'My recommendations come from what you\u2019ve told me. The more you tell me about your situation, the more I can help. Tell me more, or tap below and I will point you to your next move.',   // unused since round 5 \u2014 the greeting bubble replaced the intro box (kept for UI-Copy-tab compat)
      // Round 5 (2026-07-20): the coach OPENS BY TALKING \u2014 a templated
      // greeting bubble built instantly from data we already hold (no model
      // call, no wait). One light question, per the one-question doctrine.
      GREET: 'Hi{NAME} \u2014 Day {DAY} of freedom from {UB}. Want me to set up today\u2019s rewiring session, or has something changed since yesterday?',
      GREET_NO_UB: 'Hi{NAME} \u2014 Day {DAY}. Tell me what\u2019s going on, and I\u2019ll set up your rewiring session.',
      RECOMMEND_BTN: 'Recommend my next move',
      RECOMMEND_THINKING: 'Looking back over your week\u2026',
      CHAT_PLACEHOLDER: 'How can I help?',
      SEND_BTN: 'Send',
      THINKING: 'Thinking\u2026',
      COPY_BUTTON: 'Copy prompt',
      COPIED: 'Copied \u2713',
      COPY_FALLBACK: 'Press and hold the text above to copy it.',
      TOOL_PREFIX: 'Paste into: ',
      SEND_TO_TOOL: 'Open my rewiring session \u2192',
      SENT_TO_TOOL: 'Opened \u2713',
      // Freedom Home prompt card (round 5): one line, one button; the raw
      // prompt is OUR plumbing, tucked behind a small peek link.
      PROMPT_READY: 'Your {TOOL} session is ready.',
      PROMPT_READY_GENERIC: 'Your rewiring session is ready.',
      PROMPT_PEEK: 'See what I\u2019m sending',
      PROMPT_REPLACED: 'Replaced by the newer suggestion below.',
      REVIEW_TITLE: 'Save this to your log?',
      REVIEW_CURRENT: 'Now',
      REVIEW_AFTER: 'After this update',
      REVIEW_KEEP: 'Your entry (we keep this)',
      REVIEW_ADD: 'We’ll add',
      REVIEW_EMPTY: '(empty)',
      APPLY_BTN: 'Save it',
      APPLY_SAVING: 'Saving\u2026',
      APPLIED: 'Saved \u2713',
      DISMISS_BTN: 'Not now',
      DISMISSED: 'No problem. It is still your call.',
      // Freedom Home auto-log chips (log-then-tell; Undo appears only when
      // there is a previous value to restore \u2014 the Gateway refuses empty writes).
      LOGGED_WIN: 'Logged as a win \u2713',
      LOGGED_OPP: 'Noted as something to work on \u2713',
      LOGGED_EXP: 'Logged your experiment \u2713',
      LOGGED_GENERIC: 'Logged for you \u2713',
      LOGGED_SAVING: 'Logging\u2026',
      LOGGED_UNDO: 'Undo',
      LOGGED_UNDOING: 'Removing\u2026',
      LOGGED_UNDONE: 'Removed. Your call, always.',
      ERROR_GENERIC: 'Something hiccuped on my end. Try that again in a moment.',
      NO_PROJECT_TITLE: 'Almost ready',
      NO_PROJECT_TEXT: 'Your access is still being set up on this device. Give it a moment, then refresh this page and I will be ready.',
      READONLY_NOTE: 'Your editing window has closed. I can still talk things through, but I cannot save new entries for you.',
      // --- Phase 5: guided emotion-first flow ---
      MORE_HELP_BTN: 'More ways I can help',
      MORE_HELP_CLOSE: 'Close help',
      HELP_LOADING: 'One moment\u2026',
      // Persistent target box, shown above the question and kept through the
      // whole flow. {UB} is the student's behavior.
      HELP_GOAL: 'I want to make it easier and more enjoyable to be free from {UB}.',
      HELP_TITLE: 'What emotion would you like to change to make this easier?',
      HELP_SUB: 'Pick the feeling you most want to be free from right now.',
      // The building-sentence header shown once a feeling is picked. {PHRASE} is
      // the feeling, lowercased (or a per-feeling override from the sheet).
      HELP_STOP: 'To make this easier, I want to stop feeling {PHRASE}.',
      HELP_BACK: '\u2190 Back',
      FEELING_TEXT_PLACEHOLDER: 'Whatever comes to mind\u2026',
      FEELING_THOUGHTS_LABEL: 'Any of these sound like you? Pick a few (optional).',
      FEELING_PICK_HINT: 'Pick 3\u20135 that feel most alive.',
      FEELING_BUILD_BTN: 'Build my prompt',
      FEELING_BUILDING: 'Building\u2026'
    };

    // The thoughts picker (the "Any of these sound like you?" checklist) is
    // built and the gateway still ships the thoughts, but it is hidden from
    // students for now to keep the flow simple. Flip to true to bring it back.
    var SHOW_THOUGHTS = false;

    // Shared token key with the tracker loader (single activation).
    var LS = { token: 'ag_ft_token', identity: 'ag_ft_identity_v6' };

    var state = {
      identity: null,
      token: null,
      firstName: '',
      currentDay: 0,
      maxDay: 7,
      writable: true,
      ub: '',
      activeProjectId: null,
      projects: [],
      messages: [],          // {role:'coach'|'student', text}
      busy: false,
      booted: false,
      _recoverTried: false,
      // guided flow
      helpOpen: false,
      helpMenu: null,        // {ub, canLog, feelings:[...]}
      helpFeeling: null,     // current feeling object when in the form
      // soft refresh
      _refreshing: false,
      _refreshFlash: false
    };

    var rootEl = null;

    // ============================================================
    // URL params  (iframe-aware, mirrors the tracker loader)
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
      if (t) { writeLS(LS.token, t); }
    }

    // ============================================================
    // Boot
    // ============================================================
    function boot() {
      rootEl = document.getElementById(CONFIG.CONTAINER_ID);
      if (!rootEl) { return; }
      injectStyles();
      captureMagicLinkToken();
      state.token = readLS(LS.token);
      rootEl.innerHTML = '<div class="fc-card fc-center">' + esc(COPY.LOADING) + '</div>';

      // FAST PAINT: the tracker and the coach share a device and a token, so
      // when the tracker has cached a state snapshot we render the coach shell
      // instantly from it, then refresh in the background via loadState(). The
      // coaching itself (recommend / chat / help) is always computed live when
      // the student taps, so nothing here is ever served stale.
      if (state.token) {
        var snap = coachReadTrackerCache_();
        if (snap && snap.activeProjectId) {
          if (snap.uiCopy) { state.uiCopy = snap.uiCopy; applyUiCopy(snap.uiCopy); }
          state.firstName = snap.firstName || '';
          state.projects = snap.projects || [];
          state.activeProjectId = snap.activeProjectId;
          state.currentDay = snap.currentDay || 0;
          state.maxDay = snap.maxDay || 7;
          state.writable = (snap.writable === false) ? false : true;
          state.ub = (snap.setup && snap.setup.ub) || '';
          renderCoach();
        }
      }

      getIdentity().then(function (identity) {
        state.identity = identity;
        if (state.identity && !state.identity.firstName && state.firstName) {
          state.identity.firstName = state.firstName;
        }
        if (!state.token) { return attemptRecover(); }
        return loadState();
      });
    }

    function attemptRecover() {
      state._recoverTried = true;
      var haveIdentity = state.identity && (state.identity.accountId || state.identity.email);
      if (!haveIdentity) { return renderNoProject(); }
      callGateway({ action: 'recover' }).then(function (data) {
        if (data.ok && data.token) {
          persistToken(data);
          return loadState();
        }
        return renderNoProject();
      }).catch(function () { renderNoProject(); });
    }

    function persistToken(data) {
      if (data && data.token && data.token !== state.token) {
        state.token = data.token;
        writeLS(LS.token, data.token);
      }
    }

    // Read the TRACKER loader's cached state snapshot (same device, same token).
    // Used ONLY to paint the coach shell instantly on boot; never for the live
    // coaching calls. Returns the inner snapshot object, or null.
    function coachReadTrackerCache_() {
      try {
        var raw = localStorage.getItem('ag_ft_cache_v6');
        if (!raw) { return null; }
        var parsed = JSON.parse(raw);
        if (!parsed || parsed.token !== state.token) { return null; }
        if ((Date.now() - parsed.at) / 3600000 > 48) { return null; }
        return parsed.snapshot || null;
      } catch (e) { return null; }
    }

    // Bootstrap from the existing 'state' action (no new endpoint needed).
    function loadState() {
      var payload = { action: 'state', projectId: state.activeProjectId };
      // Coach Refresh forces the Gateway to bypass its server caches too.
      if (state._forceFresh) { payload.fresh = true; state._forceFresh = false; }
      return callGateway(payload)
        .then(function (data) {
          if (!data.ok) {
            if (!state._recoverTried) { return attemptRecover(); }
            return renderNoProject();
          }
          persistToken(data);
          if (!data.activeProjectId) { return renderNoProject(); }
          if (data.uiCopy) { state.uiCopy = data.uiCopy; applyUiCopy(data.uiCopy); }
          state.firstName = data.firstName || '';
          state.projects = data.projects || [];
          state.activeProjectId = data.activeProjectId;
          state.currentDay = data.currentDay || 0;
          state.maxDay = data.maxDay || 7;
          state.writable = (data.writable === false) ? false : true;
          state.ub = (data.setup && data.setup.ub) || '';
          if (state.identity && !state.identity.firstName && state.firstName) {
            state.identity.firstName = state.firstName;
          }
          var hasConvo = !!(state.messages && state.messages.length);
          if (!state.booted || (!hasConvo && !state.busy)) { renderCoach(); }
          // The coach opens by TALKING (round 5): one templated greeting,
          // instant (no model call), exactly one light question. Once per
          // page load / per project — replays keep it via state.messages.
          if (!hasConvo && !state._greeted && !state.busy) {
            state._greeted = true;
            pushCoach(coachGreeting_());
          }
        })
        .catch(function () { renderNoProject(); });
    }

    function coachGreeting_() {
      var name = state.firstName ? ' ' + state.firstName : '';
      var ub = String(state.ub || '').trim();
      var t = ub ? COPY.GREET : COPY.GREET_NO_UB;
      return t.replace('{NAME}', name)
              .replace('{DAY}', String(state.currentDay))
              .replace('{UB}', ub);
    }

    // ============================================================
    // Identity  (same source the tracker loader uses)
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
    function fetchSystemeIdentity() {
      return Promise.all([
        fetch('/api/user/user-data', { credentials: 'same-origin' }).then(asJson),
        fetch('/api/settings/profile', { credentials: 'same-origin' }).then(asJson)
      ]).then(function (results) {
        var userData = results[0] || {};
        var profile = (results[1] && results[1].user) || {};
        var id = {
          accountId: String(userData.id || ''),
          email: String(profile.email || '').toLowerCase(),
          firstName: String(profile.firstName || userData.firstName || '')
        };
        if (!id.accountId && !id.email) { throw new Error('No identity'); }
        return id;
      });
    }
    function readIdentityCache() {
      try {
        var raw = readLS(LS.identity);
        if (!raw) { return null; }
        var parsed = JSON.parse(raw);
        return parsed.v;
      } catch (e) { return null; }
    }
    function asJson(r) {
      if (!r.ok) { throw new Error('HTTP ' + r.status); }
      return r.json();
    }

    // ============================================================
    // LIVE COPY OVERRIDES — merge sheet-driven copy over the baked COPY.
    // The Gateway's "UI Copy" tab ships its coach slice in state.uiCopy.coach
    // (and the loader caches the same payload, so the fast-paint path can apply
    // it before the first render). BAKED_COPY is the pristine default captured
    // once; COPY is recomputed from it on every apply, so removing a sheet row
    // reverts cleanly. An empty/missing override always falls back to the baked
    // string, so a bad or empty cell can never blank the UI.
    // ============================================================
    var BAKED_COPY = null;
    function deepMergeCopy(base, over) {
      if (over == null || typeof over !== 'object') { return base; }
      var out = {}, k;
      for (k in base) { if (base.hasOwnProperty(k)) { out[k] = base[k]; } }
      for (k in over) {
        if (!over.hasOwnProperty(k)) { continue; }
        var ov = over[k];
        if (ov == null || ov === '') { continue; }
        // [hide] blanks a line out. A blank cell falls back to the default, so
        // this token is the only way to make a string render nothing.
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
      if (!BAKED_COPY) { BAKED_COPY = COPY; }   // capture pristine on first apply
      COPY = deepMergeCopy(BAKED_COPY, uiCopy && uiCopy.coach);
    }

    // ============================================================
    // Gateway client  (same shape as loader.v6.js)
    // ============================================================
    function callGateway(payload) {
      payload.appKey = CONFIG.APP_KEY;
      payload.accountId = (state.identity && state.identity.accountId) || '';
      payload.email = (state.identity && state.identity.email) || '';
      payload.token = state.token || '';
      // Student's timezone (additive, 2026-07-20): day rolls at local midnight.
      try { payload.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { payload.tz = ''; }
      try { payload.tzo = new Date().getTimezoneOffset(); } catch (e2) {}
      return fetch(CONFIG.GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).then(asJson);
    }

    // ============================================================
    // Project picker (multi-project switch, mirrors the tracker loader)
    // Numbered Project 1..N by age (oldest = 1), listed newest-first,
    // defaulting to the active project. Hidden when there is only one.
    // ============================================================
    function coachProjectPickerHtml() {
      var projects = state.projects || [];
      if (projects.length <= 1) { return ''; }
      var byOldest = projects.slice().sort(function (a, b) {
        var ad = String(a.day0Date || ''), bd = String(b.day0Date || '');
        if (ad !== bd) { return ad < bd ? -1 : 1; }
        return (b.currentDay || 0) - (a.currentDay || 0);
      });
      var ordinalById = {};
      for (var oi = 0; oi < byOldest.length; oi++) {
        ordinalById[byOldest[oi].projectId] = oi + 1;
      }
      var byNewest = projects.slice().sort(function (a, b) {
        var a2 = String(a.day0Date || ''), b2 = String(b.day0Date || '');
        if (a2 !== b2) { return a2 < b2 ? 1 : -1; }
        return (a.currentDay || 0) - (b.currentDay || 0);
      });
      var html = '<select id="fc-project" class="fc-project">';
      for (var i = 0; i < byNewest.length; i++) {
        var p = byNewest[i];
        html += '<option value="' + esc(p.projectId) + '"' +
          (String(p.projectId) === String(state.activeProjectId) ? ' selected' : '') + '>' +
          'Project ' + ordinalById[p.projectId] + ' (Day ' + p.currentDay + ')</option>';
      }
      return html + '</select>';
    }

    function onProjectChange(newId) {
      if (!newId || String(newId) === String(state.activeProjectId)) { return; }
      state.activeProjectId = newId;
      state.messages = [];
      state._greeted = false;   // the new project gets its own greeting
      state.helpOpen = false;
      state.helpMenu = null;     // help menu is localized per project, so refetch
      state.helpFeeling = null;
      state.busy = false;
      rootEl.innerHTML = '<div class="fc-card fc-center">' + esc(COPY.LOADING) + '</div>';
      loadState();
    }

    // ============================================================
    // SOFT REFRESH — re-pull the coach fresh and clear the local mess.
    // Re-reads state from the Gateway, clears the current conversation
    // and the guided-help panel, and re-localizes the help menu. Keeps
    // the activation token and the active project. Also drops the
    // TRACKER's cached state snapshot, so hitting refresh on either
    // surface freshens both. (The token-dropping nuclear reset stays on
    // the tracker's AG_FT_RESET, for support only.)
    // ============================================================
    function coachSoftRefresh() {
      if (state._refreshing) { return; }
      state._refreshing = true;

      var btn = document.getElementById('fc-refresh');
      if (btn) { btn.textContent = COPY.REFRESH_DOING; btn.disabled = true; }

      // Clear the local conversation + guided-help state.
      state.messages = [];
      state._greeted = false;   // refreshed coach greets again
      state.helpOpen = false;
      state.helpMenu = null;
      state.helpFeeling = null;
      state.busy = false;

      // Also clear the tracker loader's persisted snapshot (shared device),
      // so the Freedom Tracker re-pulls fresh next time it loads.
      try { localStorage.removeItem('ag_ft_cache_v6'); } catch (e) {}

      // Confirm on the next header render, then re-pull (server caches bypassed).
      state._refreshFlash = true;
      state._refreshing = false;
      state._forceFresh = true;
      loadState();
    }

    // ============================================================
    // Render: the coach
    // ============================================================
    function renderCoach() {
      state.booted = true;
      var name = state.firstName ? esc(state.firstName) + '\u2019s ' : '';
      var html =
        '<div class="fc-card">' +
          '<div class="fc-head">' +
            '<div>' +
              '<h3>' + name + 'Freedom AI Coach</h3>' +
              '<p class="fc-sub">' + esc(COPY.SUBLINE.replace('{DAY}', state.currentDay)) +
                ' <span class="fc-sep">·</span> ' +
                '<button class="fc-refreshlink" id="fc-refresh">' +
                esc(state._refreshFlash ? COPY.REFRESH_DONE : COPY.REFRESH_BTN) + '</button></p>' +
            '</div>' +
            coachProjectPickerHtml() +
          '</div>' +
          // fc-scroll: inert wrapper inline; in Freedom Home's fullscreen
          // sheet it becomes THE scroll region — conversation first, actions
          // trailing it, composer pinned. The old intro box is gone: the
          // greeting bubble (round 5) does its job as an actual message.
          '<div class="fc-scroll">' +
          (state.writable ? '' : '<div class="fc-note fc-readonly">' + esc(COPY.READONLY_NOTE) + '</div>') +
          '<div id="fc-transcript" class="fc-transcript"></div>' +
          '<button id="fc-recommend" class="fc-recbtn">' + esc(COPY.RECOMMEND_BTN) + '</button>' +
          '<button id="fc-morehelp" class="fc-morehelplink">' + esc(COPY.MORE_HELP_BTN) + '</button>' +
          '<div id="fc-help" class="fc-help"></div>' +
          '</div>' +
          '<div class="fc-inputrow">' +
            '<textarea id="fc-input" rows="1" placeholder="' + esc(COPY.CHAT_PLACEHOLDER) + '"></textarea>' +
            '<button id="fc-send" class="fc-sendbtn">' + esc(COPY.SEND_BTN) + '</button>' +
          '</div>' +
        '</div>';
      rootEl.innerHTML = html;

      // Replay any existing transcript (so a re-render keeps history).
      for (var i = 0; i < state.messages.length; i++) {
        appendBubble(state.messages[i], true);
      }

      document.getElementById('fc-recommend').addEventListener('click', onRecommend);
      document.getElementById('fc-morehelp').addEventListener('click', onMoreHelp);
      // wrapper on purpose: a bare handler would receive the click EVENT as
      // onSend's textArg and treat it as programmatic text
      document.getElementById('fc-send').addEventListener('click', function () { onSend(); });
      var fcProj = document.getElementById('fc-project');
      if (fcProj) { fcProj.addEventListener('change', function () { onProjectChange(this.value); }); }
      var fcRefresh = document.getElementById('fc-refresh');
      if (fcRefresh) { fcRefresh.addEventListener('click', coachSoftRefresh); }
      if (state._refreshFlash) {
        state._refreshFlash = false;
        setTimeout(function () {
          var c = document.getElementById('fc-refresh');
          if (c) { c.textContent = COPY.REFRESH_BTN; c.disabled = false; }
        }, 2000);
      }
      var input = document.getElementById('fc-input');
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
      });
      input.addEventListener('input', autoGrow);

      // If help was open across a re-render, restore it.
      if (state.helpOpen) {
        document.getElementById('fc-morehelp').textContent = COPY.MORE_HELP_CLOSE;
        if (state.helpMenu) { renderHelpPanel(); } else { fetchHelpMenu(); }
      }
    }

    function autoGrow() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 140) + 'px';
    }

    // ============================================================
    // Move 1: Recommend my next move
    // ============================================================
    function onRecommend() {
      if (state.busy) { return; }
      setBusy(true);
      var btn = document.getElementById('fc-recommend');
      var old = btn.textContent;
      btn.textContent = COPY.RECOMMEND_THINKING;
      btn.disabled = true;

      callGateway({ action: 'coachRecommend', projectId: state.activeProjectId })
        .then(function (data) {
          if (!data.ok) { pushCoach(data.error || COPY.ERROR_GENERIC); return; }
          // Pass any proposal through too — recommend responses can carry one
          // (auto-logged in Freedom Home, review card elsewhere).
          pushCoach(data.message || '', { prompt: data.prompt, tool: data.tool, proposal: data.proposal || null });
        })
        .catch(function () { pushCoach(COPY.ERROR_GENERIC); })
        .then(function () {
          btn.textContent = old;
          btn.disabled = false;
          setBusy(false);
        });
    }

    // ============================================================
    // Move 2: Chat (+ propose-and-apply)
    // ============================================================
    // No argument = the composer path. With a text argument (the host page's
    // FreedomCoach.ask — e.g. Freedom Home's "What's this?" links) the
    // composer is left untouched.
    function onSend(textArg) {
      if (state.busy) { return; }
      var fromComposer = (textArg == null);
      var input = document.getElementById('fc-input');
      var text = String(fromComposer ? ((input && input.value) || '') : textArg).trim();
      if (!text) { return; }
      if (fromComposer && input) {
        input.value = '';
        input.style.height = 'auto';
      }
      pushStudent(text);

      setBusy(true);
      var pending = pushCoach(COPY.THINKING, { pending: true });

      callGateway({ action: 'coachChat', projectId: state.activeProjectId, messages: chatPayload() })
        .then(function (data) {
          removeBubble(pending);
          if (!data.ok) { pushCoach(data.error || COPY.ERROR_GENERIC); return; }
          if (data.distress) { pushCoach(data.message || '', { care: true }); return; }
          // The chat can now hand back a ready prompt (when a concrete focus
          // surfaces) alongside any tracker-log proposal. Both render in one card.
          pushCoach(data.message || '', { prompt: data.prompt, tool: data.tool, proposal: data.proposal || null });
        })
        .catch(function () {
          removeBubble(pending);
          pushCoach(COPY.ERROR_GENERIC);
        })
        .then(function () { setBusy(false); });
    }

    // The transcript the Gateway expects: roles coach|student + text.
    function chatPayload() {
      var out = [];
      for (var i = 0; i < state.messages.length; i++) {
        var m = state.messages[i];
        if (m.role === 'coach' && m.pending) { continue; }
        out.push({ role: m.role, text: m.text });
      }
      return out;
    }

    // ============================================================
    // Move 3 (Phase 5): More help options  ·  guided emotion-first flow
    // ============================================================
    function onMoreHelp() {
      if (state.helpOpen) { closeHelp(); return; }
      state.helpOpen = true;
      state.helpFeeling = null;
      var btn = document.getElementById('fc-morehelp');
      if (btn) { btn.textContent = COPY.MORE_HELP_CLOSE; }
      if (state.helpMenu) { renderHelpPanel(); } else { fetchHelpMenu(); }
    }
    function closeHelp() {
      state.helpOpen = false;
      state.helpFeeling = null;
      var btn = document.getElementById('fc-morehelp');
      if (btn) { btn.textContent = COPY.MORE_HELP_BTN; }
      var panel = document.getElementById('fc-help');
      if (panel) { panel.innerHTML = ''; }
    }
    function helpMsg(text) {
      var panel = document.getElementById('fc-help');
      if (panel) { panel.innerHTML = '<div class="fc-help-loading">' + esc(text) + '</div>'; }
    }
    function fetchHelpMenu() {
      helpMsg(COPY.HELP_LOADING);
      callGateway({ action: 'coachHelpMenu', projectId: state.activeProjectId })
        .then(function (data) {
          if (!data.ok) { helpMsg(data.error || COPY.ERROR_GENERIC); return; }
          state.helpMenu = data;
          if (state.helpOpen) { renderHelpPanel(); }
        })
        .catch(function () { helpMsg(COPY.ERROR_GENERIC); });
    }

    // The persistent target box: what the student wants to be free from. Shown
    // at the top of every step of the guided flow, so the goal never leaves the
    // screen. Returns '' if HELP_GOAL was hidden via the [hide] token.
    function helpGoalHtml() {
      if (!COPY.HELP_GOAL) { return ''; }
      var ub = (state.helpMenu && state.helpMenu.ub) || state.ub || 'it';
      return '<div class="fc-help-goal">' + esc(COPY.HELP_GOAL.replace('{UB}', ub)) + '</div>';
    }

    // Step A: the six feelings, grouped in their pairs.
    function renderHelpPanel() {
      var panel = document.getElementById('fc-help');
      if (!panel || !state.helpMenu) { return; }
      if (state.helpFeeling) { return renderFeelingForm(); }
      var feelings = state.helpMenu.feelings || [];
      var groups = [], byGroup = {};
      for (var i = 0; i < feelings.length; i++) {
        var g = feelings[i].group || '';
        if (!byGroup[g]) { byGroup[g] = []; groups.push(g); }
        byGroup[g].push(feelings[i]);
      }
      var html = '<div class="fc-help-card">';
      html += helpGoalHtml();
      if (COPY.HELP_TITLE) { html += '<div class="fc-help-title">' + esc(COPY.HELP_TITLE) + '</div>'; }
      if (COPY.HELP_SUB) { html += '<div class="fc-help-sub">' + esc(COPY.HELP_SUB) + '</div>'; }
      for (var gi = 0; gi < groups.length; gi++) {
        var gl = groups[gi];
        if (gl) { html += '<div class="fc-help-group">' + esc(gl) + '</div>'; }
        html += '<div class="fc-feelings">';
        var list = byGroup[gl];
        for (var k = 0; k < list.length; k++) {
          html += '<button class="fc-feelingbtn" data-feeling="' + esc(list[k].key) + '">' + esc(list[k].label) + '</button>';
        }
        html += '</div>';
      }
      html += '</div>';
      panel.innerHTML = html;
      var btns = panel.querySelectorAll('[data-feeling]');
      for (var b = 0; b < btns.length; b++) {
        btns[b].addEventListener('click', function () { onPickFeeling(this.getAttribute('data-feeling')); });
      }
    }

    function onPickFeeling(key) {
      var feelings = (state.helpMenu && state.helpMenu.feelings) || [];
      for (var i = 0; i < feelings.length; i++) {
        if (feelings[i].key === key) { state.helpFeeling = feelings[i]; break; }
      }
      renderFeelingForm();
    }

    // Step B: lead-in + a few words + optional thought checklist + build.
    function renderFeelingForm() {
      var panel = document.getElementById('fc-help');
      if (!panel || !state.helpFeeling) { return; }
      var f = state.helpFeeling;
      // The building-sentence header: keep the goal box, then state the feeling
      // the student wants to stop, in their words. Per-feeling phrasing comes
      // from the sheet (stopPhrase); otherwise the lowercased button label.
      var phrase = f.stopPhrase || String(f.label || '').toLowerCase();
      var header = COPY.HELP_STOP ? COPY.HELP_STOP.replace('{PHRASE}', phrase) : f.label;
      var html = '<div class="fc-help-card">';
      html += '<button class="fc-help-back" id="fc-help-back">' + esc(COPY.HELP_BACK) + '</button>';
      html += helpGoalHtml();
      html += '<div class="fc-help-title">' + esc(header) + '</div>';
      if (f.leadIn) { html += '<div class="fc-help-sub">' + esc(f.leadIn) + '</div>'; }
      html += '<textarea id="fc-feeling-text" class="fc-feeling-text" rows="2" placeholder="' + esc(COPY.FEELING_TEXT_PLACEHOLDER) + '"></textarea>';
      if (SHOW_THOUGHTS && f.thoughts && f.thoughts.length) {
        html += '<div class="fc-thoughts-label">' + esc(COPY.FEELING_THOUGHTS_LABEL) + '</div>';
        html += '<div class="fc-thoughts">';
        for (var i = 0; i < f.thoughts.length; i++) {
          var th = f.thoughts[i];
          html += '<label class="fc-thought"><input type="checkbox" data-tid="' + esc(th.id) + '" /> <span>' + esc(th.text) + '</span></label>';
        }
        html += '</div>';
        html += '<div class="fc-thoughts-hint">' + esc(COPY.FEELING_PICK_HINT) + '</div>';
      }
      html += '<button id="fc-feeling-build" class="fc-buildbtn">' + esc(COPY.FEELING_BUILD_BTN) + '</button>';
      html += '<div class="fc-msg" id="fc-feeling-msg"></div>';
      html += '</div>';
      panel.innerHTML = html;
      document.getElementById('fc-help-back').addEventListener('click', function () {
        state.helpFeeling = null;
        renderHelpPanel();
      });
      document.getElementById('fc-feeling-build').addEventListener('click', onBuildPrompt);
    }

    function onBuildPrompt() {
      if (state.busy) { return; }
      var f = state.helpFeeling;
      if (!f) { return; }
      var textEl = document.getElementById('fc-feeling-text');
      var text = textEl ? String(textEl.value || '').trim() : '';
      var ids = [];
      var checks = document.querySelectorAll('#fc-help [data-tid]');
      for (var i = 0; i < checks.length; i++) {
        if (checks[i].checked) { ids.push(checks[i].getAttribute('data-tid')); }
      }

      setBusy(true);
      var btn = document.getElementById('fc-feeling-build');
      var old = btn ? btn.textContent : '';
      if (btn) { btn.textContent = COPY.FEELING_BUILDING; btn.disabled = true; }

      callGateway({ action: 'coachBuildPrompt', projectId: state.activeProjectId,
                    feeling: f.key, text: text, thoughtIds: ids })
        .then(function (data) {
          if (!data.ok) {
            setFeelingMsg(data.error || COPY.ERROR_GENERIC);
            if (btn) { btn.textContent = old; btn.disabled = false; }
            return;
          }
          // Collapse the panel and push the result into the transcript,
          // where it renders exactly like a recommend/chat result.
          closeHelp();
          if (data.distress) {
            pushCoach(data.message || '', { care: true });
          } else {
            pushCoach(data.message || '', { prompt: data.prompt, tool: data.tool, proposal: data.proposal || null });
          }
        })
        .catch(function () {
          setFeelingMsg(COPY.ERROR_GENERIC);
          if (btn) { btn.textContent = old; btn.disabled = false; }
        })
        .then(function () { setBusy(false); });
    }

    function setFeelingMsg(text) {
      var el = document.getElementById('fc-feeling-msg');
      if (el) { el.textContent = text; el.className = 'fc-msg fc-bad'; }
    }

    // ============================================================
    // Apply a proposed update  (writes exactly what was shown)
    // ============================================================
    function onApply(proposal, cardEl, btn) {
      if (state.busy) { return; }
      setBusy(true);
      btn.textContent = COPY.APPLY_SAVING;
      btn.disabled = true;

      var updates = [];
      for (var i = 0; i < proposal.updates.length; i++) {
        updates.push({ field: proposal.updates[i].field, finalText: proposal.updates[i].finalText });
      }

      callGateway({ action: 'coachApply', projectId: state.activeProjectId, updates: updates })
        .then(function (data) {
          if (!data.ok) {
            setReviewMsg(cardEl, data.error || COPY.ERROR_GENERIC, false);
            btn.textContent = COPY.APPLY_BTN;
            btn.disabled = false;
            return;
          }
          markReviewApplied(cardEl);
          // Freedom Home: the coach just wrote the tracker — let the host
          // page refresh its daily-log card so the student sees it landed.
          fcDispatch('fc:applied', { updates: proposal.updates });
        })
        .catch(function () {
          setReviewMsg(cardEl, COPY.ERROR_GENERIC, false);
          btn.textContent = COPY.APPLY_BTN;
          btn.disabled = false;
        })
        .then(function () { setBusy(false); });
    }

    // ============================================================
    // Transcript rendering
    // ============================================================
    function pushStudent(text) {
      var msg = { role: 'student', text: text };
      state.messages.push(msg);
      appendBubble(msg, false);
      return msg;
    }
    function pushCoach(text, opts) {
      opts = opts || {};
      var msg = { role: 'coach', text: text, prompt: opts.prompt, tool: opts.tool,
                  proposal: opts.proposal, care: opts.care, pending: opts.pending };
      if (!opts.pending) { state.messages.push(msg); }
      appendBubble(msg, false);
      return msg;
    }

    function appendBubble(msg, replaying) {
      var tx = document.getElementById('fc-transcript');
      if (!tx) { return; }
      var row = document.createElement('div');
      row.className = 'fc-row fc-row-' + (msg.role === 'student' ? 'student' : 'coach');

      var bubble = document.createElement('div');
      var bcls = 'fc-bubble fc-bubble-' + (msg.role === 'student' ? 'student' : 'coach');
      if (msg.care) { bcls = 'fc-bubble fc-bubble-care'; }
      if (msg.pending) { bcls += ' fc-bubble-pending'; }
      bubble.className = bcls;

      bubble.appendChild(textNode(msg.text));

      if (msg.prompt) {
        bubble.appendChild(promptBoxNode(msg.prompt, msg.tool));
        // Freedom Home handoff: announce the prompt to the host page.
        // Replayed history stays silent so a reload never re-arms tools.
        if (!replaying) { fcDispatch('fc:prompt', { prompt: msg.prompt, tool: msg.tool || '' }); }
      }
      if (msg.proposal && msg.proposal.updates && msg.proposal.updates.length) {
        if (window.FREEDOM_HOME === true) {
          // Freedom Home: log-then-tell. The entry saves immediately and is
          // announced with a light chip (+ Undo when restorable) — no review
          // card, no decision. Replays render the chip without re-applying.
          bubble.appendChild(autoLogChipNode(msg));
          if (!replaying && !msg._autoApplied) { runAutoApply(msg); }
        } else {
          bubble.appendChild(reviewCardNode(msg.proposal));
        }
      }

      row.appendChild(bubble);
      msg._el = row;
      tx.appendChild(row);
      if (!replaying) { scrollDown(); }
    }
    function removeBubble(msg) {
      if (msg && msg._el && msg._el.parentNode) { msg._el.parentNode.removeChild(msg._el); }
    }
    function scrollDown() {
      var tx = document.getElementById('fc-transcript');
      if (tx) { tx.scrollTop = tx.scrollHeight; }
      // Sheet mode: the wrapper is the scroller (transcript is uncapped
      // there). Scrolling a non-scrolling element is a harmless no-op.
      var sc = document.querySelector('.fh-coach-sheet .fc-scroll');
      if (sc) { sc.scrollTop = sc.scrollHeight; }
    }

    // Paragraph-aware text (the model writes short paragraphs).
    function textNode(text) {
      var wrap = document.createElement('div');
      var paras = String(text == null ? '' : text).split(/\n{2,}/);
      for (var i = 0; i < paras.length; i++) {
        var p = document.createElement('p');
        p.className = 'fc-p';
        p.innerHTML = esc(paras[i]).replace(/\n/g, '<br>');
        wrap.appendChild(p);
      }
      return wrap;
    }

    // Host-page API (Freedom Home): ask the coach something on the student's
    // behalf — e.g. the rail's "What's this?" refresher links. Rides the
    // normal send path, so the answer lands in the transcript like any turn.
    window.FreedomCoach = {
      ask: function (text) { onSend(String(text || '')); }
    };

    // Dispatch a Freedom Home handoff event (ES5-safe CustomEvent).
    function fcDispatch(name, detail) {
      try {
        var ev;
        if (typeof window.CustomEvent === 'function') {
          ev = new CustomEvent(name, { detail: detail || {} });
        } else {
          ev = document.createEvent('CustomEvent');
          ev.initCustomEvent(name, false, false, detail || {});
        }
        document.dispatchEvent(ev);
      } catch (e) {}
    }

    // ============================================================
    // Prompt box  (ported from the tracker loader)
    // ============================================================
    var lastPromptBox = null;   // newest-wins: older suggestions grey out

    function promptBoxNode(text, tool) {
      var box = document.createElement('div');
      box.className = 'fc-promptbox';
      // Freedom Home (round 5): ONE line, ONE button. The raw prompt is our
      // plumbing — grandpa never chooses between Load and Copy, and repeated
      // Recommends can't stack live cards (the previous one greys out).
      if (window.FREEDOM_HOME === true) {
        if (lastPromptBox) {
          try {
            lastPromptBox.className = 'fc-promptbox fc-prompt-old';
            var oldBtns = lastPromptBox.querySelectorAll('button');
            for (var ob = 0; ob < oldBtns.length; ob++) { oldBtns[ob].disabled = true; }
            var oldReady = lastPromptBox.querySelector('.fc-prompt-ready');
            if (oldReady) { oldReady.textContent = COPY.PROMPT_REPLACED; }
          } catch (e) {}
        }
        lastPromptBox = box;

        var ready = document.createElement('div');
        ready.className = 'fc-prompt-ready';
        ready.textContent = tool
          ? COPY.PROMPT_READY.replace('{TOOL}', tool)
          : COPY.PROMPT_READY_GENERIC;
        box.appendChild(ready);

        var sendBtn = document.createElement('button');
        sendBtn.className = 'fc-copybtn fc-sendtool';
        sendBtn.textContent = COPY.SEND_TO_TOOL;
        sendBtn.addEventListener('click', function () {
          fcDispatch('fc:prompt-send', { prompt: text, tool: tool || '' });
          sendBtn.textContent = COPY.SENT_TO_TOOL;
          sendBtn.disabled = true;
        });
        box.appendChild(sendBtn);

        var peekTa = document.createElement('textarea');
        peekTa.className = 'fc-prompt';
        peekTa.readOnly = true;
        peekTa.rows = 4;
        peekTa.value = text;
        peekTa.style.display = 'none';
        var peek = document.createElement('button');
        peek.type = 'button';
        peek.className = 'fc-peek';
        peek.textContent = COPY.PROMPT_PEEK + ' ▸';
        peek.addEventListener('click', function () {
          var open = peekTa.style.display !== 'none';
          peekTa.style.display = open ? 'none' : 'block';
          peek.textContent = COPY.PROMPT_PEEK + (open ? ' ▸' : ' ▾');
        });
        box.appendChild(peek);
        box.appendChild(peekTa);
        return box;
      }
      // Standalone coach lessons: the classic label + prompt + Copy UI.
      if (tool) {
        var lab = document.createElement('div');
        lab.className = 'fc-prompt-tool';
        lab.textContent = COPY.TOOL_PREFIX + tool;
        box.appendChild(lab);
      }
      var ta = document.createElement('textarea');
      ta.className = 'fc-prompt';
      ta.readOnly = true;
      ta.rows = 4;
      ta.value = text;
      box.appendChild(ta);

      var btn = document.createElement('button');
      btn.className = 'fc-copybtn';
      btn.textContent = COPY.COPY_BUTTON;
      box.appendChild(btn);

      var msg = document.createElement('div');
      msg.className = 'fc-msg';
      box.appendChild(msg);

      btn.addEventListener('click', function () {
        function done() {
          btn.textContent = COPY.COPIED;
          setTimeout(function () { btn.textContent = COPY.COPY_BUTTON; }, 2000);
        }
        function fallback() {
          try {
            ta.focus(); ta.select(); ta.setSelectionRange(0, 99999);
            if (document.execCommand('copy')) { return done(); }
          } catch (e) {}
          msg.textContent = COPY.COPY_FALLBACK;
          msg.className = 'fc-msg fc-good';
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ta.value).then(done).catch(fallback);
        } else { fallback(); }
      });
      return box;
    }

    // ============================================================
    // Review card  (before / after, then one-tap apply)
    // ============================================================
    // ============================================================
    // Freedom Home auto-log (log-then-tell). Reuses the shipped
    // fc-review-done styling so no new CSS ships with this feature.
    // ============================================================
    function autoLogLabel(field) {
      if (field === 'wins') { return COPY.LOGGED_WIN; }
      if (field === 'opportunities') { return COPY.LOGGED_OPP; }
      if (field === 'experiments') { return COPY.LOGGED_EXP; }
      return COPY.LOGGED_GENERIC;
    }
    function autoLogChipNode(msg) {
      var chip = document.createElement('div');
      chip.className = 'fc-review fc-review-done';
      msg._chipEl = chip;
      renderAutoLogChip(msg, msg._autoApplied ? 'done' : 'saving');
      return chip;
    }
    function renderAutoLogChip(msg, phase, note) {
      var chip = msg._chipEl;
      if (!chip) { return; }
      var updates = (msg.proposal && msg.proposal.updates) || [];
      var html = '';
      if (phase === 'saving') {
        html = '<div class="fc-review-donerow">' + esc(COPY.LOGGED_SAVING) + '</div>';
      } else if (phase === 'undone') {
        html = '<div class="fc-review-donerow">' + esc(COPY.LOGGED_UNDONE) + '</div>';
      } else {
        // done: one line per update + a single Undo when every update can
        // be restored (the Gateway refuses empty writes, so an update whose
        // previous value was empty cannot be undone server-side).
        var undoable = updates.length > 0;
        for (var i = 0; i < updates.length; i++) {
          if (!updates[i].current) { undoable = false; }
          html += '<div class="fc-review-donerow">' + esc(autoLogLabel(updates[i].field)) + '</div>';
        }
        if (undoable) {
          html += '<div class="fc-review-donerow"><a href="#" class="fc-undo-link">' + esc(COPY.LOGGED_UNDO) + '</a></div>';
        }
        if (note) { html += '<div class="fc-review-donerow">' + esc(note) + '</div>'; }
      }
      chip.innerHTML = html;
      var undo = chip.querySelector('.fc-undo-link');
      if (undo) {
        undo.addEventListener('click', function (e) {
          e.preventDefault();
          runAutoUndo(msg);
        });
      }
    }
    function runAutoApply(msg) {
      msg._autoApplied = true;
      var updates = [];
      var src = msg.proposal.updates;
      for (var i = 0; i < src.length; i++) {
        updates.push({ field: src[i].field, finalText: src[i].finalText });
      }
      callGateway({ action: 'coachApply', projectId: state.activeProjectId, updates: updates })
        .then(function (data) {
          if (!data.ok) { return autoLogFallback(msg); }
          renderAutoLogChip(msg, 'done');
          fcDispatch('fc:applied', { updates: src });
        })
        .catch(function () { autoLogFallback(msg); });
    }
    function runAutoUndo(msg) {
      var chip = msg._chipEl;
      if (chip) { chip.innerHTML = '<div class="fc-review-donerow">' + esc(COPY.LOGGED_UNDOING) + '</div>'; }
      var updates = [];
      var src = msg.proposal.updates;
      for (var i = 0; i < src.length; i++) {
        updates.push({ field: src[i].field, finalText: src[i].current });
      }
      callGateway({ action: 'coachApply', projectId: state.activeProjectId, updates: updates })
        .then(function (data) {
          if (!data.ok) { return renderAutoLogChip(msg, 'done', data.error || COPY.ERROR_GENERIC); }
          renderAutoLogChip(msg, 'undone');
          fcDispatch('fc:applied', { updates: src, undone: true });
        })
        .catch(function () { renderAutoLogChip(msg, 'done', COPY.ERROR_GENERIC); });
    }
    // Auto-apply failed (offline, window closed, rejected): fall back to the
    // classic review card so nothing the coach drafted is ever lost.
    function autoLogFallback(msg) {
      var chip = msg._chipEl;
      if (!chip || !chip.parentNode) { return; }
      var card = reviewCardNode(msg.proposal);
      chip.parentNode.replaceChild(card, chip);
      msg._chipEl = null;
    }

    function reviewCardNode(proposal) {
      var card = document.createElement('div');
      card.className = 'fc-review';

      var title = document.createElement('div');
      title.className = 'fc-review-title';
      title.textContent = COPY.REVIEW_TITLE;
      card.appendChild(title);

      if (proposal.summary) {
        var sum = document.createElement('div');
        sum.className = 'fc-review-summary';
        sum.textContent = proposal.summary;
        card.appendChild(sum);
      }

      for (var i = 0; i < proposal.updates.length; i++) {
        var u = proposal.updates[i];
        var item = document.createElement('div');
        item.className = 'fc-review-item';

        var flabel = document.createElement('div');
        flabel.className = 'fc-review-field';
        flabel.textContent = u.label + ' \u00b7 Day ' + u.day;
        item.appendChild(flabel);

        var mode = (String(u.mode || 'append') === 'replace') ? 'replace' : 'append';
        if (mode === 'replace') {
          if (u.current) { item.appendChild(reviewBlock(COPY.REVIEW_CURRENT, u.current, 'now')); }
          item.appendChild(reviewBlock(COPY.REVIEW_AFTER, u.finalText, 'after'));
        } else {
          if (u.current) { item.appendChild(reviewBlock(COPY.REVIEW_KEEP, u.current, 'now')); }
          var added = (u.addedText != null && String(u.addedText) !== '') ? u.addedText : u.finalText;
          item.appendChild(reviewBlock(COPY.REVIEW_ADD, added, 'after'));
        }
        card.appendChild(item);
      }

      var actions = document.createElement('div');
      actions.className = 'fc-review-actions';
      var apply = document.createElement('button');
      apply.className = 'fc-applybtn';
      apply.textContent = COPY.APPLY_BTN;
      var dismiss = document.createElement('button');
      dismiss.className = 'fc-dismissbtn';
      dismiss.textContent = COPY.DISMISS_BTN;
      actions.appendChild(apply);
      actions.appendChild(dismiss);
      card.appendChild(actions);

      var msg = document.createElement('div');
      msg.className = 'fc-msg fc-review-msg';
      card.appendChild(msg);

      apply.addEventListener('click', function () { onApply(proposal, card, apply); });
      dismiss.addEventListener('click', function () {
        card.className = 'fc-review fc-review-done';
        card.innerHTML = '<div class="fc-review-donerow">' + esc(COPY.DISMISSED) + '</div>';
      });
      return card;
    }
    function reviewBlock(label, text, kind) {
      var b = document.createElement('div');
      b.className = 'fc-review-block fc-review-' + kind;
      var l = document.createElement('div');
      l.className = 'fc-review-blocklabel';
      l.textContent = label;
      var v = document.createElement('div');
      v.className = 'fc-review-blocktext';
      v.innerHTML = text ? esc(text).replace(/\n/g, '<br>') : ('<span class="fc-muted">' + esc(COPY.REVIEW_EMPTY) + '</span>');
      b.appendChild(l);
      b.appendChild(v);
      return b;
    }
    function setReviewMsg(card, text, ok) {
      var el = card.querySelector('.fc-review-msg');
      if (el) { el.textContent = text; el.className = 'fc-msg fc-review-msg ' + (ok ? 'fc-good' : 'fc-bad'); }
    }
    function markReviewApplied(card) {
      card.className = 'fc-review fc-review-done';
      card.innerHTML = '<div class="fc-review-donerow">\u2713 ' + esc(COPY.APPLIED) + '</div>';
    }

    // ============================================================
    // No-project / activate-first fallback
    // ============================================================
    function renderNoProject() {
      rootEl.innerHTML =
        '<div class="fc-card">' +
          '<h3>' + esc(COPY.NO_PROJECT_TITLE) + '</h3>' +
          '<p class="fc-sub">' + esc(COPY.NO_PROJECT_TEXT) + '</p>' +
        '</div>';
    }

    // ============================================================
    // Small helpers
    // ============================================================
    function setBusy(v) { state.busy = v; }
    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function readLS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function writeLS(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

    // ============================================================
    // Styles  (mirrors the tracker's teal card system, fc- namespace)
    // ============================================================
    function injectStyles() {
      if (document.getElementById('fc-styles')) { return; }
      var css =
        '#freedom-coach{max-width:620px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a2733;line-height:1.55;text-align:left;}' +
        '#freedom-coach .fc-card{background:#fff;border:1px solid #d8e0e7;border-radius:12px;padding:20px;text-align:left;}' +
        '#freedom-coach h3{margin:0 0 4px 0;font-size:19px;}' +
        '#freedom-coach .fc-sub{font-size:13.5px;color:#5b6b7a;margin:0;}' +
        '#freedom-coach .fc-center{text-align:center;color:#5b6b7a;font-size:14.5px;padding:8px 0;}' +
        '#freedom-coach .fc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
        '#freedom-coach .fc-project{border:1px solid #c4cfd9;border-radius:8px;padding:9px 10px;font-size:15px;font-family:inherit;color:inherit;background:#fff;max-width:200px;}' +
        '#freedom-coach .fc-intro{background:#eef6f3;border:1px solid #bcd9cf;border-radius:8px;padding:11px 13px;font-size:14.5px;margin-bottom:14px;}' +
        '#freedom-coach .fc-note{border-radius:8px;padding:10px 12px;font-size:14px;margin-bottom:14px;}' +
        '#freedom-coach .fc-readonly{background:#eef3f6;border:1px solid #c4cfd9;color:#5b6b7a;}' +
        // buttons
        '#freedom-coach button{font-family:inherit;cursor:pointer;border:none;border-radius:8px;font-weight:700;}' +
        '#freedom-coach button:disabled{opacity:.55;cursor:default;}' +
        '#freedom-coach .fc-refreshlink{background:none;border:none;color:#5b6b7a;font-size:13px;font-weight:700;cursor:pointer;padding:0;margin:0;min-height:0;border-radius:0;}' +
        '#freedom-coach .fc-refreshlink:hover{color:#1f6f5c;}' +
        '#freedom-coach .fc-refreshlink:disabled{opacity:.6;cursor:default;}' +
        '#freedom-coach .fc-sep{color:#c4cfd9;}' +
        '#freedom-coach .fc-recbtn{width:100%;background:#1f6f5c;color:#fff;padding:13px 18px;font-size:16px;min-height:46px;margin-bottom:8px;}' +
        '#freedom-coach .fc-recbtn:active{opacity:.85;}' +
        // more-help button (secondary)
        '#freedom-coach .fc-morehelpbtn{width:100%;background:#eef3f6;color:#1f6f5c;border:1px solid #cfe0d9;padding:11px 18px;font-size:14.5px;min-height:42px;margin-bottom:8px;}' +
        '#freedom-coach .fc-morehelpbtn:active{opacity:.85;}' +
        // round 5: more-help demoted from co-star button to a small link
        '#freedom-coach .fc-morehelplink{display:block;margin:2px auto 8px;background:none;border:none;color:#1f6f5c;font-size:13.5px;font-weight:700;padding:6px 10px;text-decoration:underline;min-height:0;}' +
        // round 5: the Freedom Home prompt card — one line, one button, peek link
        '#freedom-coach .fc-prompt-ready{font-size:14.5px;font-weight:700;color:#1f6f5c;margin-bottom:8px;}' +
        '#freedom-coach .fc-sendtool{display:block;width:100%;margin-bottom:2px;}' +
        '#freedom-coach .fc-peek{display:inline-block;background:none;border:none;color:#5b6b7a;font-size:12.5px;font-weight:600;padding:6px 0 0;text-decoration:underline;min-height:0;}' +
        '#freedom-coach .fc-prompt-old{opacity:.55;}' +
        // help panel
        '#freedom-coach .fc-help{}' +
        '#freedom-coach .fc-help-loading{color:#5b6b7a;font-size:14px;padding:8px 2px;}' +
        '#freedom-coach .fc-help-card{background:#f7faf9;border:1px solid #cfe0d9;border-radius:10px;padding:14px;margin:2px 0 10px 0;}' +
        '#freedom-coach .fc-help-goal{background:#fff;border:1px solid #cfe0d9;border-left:3px solid #1f6f5c;border-radius:8px;padding:10px 12px;font-size:14px;font-weight:600;color:#1a2733;line-height:1.4;margin-bottom:12px;}' +
        '#freedom-coach .fc-help-title{font-size:15.5px;font-weight:800;color:#1a2733;margin-bottom:4px;}' +
        '#freedom-coach .fc-help-sub{font-size:13.5px;color:#5b6b7a;margin-bottom:12px;}' +
        '#freedom-coach .fc-help-group{font-size:12px;font-weight:700;color:#1f6f5c;text-transform:uppercase;letter-spacing:.03em;margin:12px 0 6px 0;}' +
        '#freedom-coach .fc-feelings{display:flex;flex-wrap:wrap;gap:8px;}' +
        '#freedom-coach .fc-feelingbtn{background:#fff;color:#1a2733;border:1px solid #c4cfd9;border-radius:999px;padding:10px 15px;font-size:14px;font-weight:600;}' +
        '#freedom-coach .fc-feelingbtn:active{background:#eef6f3;}' +
        '#freedom-coach .fc-help-back{background:none;border:none;color:#1f6f5c;font-size:13.5px;font-weight:700;padding:0;margin:0 0 8px 0;cursor:pointer;}' +
        '#freedom-coach .fc-feeling-text{width:100%;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:8px;padding:11px;font-size:16px;font-family:inherit;color:inherit;resize:vertical;margin-bottom:10px;}' +
        '#freedom-coach .fc-thoughts-label{font-size:13.5px;font-weight:700;color:#1a2733;margin:4px 0 8px 0;}' +
        '#freedom-coach .fc-thoughts{display:flex;flex-direction:column;gap:9px;}' +
        '#freedom-coach .fc-thought{display:flex;align-items:flex-start;gap:9px;font-size:14.5px;cursor:pointer;}' +
        '#freedom-coach .fc-thought input{margin-top:3px;width:20px;height:20px;flex:none;accent-color:#1f6f5c;cursor:pointer;}' +
        '#freedom-coach .fc-thoughts-hint{font-size:12.5px;color:#5b6b7a;margin:8px 0 0 0;font-style:italic;}' +
        '#freedom-coach .fc-buildbtn{width:100%;background:#1f6f5c;color:#fff;padding:12px 18px;font-size:15px;min-height:44px;margin-top:14px;}' +
        '#freedom-coach .fc-buildbtn:active{opacity:.85;}' +
        // transcript
        '#freedom-coach .fc-transcript{display:flex;flex-direction:column;gap:12px;max-height:430px;overflow-y:auto;padding:12px 2px;margin:6px 0;}' +
        '#freedom-coach .fc-transcript:empty{padding:0;margin:0;}' +
        '#freedom-coach .fc-row{display:flex;}' +
        '#freedom-coach .fc-row-student{justify-content:flex-end;}' +
        '#freedom-coach .fc-row-coach{justify-content:flex-start;}' +
        '#freedom-coach .fc-bubble{max-width:86%;border-radius:14px;padding:11px 14px;font-size:15px;}' +
        '#freedom-coach .fc-bubble-coach{background:#eef6f3;border:1px solid #bcd9cf;border-bottom-left-radius:5px;}' +
        '#freedom-coach .fc-bubble-student{background:#eef3f6;border:1px solid #d8e0e7;border-bottom-right-radius:5px;}' +
        '#freedom-coach .fc-bubble-care{background:#fbf3ea;border:1px solid #e6d3b3;border-bottom-left-radius:5px;max-width:92%;}' +
        '#freedom-coach .fc-bubble-pending{color:#5b6b7a;font-style:italic;}' +
        '#freedom-coach .fc-p{margin:0 0 9px 0;}' +
        '#freedom-coach .fc-p:last-child{margin-bottom:0;}' +
        // prompt box
        '#freedom-coach .fc-promptbox{background:#fff;border:1px dashed #1f6f5c;border-radius:10px;padding:11px;margin-top:11px;}' +
        '#freedom-coach .fc-prompt-tool{font-size:13px;font-weight:700;color:#1f6f5c;margin-bottom:7px;}' +
        '#freedom-coach .fc-prompt{width:100%;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:8px;padding:10px;font-size:14.5px;background:#f9fbfa;font-family:inherit;color:inherit;resize:vertical;}' +
        '#freedom-coach .fc-copybtn{margin-top:8px;background:#1f6f5c;color:#fff;padding:9px 14px;font-size:14px;}' +
        // review card
        '#freedom-coach .fc-review{background:#fff;border:2px dashed #1f6f5c;border-radius:11px;padding:13px;margin-top:12px;}' +
        '#freedom-coach .fc-review-title{font-size:14px;font-weight:800;color:#1f6f5c;margin-bottom:4px;}' +
        '#freedom-coach .fc-review-summary{font-size:14px;color:#1a2733;margin-bottom:11px;}' +
        '#freedom-coach .fc-review-item{margin-bottom:12px;}' +
        '#freedom-coach .fc-review-field{font-size:13px;font-weight:700;color:#5b6b7a;margin-bottom:6px;}' +
        '#freedom-coach .fc-review-block{border-radius:8px;padding:9px 11px;margin-bottom:6px;font-size:14.5px;}' +
        '#freedom-coach .fc-review-now{background:#f4f7f9;border:1px solid #d8e0e7;color:#5b6b7a;}' +
        '#freedom-coach .fc-review-after{background:#eef6f3;border:1px solid #bcd9cf;}' +
        '#freedom-coach .fc-review-blocklabel{font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;font-weight:700;margin-bottom:3px;opacity:.8;}' +
        '#freedom-coach .fc-review-blocktext{white-space:normal;}' +
        '#freedom-coach .fc-muted{color:#9aa8b5;font-style:italic;}' +
        '#freedom-coach .fc-review-actions{display:flex;gap:8px;margin-top:4px;}' +
        '#freedom-coach .fc-applybtn{flex:1;background:#1f6f5c;color:#fff;padding:11px 14px;font-size:15px;min-height:44px;}' +
        '#freedom-coach .fc-dismissbtn{background:#eef3f6;color:#5b6b7a;border:1px solid #d8e0e7;padding:11px 14px;font-size:14px;}' +
        '#freedom-coach .fc-review-done{border-style:solid;border-color:#bcd9cf;background:#eef6f3;}' +
        '#freedom-coach .fc-review-donerow{font-size:14.5px;font-weight:700;color:#1f6f5c;}' +
        // input row
        '#freedom-coach .fc-inputrow{display:flex;gap:8px;align-items:flex-end;margin-top:10px;border-top:1px solid #eef0f3;padding-top:12px;}' +
        '#freedom-coach .fc-inputrow textarea{flex:1;box-sizing:border-box;border:1px solid #c4cfd9;border-radius:10px;padding:11px;font-size:16px;font-family:inherit;color:inherit;resize:none;line-height:1.4;max-height:140px;}' +
        '#freedom-coach .fc-sendbtn{background:#1f6f5c;color:#fff;padding:12px 18px;font-size:15px;min-height:44px;}' +
        '#freedom-coach .fc-sendbtn:active{opacity:.85;}' +
        // messages
        '#freedom-coach .fc-msg{font-size:13.5px;margin-top:7px;min-height:16px;}' +
        '#freedom-coach .fc-good{color:#1f6f5c;}' +
        '#freedom-coach .fc-bad{color:#b3392f;}' +
        // FULLSCREEN SHEET MODE (Freedom Home, phones — 2026-07-20, fixed
        // same day after Dave's real-account screenshots). Structure: the
        // card fills the sheet; fc-head pins at the top, fc-inputrow pins
        // at the bottom, and fc-scroll — intro, buttons, help panel, and
        // the UNCAPPED transcript — is the single scroll region between
        // them. The first cut instead flexed the transcript alone, which
        // over-constrained on real accounts (project picker + iOS chrome):
        // the composer fell off-screen and the shrinkable help panel was
        // crushed to 0px ("Close" with nothing revealed). Never mark any
        // content region shrinkable here; let ONE region scroll.
        // Additive: outside a .fh-coach-sheet nothing here matches —
        // inline and standalone embeds are pixel-identical to before.
        '.fh-coach-sheet #freedom-coach{max-width:none;margin:0;height:100%;}' +
        '.fh-coach-sheet #freedom-coach .fc-card{height:100%;box-sizing:border-box;display:flex;flex-direction:column;border:none;border-radius:0;}' +
        '.fh-coach-sheet #freedom-coach .fc-head{flex:none;}' +
        '.fh-coach-sheet #freedom-coach .fc-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;}' +
        '.fh-coach-sheet #freedom-coach .fc-transcript{max-height:none;overflow:visible;}' +
        '.fh-coach-sheet #freedom-coach .fc-inputrow{flex:none;}';
      var style = document.createElement('style');
      style.id = 'fc-styles';
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
