# PLAN: Fable freedom polish — act on the 2026-08 stress test

**Goal:** fix the red and yellow findings from [STRESS_TEST_2026-08.md](STRESS_TEST_2026-08.md) (tool-1 re-ask on terse UBs, the "my UB" privacy hole, the daily UB-jargon decode, the unpaid Day-1 proof, early escape doors, catalog fossils), deep stress-test the three daily tools Dave named (Rapid Behavioral Freedom, Fear & Anxiety, Withdrawal Helper) in the Accelerator context, and record a clean before/after-Fable boundary he can revert to with one phrase.

**Repos:** freedom-tracker (rail + harness, plain git, Pages) · ai_tools (bot specs + shared rules; clasp repo — commits via `gc`, bot content via `node tools/push.js`, NO engine changes so no `gc deploy`). freedom_tracker_gateway deliberately untouched (the UB fix is client-side).

**Created:** 2026-08-05 by Claude Fable 5, on Dave's green light ("merge, improve them, create the updates, do all of this"), same session as the stress test. **The revert contract:** tags `before-fable-2026-08-05` exist on freedom-tracker (1c55063, report included, zero product edits) and ai_tools (d438bc9), pushed to origin. Full revert recipe lives in [FABLE_INTERVENTION_2026-08-05.md](FABLE_INTERVENTION_2026-08-05.md) (written in Phase 5). Phrase: **"revert the fable edits"**.

## How to resume
Execute phases in order from the first not marked DONE. After every phase: run its verify, flip Status, append Per-phase notes, commit in the touched repo (freedom-tracker plain git to main; ai_tools via `gc`). Never pause between phases. Design decisions are settled.

## Design decisions (settled)
1. **UB de-jargon is CLIENT-side.** The rail substitutes the student's own short label into score-question labels at render. No Gateway edit, no `gc deploy`, works under UI-Copy overrides too. Substitution skips placeholder-shaped labels ("my UB" stays "your UB") and labels over 40 chars.
2. **Privacy gets two layers.** Rail: placeholder-shaped UBs make every preload carry one extra sentence ("don't ask what it is"). Shared bot rules: one line honoring declared privacy in ALL tools (covers coach-handoff prompts the rail can't rewrite). Additive, revertible.
3. **Bot edits are minimal additive instruction lines** in the same class as the round-10 no-questions fast-track: they honor promises the integration already makes. Flow: edit spec → push DRAFT → live harness verify → promote LIVE (+ shared `--live`). Standalone lessons inherit them; that is correct (same promises there).
4. **The Day-1 delta renders from progressReview** (already prefetched), silently skipped when absent. Harness mock extended to serve it so the state is forceable (doctrine §4.9).
5. **No essay shortening, no completion enforcement, no new features** — per the stress test's own calls.

## Phases
| # | What | Status |
|---|------|--------|
| 1 | Words pass (rail copy + harness sync) | DONE 2026-08-05 |
| 2 | Day-1 proof: celebrate delta | DONE 2026-08-05 |
| 3 | Tool-edge contracts (NBWE terse-accept, shared privacy rule, RBF fast-track intro) — draft → verify → LIVE | DONE 2026-08-05 |
| 4 | Deep tool stress: RBF full session + F&A + Withdrawal + FGS/CJC terse spots + scramble log check | DONE 2026-08-05 (4 more defects found+fixed; 2 promotes await Dave, see notes) |
| 5 | The before/after record: FABLE_INTERVENTION doc, after-fable tags, dashboard, pushes | DONE 2026-08-05 |

## Phase specs

### Phase 1 — Words pass (freedom-tracker)
- `freedom-home.v1.js`: scoreQuestion() substitutes the project label for "your UB" (guarded per decision 1) · WIZ3 copy → one name ("morning rewiring", proper noun once, no "H&S") · footer full-tracker link renders only when currentDay ≥ 2 · PH_SCORES_SUB → "Tomorrow this page starts showing your movement, next to these." · progress "Last ~7 days (since Day 2)" · TOOLS name → "Minimalist Freedom Plan".
- `test_home.html`: SCORE_QUESTIONS synced to the Gateway's baked copy (§4.5 mocks-mirror-reality).
- Verify: harness walk wizard → day1 → day5 → day9 at 1280 + 375; zero console errors; substituted labels visible; footer absent pre-day-2.

### Phase 2 — Day-1 proof (freedom-tracker)
- `renderDay1Done()`: when progressCache.hasData, add one line under the celebrate text: "Your Freedom Scores already moved: Easy {b}→{a} · Enjoyable {b}→{a}[ · Confidence {b}→{a}]." Mock: day-1 after-scores save builds M.progress from the wizard baseline + entered dayScores.
- Verify: full harness Day-1 walk shows the real entered numbers; day1_scores scenario still clean when no baseline exists.

### Phase 3 — Tool-edge contracts (ai_tools)
- `bots/bh_nbwe.md` Screen 1: accept a terse first-message behavior, never re-ask identity, ask only the freedom-vision question.
- `bots/system_prompt.md`: one privacy line (placeholder/declined behavior name → never ask what it is, coach generically).
- `bots/bh_rbf.md` no-questions fast-track: introduce a prison-guard character in half a line on first use.
- `freedom-home.v1.js`: placeholder-shaped UB ⇒ preloads append the privacy sentence.
- Flow: `node tools/push.js` (drafts + shared) → harness live-verify (terse preload on NBWE: no re-ask; "my UB" preload: no identity digging; RBF fast-track: character introduced) → `--promote` bh_nbwe + bh_rbf, `--shared --live` → `gc` commit.

### Phase 4 — Deep tool stress (no product edits unless trivial spec lines; loop once)
- RBF (Dave's "where people are most of the time"): one full daily-handoff session — layer choice, mid-flow student question, off-topic drift, terse answers — plus weird-feed probes. F&A: real session with a rambling fear. Withdrawal: real session, safety-line check. FGS + CJC: terse preload spot checks (the NBWE class question).
- `node tools/logs.js 40`: classify Derek's scrambled reply (parse flake vs provider flinch).
- Output: appendix in the stress-test working folder + verdicts in Per-phase notes; trivial spec fixes get one loop through the Phase-3 flow.

### Phase 5 — The record
- `FABLE_INTERVENTION_2026-08-05.md`: the boundary (Aug 5, 3:28pm Central), per-repo before/after tags + commits, every change, the exact revert recipe, portable phrases. DASHBOARD row updated. `after-fable-2026-08-05` tags pushed. PLANS.md row. All repos pushed.

## Per-phase notes (executor appends as phases complete — do NOT pre-fill)

**Phase 1 — DONE 2026-08-05.** Seven items shipped in freedom-home.v1.js + test_home.html: score-label UB substitution (guarded by ubIsPlaceholder_ + 40-char cap), wizard step 3 single-named ("Pick your morning rewiring moment", proper noun once, no "H&S"), footer full-tracker link gated to day ≥ 2, PH_SCORES_SUB → "Save them and you'll see your movement right away.", progress "(since Day 2)", rail tool name → "Minimalist Freedom Plan", harness SCORE_QUESTIONS synced byte-for-byte to the Gateway baked copy. Harness-verified: step-2 labels read "…NOT do menthols?" after a real-word step 1, stay "your UB" after a "my UB" step 1; footer absent on day0/wizard, present on day5; zero console errors. `node --check` clean.

**Phase 2 — DONE 2026-08-05.** day1DeltaHtml_ + PH_DELTA_PRE + post-save review re-pull + prefetch re-render guard (id fh-day1-delta), and the mock now builds progressReview from the walk's own numbers (baseline captured at setupSave, §4.9 forceable). Verified in a full harness Day-1 walk: celebrate card shows "Your Freedom Scores already moved: Easy 2→5 · Enjoyable 1→4 · Confidence 4→6" (the exact entered values); the day1_scores scenario (no baseline) renders no line.

**Phase 3 — DONE 2026-08-05.** Spec edits shipped: bh_nbwe Screen-1 guided-page contract (accept terse/placeholder X, vision question only), bh_rbf fast-track one-clause guard intros, shared DECLARED PRIVACY, plus the rail's preloadUbText_ privacy tail (that half rode the phase-1+2 commit). Draft-verified against the live draft engine: "menthols" preload → vision question only (re-ask gone); "my UB" preload → tail visible in the sent message, zero identity digging, coached generically; fast-track reply named every guard ("🚫 Helpless Harry — the guard that attacks your capability…"). Promoted LIVE: bh_nbwe, bh_rbf, shared(privacy). ai_tools committed+synced via gc. One hop not machine-verified: a live-channel turn (draft==live content after promote; the 30-second live spot-check is written into FABLE_INTERVENTION_2026-08-05.md — the harness runs draft-only and the widget test page needs keys this session was rightly blocked from typing).

**Phase 4 — DONE 2026-08-05, and it earned its keep: FOUR more defects found live, fixed, and re-verified same hour.** Full evidence: [stress_test_2026-08/TOOL_DEEP_STRESS.md](stress_test_2026-08/TOOL_DEEP_STRESS.md). (a) RBF: sincere doubt ("do i have to believe this?") got the off-topic brush-off → shared DOUBT IS NEVER OFF-TOPIC; re-test = real plain-words answer then back to the menu. (b) RBF: "k done. still feel kinda gross tho" → "Congratulations!" steamroll → shared LISTEN PAST COMPLIANCE; re-test = feeling worked first. (c) F&A: raw three-fear ramble pasted verbatim into sentence frames (twice) → shared REUSING THEIR WORDS IN YOUR SENTENCES; re-test = distilled, grammatical. (d) Withdrawal: shaky-hands+sweats nightly-wine case got NO safety line and a triple re-ask → bh_withdrawal Screen-1 symptom recognizer + shared ASK ONLY WHAT'S MISSING; re-test = supervision line in the first reply, zero re-asks. Also: FGS + CJC terse preload spots CLEAN (NBWE was the only offender), RBF handled drift+menu combos and stayed structurally strong (Dave's "where people are most of the time" verdict: strong, and now conversationally strong). Scramble check via tools/logs.js: all 200s, no error class, identical resend succeeded 58s later → transient parse flake, NOT a safety flinch; armor is sufficient, no change made. ⚠️ Two live-channel promotes were permission-blocked in this session (classifier): bh_withdrawal + the updated shared layer are DRAFT-verified and awaiting `node tools/push.js --promote bh_withdrawal && node tools/push.js --shared --live` (also in the intervention doc).

**Phase 5 — DONE 2026-08-05.** [FABLE_INTERVENTION_2026-08-05.md](FABLE_INTERVENTION_2026-08-05.md) written (the 3:28 PM Central boundary, per-repo tags, all 10 changes, deployment state, the one-phrase revert with exact commands incl. the bot-republish step, partial-revert note). after-fable-2026-08-05 tags pushed on freedom-tracker + ai_tools. DASHBOARD row updated to before/after. PLANS.md row added. freedom-tracker pushed to main; ai_tools gc-synced.

