# Freedom Accelerator — decisions ledger

One entry per settled call, dated, with the reasoning that settled it and what would
reopen it. This file exists so Dave never re-lives a deliberation he already finished
(his ask, 2026-08-19 porch test: "so we don't keep reliving the same thoughts and
decisions every time... I investigated this and this is what we decided").

Read this BEFORE proposing any change to where the product lives or how its
projects behave. Newest entries at the top.

---

## 2026-08-20 · The Power Hour guides, it never forces (round 21)

**Decided (Dave's Eating Poorly V2 porch walk, executed on his green light "use your
intuition, do whatever you think is best"):**
- **Every step row and every pip on the Day-1 rail is a tappable door.** One card
  expands at a time; with no tap the router's pick expands, so the follow-the-blue-
  button path is unchanged. Browsing the four tools before committing is legitimate
  use, and out-of-order use is allowed.
- **A marked-done tool stays open forever.** Dave ticked tool 1 just to see tool 2 and
  hit a locked door ("as drunk grandpa, I made a serious mistake"). The fix is not an
  un-mark flow: the tick is a bookmark, and the reopened card says "Done ✓ You can use
  this tool again anytime, as much as you want." Nothing to undo, nothing to support.
- **The after-Power-Hour scores unlock at the FIRST tool, not the fourth.** Dave's
  call: "we will only track your freedom scores... if you have used at least one of
  the tools." Partial saves count (the ★ reads the day's own saved values, not just
  completion), and the copy still sells all four.
- **A receded skip door on Day 0 and the rail.** Gray link, then the fold: "Skipping
  is not recommended... But this is your journey. The four tools stay right here."
  Confirming stamps Day 1 with an empty day-1 save (no Gateway change — handleSave_
  already stamps day1Date on any first day-1 save), remembers the choice per project
  on the device pin, and lands on "Skipped for now. Nothing is lost." with one blue
  button back in. From Day 2 the daily rhythm wins regardless, so the flag self-heals
  across devices at midnight. A reset clears it (a reset revives, rule 33).
- **The UI-explainer lines are CUT.** "The tool fills your screen. The – button..."
  died; the breadcrumb teaches itself now that it is bold white (widget `.agt-crumb`
  opacity 1 / weight 700, coach sheet crumb white to match) — Dave: if we have to
  explain the functionality, "we have failed if we have not made it intuitive."

**Why:** people use things the way they feel like using them, not the way we planned.
Guidance must live in defaults and order, never in disabled taps — "we want drunk
grandpa guided in the most powerful direction possible without feeling forced or
obligated, where he resents the process." Doctrine: DRUNK_GRANDPA_STRATEGY rule 35.

**What Dave considered and dropped:** a start-over button beside "Continue my rewiring
session" — the widget's own ↺ (with its confirm line) already does it; his words:
"maybe that reset button is enough for now."

**Would reopen it:** real students wandering the doors instead of rewiring during
watched walks (the router's default expansion is the counterweight), or partial-scores
data proving so noisy it misleads the progress story.

---

## 2026-08-19 (evening) · The teardown round: how the reset lane and its room speak

**Decided (Dave's drunk-grandpa teardown of the porch build, same day):**
- **The reset card defines the UB before it asks about it.** It leads with "Your
  Unwanted Behavior (UB) that you want freedom from:" plus the student's own words,
  quotes the project name, and says plainly that day one means the Freedom Power Hour
  again and that there is no undo. The UB words render only for the project on screen
  (the UB lives on each tracker sheet; pulling it for every row would cost a sheet-open
  per project per state call — the speed architecture forbids it). Other rows keep the
  quoted label and the neutral "this behavior" wording. A privacy placeholder is never
  echoed back.
- **Manage rows fold behind one Options button** (Dave's design, verbatim: "each one
  only has one button, and it says Options... then Rename, Reset and Archive then
  appear on the line below"). One row open at a time.
- **The goal room offers no lifecycle verbs.** Its round-18 archive control ambushed a
  goal edit ("I don't know why I was given the option to archive my project there").
  Manage projects owns rename, reset, archive, restore. The goal room is for words.
- **A start-over must land re-personalized.** The tool ↺ now re-sends the mounting
  lane's own preload (the §1 re-entered-context seam, caught wearing a restart
  costume). Gated to preload-verified bots; Withdrawal restarts bare.
- **"FA" is the phone crumb.** Dave's call from the walk: the tool name deserves the
  bar space, and one tap teaches what FA means. Full name stays at >480px, on the
  coach sheet, and on the rail bar.

**Would reopen it:** a real student reading "FA" as noise during watched walks, or the
UB box needing to work for non-active rows badly enough to justify a Gateway change
(per-project UB in the registry, or ub riding the projects list).

---

## 2026-08-19 · A student can reset a project to day one, and it is HIS verb only

**Decided:** the Manage Projects room offers Reset beside Rename and Archive. A reset
saves everything into a History tab on the student's own sheet first (no snapshot, no
wipe), keeps the goal and the rewiring moment, requires a fresh baseline, restarts the
day count today, and re-stamps the project as ongoing. A better new baseline gets one
gold congratulations line. A worse one gets silence.

**Why:** Dave's porch test, day 71 of a stalled project: "what I really want to do is
just start this project again from day one... I already know what I want to do and my
rewiring moment and all that, so I don't want to enter all that in again." The old
philosophy line "streaks don't matter, there are no resets" still holds where it was
written: the SYSTEM never resets anyone, never breaks a streak, never demotes. This is
the student resetting himself, with his history banked. Dave: "this is a way to reset
and pick up from where I am and keep going."

**What the snapshot banks:** dates, day count, goal words, baseline, after-Power-Hour
scores, every daily score, wins, experiments, opportunities. Private notes stay out.
The point is decades of use: "we're able to save snapshots and move on, and keep the
spreadsheet managing this project for decades in this kind of a simple way."

**Would reopen it:** real students hitting the reset in confusing ways during watched
walks, or the History tab needing a student-facing view ("Saved history" was named as
a future Manage Projects option, not built).

---

## 2026-08-19 · The Freedom Accelerator lives on Systeme.io for now, one source of truth

**Decided:** students access the Freedom Accelerator through the Systeme.io course
lesson, and only there. The own-page door (the `/freedom/start/` magic-link build in
`dave_funnel_engine`) stays built and testable on the porch bench but is NOT offered
to students alongside Systeme.

**Why (Dave's own reasoning, porch test):**
- "There's got to be one source of truth... two doors to the same thing is going to
  get really, really confusing and probably lead to all sorts of problems I would not
  have even anticipated."
- Purchases naturally live there: "if they are buying books and courses and lessons,
  it's all hosted for them over there, so it's kind of natural for them to find what
  they bought from me there."
- The login wall reads as privacy to a student: "it makes clear your stuff is behind
  a name, an email, and a password, so it feels more private." The frameless page
  raised the opposite fear: "can anyone see what I'm working on on this page?"
- The real priority: "my focus is on seeing if I can sell this, first of all, right
  away... that's probably the most important question to answer."

**What own-page hosting would buy (recorded so the case never has to be rebuilt):**
days-remaining and access-window displays, upgrade offers ("here's how you can
upgrade if you want access to more projects"), possibly speed, full control of the
frame. The measured friction numbers already favor the page
(mission_control/reports/FA_FRONT_DOOR/FINDINGS.md), and the porch bench keeps both
doors walkable: https://go.alwaysgreater.com/fa-test/

**Would reopen it:** the Freedom Accelerator selling (the gate Dave named), or the
magic-link walk (PLAN_fa_door_decisions Phase 2) proving a frameless door so much
better that the one-source-of-truth cost is worth paying. The three parked calls that
touch this live in mission_control/plans/PLAN_fa_door_decisions.md.
