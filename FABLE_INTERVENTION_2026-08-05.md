# The Fable intervention — August 5, 2026, 3:28 PM Central

Dave's words, this afternoon: *"I had my before-Fable version, and now let's call
this my after-Fable version, where I gave Fable the ability to find room for
improvement via testing and to actually just improve it… baked in a way that, in
the future, I can always revert back to what I want, back to a way things were
before your edits."*

This file IS that bake. It records the exact boundary, every change, and the
one-phrase revert.

## The boundary

| Repo | BEFORE Fable (tag `before-fable-2026-08-05`) | AFTER Fable |
|---|---|---|
| freedom-tracker | commit `1c55063` — includes the stress-test REPORT, zero product changes | this branch's tip, tagged `after-fable-2026-08-05` |
| ai_tools | commit `d438bc9` | tip of main, tagged `after-fable-2026-08-05` |
| freedom_tracker_gateway | **untouched** (deliberately — the UB fix is client-side) | untouched |
| freedom_accelerator, Systeme pages, ads | untouched | untouched |

Both `before-fable` tags are pushed to GitHub, so the boundary survives any machine.

## Every change Fable made (all driven by the stress test's findings)

**freedom-tracker (the rail + harness):**
1. Score-question labels speak the student's words ("…NOT do menthols?") instead
   of "your UB" — guarded: placeholder labels ("my UB") and long labels keep the
   generic wording. Client-side only.
2. Wizard step 3 uses ONE name for the practice ("morning rewiring", proper noun
   once, "H&S" gone). Goal-room label matched.
3. The "Open your full Freedom Tracker" footer waits until Day 2.
4. After-Power-Hour sub-line points at the page's own payoff, and the Day-1
   celebrate card now SHOWS the movement ("Your Freedom Scores already moved:
   Easy 2→5 · Enjoyable 1→4 · Confidence 4→6") — paying the wizard's promise.
5. Privacy: a placeholder-shaped behavior makes every tool preload carry
   "…don't ask what it is."
6. Rail card says "Minimalist Freedom Plan" (matches the tool's own name);
   progress says "since Day 2"; harness score questions synced to production copy.

**ai_tools (bot specs — content only, ZERO engine code, no redeploy needed):**
7. `bh_nbwe`: accepts the guided page's first message even when terse or private;
   asks only the freedom-vision question; never re-asks the behavior.
8. `bh_rbf`: the no-questions fast-track introduces each prison guard in one
   clause the first time it appears.
9. `bh_withdrawal`: physical-symptom recognizer — shakes/sweats/etc with alcohol,
   benzos, or opioids puts the medical-supervision line in that same reply.
10. Shared rules (all 18 bots): DECLARED PRIVACY · DOUBT IS NEVER OFF-TOPIC ·
    ASK ONLY WHAT'S MISSING · LISTEN PAST COMPLIANCE · REUSING THEIR WORDS IN
    YOUR SENTENCES. Each one exists because a live walk caught the failure the
    same afternoon (documented with transcripts in
    [stress_test_2026-08/TOOL_DEEP_STRESS.md](stress_test_2026-08/TOOL_DEEP_STRESS.md)).

## Deployment state (honest, as of writing)

- freedom-tracker: on GitHub main → GitHub Pages serves it (~10 min cache).
- ai_tools git: committed + synced via `gc` (clasp in sync, engine untouched).
- Bot channels: **LIVE** = nbwe fix, rbf fast-track intro, shared privacy rule.
  **DRAFT-only (verified, awaiting one command)** = bh_withdrawal recognizer +
  the other four shared rules. Fable's session was permission-blocked from the
  last two live-promote commands. To finish (10 seconds, in ai_tools):

```bash
cd ~/Desktop/coding_projects/ai_tools && node tools/push.js --promote bh_withdrawal && node tools/push.js --shared --live
```

- One hop no automated walk could verify: a single LIVE-channel turn (draft was
  behavior-verified everywhere). 30-second check: open `ai_tools/widget/test.html`,
  Draft UNchecked, bot `bh_nbwe`, say "I want to make it easier and more
  enjoyable to be free from: menthols" — the reply should ask ONLY what freedom
  would look like.

## What was tested before vs after (the proof)

- BEFORE (the stress test, same day): terse preload → NBWE re-asked the behavior;
  "my UB" → four-question interrogation; doubt → off-topic brush-off; compliance+
  feeling → steamrolling congratulations; F&A → raw ramble pasted into sentences;
  shaky-hands drinker → no safety line + triple re-ask; Day 1 ended without the
  before/after numbers. All with transcripts in [STRESS_TEST_2026-08.md](STRESS_TEST_2026-08.md).
- AFTER (re-tested live on the draft channel, same afternoon): every one of those
  now behaves as described above, verified with the same feeds.

## The revert (Dave's fallback, guaranteed)

Portable phrase, any session, any day: **"revert the fable edits"**. What that
session will do (or you can, by hand):

```bash
cd ~/Desktop/coding_projects/freedom-tracker && git revert --no-edit before-fable-2026-08-05..main && git push origin main
```

```bash
cd ~/Desktop/coding_projects/ai_tools && git revert --no-edit before-fable-2026-08-05..main && gc "revert fable edits"
```

Then republish the reverted bot content (bots are served from the admin sheet,
not from git, so the revert must be re-pushed):

```bash
cd ~/Desktop/coding_projects/ai_tools && node tools/push.js bots/bh_nbwe.md && node tools/push.js bots/bh_rbf.md && node tools/push.js bots/bh_withdrawal.md && node tools/push.js --shared && node tools/push.js --promote bh_nbwe && node tools/push.js --promote bh_rbf && node tools/push.js --promote bh_withdrawal && node tools/push.js --shared --live
```

Reverting is additive (git revert, not reset), so the stress-test report, this
record, and anything you build later all survive a revert. Partial reverts work
too — every change above is its own small diff; tell a session which numbers to
undo.
