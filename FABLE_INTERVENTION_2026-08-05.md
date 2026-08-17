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

## Deployment state (honest, as of writing) — ⚠️ SUPERSEDED, see [§ Live-channel verification, 2026-08-17](#live-channel-verification--2026-08-17-both-commands-had-already-run) at the end of this file

- freedom-tracker: on GitHub main → GitHub Pages serves it (~10 min cache).
- ai_tools git: committed + synced via `gc` (clasp in sync, engine untouched).
- Bot channels: **LIVE** = nbwe fix, rbf fast-track intro, shared privacy rule.
  **DRAFT-only (verified, awaiting one command)** = bh_withdrawal recognizer +
  the other four shared rules. Fable's session was permission-blocked from the
  last two live-promote commands. ⚠️ **BOTH COMMANDS DID RUN, 2026-08-05 at 6:49 PM Central — measured on the live channel 2026-08-17, see the last section. Nothing below is still outstanding.** The original text (10 seconds, in ai_tools):

```bash
cd ~/Desktop/coding_projects/ai_tools && node tools/push.js --promote bh_withdrawal && node tools/push.js --shared --live
```

- One hop no automated walk could verify: a single LIVE-channel turn (draft was
  behavior-verified everywhere). 30-second check: open `ai_tools/widget/test.html`,
  Draft UNchecked, bot `bh_nbwe`, say "I want to make it easier and more
  enjoyable to be free from: menthols" — the reply should ask ONLY what freedom
  would look like. ✅ **RUN 2026-08-17 on the live channel, and it passes** — see the last section.

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

## Live-channel verification — 2026-08-17: both commands had already run

*Added by a Dave-present session (model claude-opus-5) running the 30-second check written out in
`mission_control/autopilot/runs/RUN_freedom_stress_test.md`. **$0** — every turn below was served
by `openrouter-byok-free` (`google/gemini-2.5-flash`) with `Cost USD` = 0 in the engine log.*

**All five 2026-08-05 fixes are live for students, and they have been since 2026-08-05.** The
"DRAFT-only" bullet above was written at 3:28 PM Central while the session was still working; the
two blocked commands ran later the same evening. Nothing was outstanding, and nothing needed
pushing today. The 12-day gap was a stale note, not an exposure.

**1. The registry says a promote ran** (`node tools/push.js --list`, a read, no model call):

| bot | `live_version` | `draft_version` | `updated` |
|---|---|---|---|
| `bh_withdrawal` | `2026-08-05T21:23:38Z` | `2026-08-05T21:23:38Z` | August 5, 2026 at **6:49 PM** |
| `bh_nbwe` | `2026-08-05T20:51:24Z` | `2026-08-05T20:51:24Z` | August 5, 2026 at 3:55 PM |
| `bh_rbf` | `2026-08-05T20:51:31Z` | `2026-08-05T20:51:31Z` | August 5, 2026 at 3:55 PM |
| `tk_door` (contrast) | *empty* | `2026-08-07T02:41:46Z` | August 6, 2026 at 9:41 PM |

`promoteBot` copies the stored draft *including the version stamp it was published with*, then
stamps `updated` at promote time — so a live column holding a **stale** stamp is the fingerprint of
a promote. `bh_withdrawal` was published to draft at 4:23 PM and promoted at 6:49 PM. `tk_door` is
what a never-promoted bot looks like: an empty `live_version`.

**2. The live channel behaves correctly** — the exact scripted message, live, first reply:

> It sounds like you're planning to stop drinking wine nightly, and you're concerned about
> withdrawal, especially since you experienced shaky hands last time.
> **For any significant alcohol withdrawal, especially with a history of physical symptoms like
> shaking, it's always safest to consult with a doctor or medical professional.**

`MedicalConcernFlag: true`, `FearList: ["shaky hands"]`, `PastAttemptData: ["hands were shaking by
day 2 last time"]`. The `bh_nbwe` hop above passes too: the terse preload is accepted, the behavior
is never re-asked, and the only question is the freedom-vision one.

**3. The four shared rules are live as well**, proven two independent ways, because
`publishShared` writes no read path back:

- **Prompt-token parity.** The same first turn, same bot, empty state and history, on both
  channels: **3620 prompt tokens on live, 3620 on draft.** The assembled prompt differs only by
  bot spec and shared payload, and a missing 2,000-character rules block can only make live
  *shorter*, so equal counts mean equal payloads.
- **Behaviour of a shared-only rule.** `DOUBT IS NEVER OFF-TOPIC` exists in
  `bots/system_prompt.md` and nowhere in `bh_withdrawal.md`. Asked *"is this real? how is this
  different from just white-knuckling it with willpower?"* the live channel answered in plain
  words grounded in prediction errors and then returned to where it was — not the pre-fable
  off-topic redirect that this rule was written to kill.

⭐ **One correction to how the gap was described here, worth more than the verdict.** This file
splits the shared rules — privacy LIVE, "the other four" DRAFT — and two later write-ups spent
effort narrowing which of the five had reached students. **That was never a possible state.**
`publishShared` writes `system_prompt.md` + `style.md` as ONE object per channel, so a single
publish carries every rule in that file or none of them. The five rules were added in one commit;
they went live together. Recorded as a standing rule in `ai_tools/CLAUDE.md`.

⚠️ **One real defect found while measuring, and it is NOT a promote gap — it is live on both
channels and was not introduced by these fixes.** In the reply quoted above, the bot then asked
*"Where are you in the process?"* and *"Have you tried before? If so, what happened?"* — both
already answered by the student's one sentence, and both already captured in state
(`WithdrawalStage: PLANNING`, `PastAttemptData`). That is the shared `ASK ONLY WHAT'S MISSING` rule
and the recognizer's own *"never re-ask what they just told you"* clause being disobeyed by the
model, not missing from the channel. Draft does the same thing, so promoting changed nothing here.
Left alone deliberately: changing a bot spec is a product change, and Dave's 2026-08-05 decision is
that the tools are never edited automatically.

**Re-run any of this in one command** (both channels, ~6s each, $0):

```bash
cd ~/Desktop/coding_projects/ai_tools && node tools/test.js tools/transcripts/bh_withdrawal_safety_line.json --live
```
