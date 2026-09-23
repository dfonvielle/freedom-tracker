# Freedom Accelerator — decisions ledger

One entry per settled call, dated, with the reasoning that settled it and what would
reopen it. This file exists so Dave never re-lives a deliberation he already finished
(his ask, 2026-08-19 porch test: "so we don't keep reliving the same thoughts and
decisions every time... I investigated this and this is what we decided").

Read this BEFORE proposing any change to where the product lives or how its
projects behave. Newest entries at the top.

---

## 2026-09-22 · The Minimalist Freedom Plan is the 2-Minute Daily Plan (V27)

**Decided (Dave, 2026-09-22, while renaming the tool's button in the AI Freedom Program's lesson: "rename it everywhere ... along with all your other catches"):** the second Power Hour tool is called the 2-Minute Daily Plan on every surface a student reads. On this rail: the Day 1 card (name 2-Minute Daily Plan, still tagged core daily plan), the what-happens-next refresher line, the revisit link under How it works, and the Day 1 Guidance list in loader.v7.js. The foot says V27.

**Why here too:** since round 23 the card opens the hosted door, whose header reads the site's terms file, and that says 2-Minute Daily Plan now. A card that still said Minimalist Freedom Plan would disagree with the bar above the tool it opens (finding 8).

**Not changed, on purpose:** the save keys (d1_t2) and the tool id (bh_minplan), which students never see, and the older loaders (v4 to v6), which keep their old words: the live lessons load loader.v7.js (CLAUDE.md rule 1).

**Reopen if:** Dave names the tool something else. The name lives in two places on this rail (the TOOLS card name and the three copy lines), and on the site in one (the terms file).

---

## 2026-09-20 (night) · The door frame follows the phone keyboard (V26)

**Decided (Dave, 2026-09-20 night, his drunk grandpa walk of a tool on his phone inside the AI
Freedom Program's lesson, which frames the same hosted doors this rail frames: "if I click I have
more to share, what happens is this keyboard comes up, and I'm like, 'But where am I typing? What am
I doing with this keyboard? As Drunk Grandpa, I have no idea.' ... even if I scroll, I can't see the
input field ... For every single AI tool that I have ... this problem must be solved"):**

- **The cause was the frame, not the tool.** Every door already reveals its message box and puts
  the cursor in it when a student presses *I have more to share* or *Help me with something else*.
  A phone keeps the page the full height of the screen and lays the keys over its bottom; a page on
  its own shrinks itself above the keys (the door's phone fit), but a page inside a frame is never
  told, because only the top page's visual viewport shrinks. The `.fh-door` frame stayed the whole
  screen, with the box at its foot, under the keyboard.
- **So this rail sizes the door frame to what the keyboard leaves free.** `doorFit_` reads the
  visual viewport of the window that owns the phone screen (the parent's when the lesson iframe is
  the takeover layer, this page's when the rail is the page itself, nothing on the inline desktop
  rail), and while the keyboard is up (a gap over 120px at scale 1) moves `.fh-door` to the visible
  part: top and height off the viewport, `resize` and `scroll` watched, cleared the moment the
  keyboard goes or the door closes. The same twelve lines the program lesson's embed
  (`program.v1.js` version 8) and the program page's own frame carry, all after the popup embed's
  `fitFrame` from 2026-09-05.
- **No shell version moved, and no pin.** The box and its focus are the shared runtime page; the
  frame is this host's. Every door still serves its pinned pairing and its ⋯ foot says so.
- **The foot says V26.** His ruling from the same day stands (V for version, never "round").

**Not changed:** the rail, the coach, the session grammar, the ⋯ menu. **Honest limit:** this Mac
has no iOS simulator, so the move was proven on the lesson harness at phone width by handing the
rail a pretend viewport (`window.__fhDoorFit({height: 476, offsetTop: 0, scale: 1})` on the lesson
frame's window: the door shrank to 476px, the stub's frame with it, and grew back at 812). That a
phone's top page really reports the keyboard through its visual viewport while a frame holds the
focus is the assumption the popup embed has run on since 2026-09-05; Dave's phone walk is the proof.

## 2026-09-20 · The same ⋯ as the AI Freedom Program's lesson, from the same file (round 25)

**Decided (Dave, 2026-09-20, his drunk grandpa walk of the AI Freedom Program's lesson embed and
then this one on the same phone: "we have the minus button ... But we do not have those three
dots ... I want those exact same three dots, exact same functionality across all these things
that I have, like the Freedom Accelerator and the AI Freedom Program ... So we are not
duplicating the functionality. It is the same functionality"):**

- **The menu is one file, and it is the site's.** `go.alwaysgreater.com/tool/embed/access-menu.v1.js`
  (source `ai_tools/davenode/student/embed_menu.js`, the same text the builder puts at the top
  of the program lesson's `program.v1.js`) draws the ⋯ button and its box: *AI Access* · one blue
  **See details and options** · *Signed into platform as* · the address · a foot line. This stub
  loads it at boot and hands it who is signed in and what a press does. A change to the words is
  one edit on the site; both lessons pick it up on their next load, and this file never ships a
  copy of them.
- **Where it sits.** Phones: beside the minus in the solid top bar, in a right hand cluster (the
  program lesson's shape). Desktop, or a phone that stayed inline: a blue strip above the rail,
  *Freedom Accelerator* left and ⋯ right, made once outside the render. The foot says
  *Freedom Accelerator · V25* (amended the same day, his next walk: *"Round is a weird phrasing.
  Let's just call it V25, V for version ... we don't need to create a whole new version for
  this"*, so the round number stays 25 and only the foot's word moved: every menu he opens now
  says its version the same way, *Version 6* on the program lesson, *V<shell> · D<document>*
  inside every tool).
- **The press vouches with the student's own program token.** `POST /api/access/?door=lesson`
  with `{ email, fa }` (the email Systeme showed this page, the `ag_ft_token` this page already
  holds): the site asks the Gateway whether the token is real, the same question every hosted
  door asks before it covers a message, and answers a 15 minute sign-in token that the frame
  walks through the verify door to `/my-ai-freedom/?via=lesson` (the AI Access page: the four
  ways, the account vault, the add-time lane). No lesson key had to be pasted into this lesson.
  The page opens in the same fullscreen frame the tools use and comes back on `agdoor: 'home'`.
- **A refusal lands under the bar in the door's own words** (a token the Gateway does not know,
  a device not yet activated, no identity, no connection), gone after a few seconds.

**Not changed:** the rail, the tools' doors, the session grammar, the token at the door. **Honest
limit:** the vouch names the email the platform showed; that is the lesson door's limit since it
was built (mission_control DRUNK_GRANDPA_STRATEGY rule 38). **Proof:** the FA harness at
`test_home_lesson.html?base=http://localhost:4179` (phone) and `test_home.html?s=day5&base=…`
(desktop) with the lesson harness running: the menu drew with the same words in both, the press
posted `{email, fa}` and the door's refusal for the mock token landed under the bar. A real
student token opening the page is Dave's walk. Harness hooks: `?base=` on the two test pages
points the menu and the vouch at a local site, and the harness's fetch stub passes that site's
`/api/` through.

## 2026-09-17 · One header on a hosted door, the door's own (round 24)

**Decided (Dave, 2026-09-17, his drunk grandpa walk of the Accelerator's doors: "we don't want
these two competing ribbons... home icon, tool name, three dots, and then the X to close"):**

- **The frame draws no bar of its own.** Round 23's "Freedom Accelerator › {tool} · ↺ Start
  over · –" bar sat over the door's own header, so a student read two headers and neither ✕
  did anything. The door's header is the header now: 🏠 · tool name · ⋯ · ✕. The 🏠 and the
  ✕ both go back to the rail; the door tells this page so with one message (`agdoor: 'home'`)
  and the page closes the frame exactly the way the old crumb did. Start over lives in the
  door's ⋯ menu (the door offers it because this frame locked it) and arrives as
  `agdoor: 'restart'`, which bumps the session generation exactly the way the old ↺ did.
  Only the frame this page opened is listened to, as before.
- **The frame allows local-network-access**, so the owner's own door can reach his Mac from
  inside it (the developer lane's bridge). A student's door never asks for it.
- **The names shortened with the doors**: the door's header wears the roster name
  ("Rapid Behavioral Freedom Tool", never "SYBR Method: ..."). That is the door's change
  (ai_tools bake), recorded here because it is what a student reads over this frame.

**Not changed:** the session name grammar, the running start, the token at the door, the
`?tools=widget` gate, the rail underneath. His live walk of the round is pending: the 🏠, the ✕
and Start over inside the frame are his to confirm.

## 2026-09-16 · The tools are the hosted doors now, and a student's own token is their key (round 23)

**Decided (Dave, 2026-09-16, his ask: "I want to be able to use these tools with my Freedom
Accelerator program and connect them to those... the integration hasn't happened... I want that
all integrated as well"):**

- **Freedom Home opens the seven pinned tools as hosted doors, not the engine widget.** Every
  tool he has ruled official (`bh_nbwe`, `bh_minplan`, `bh_feelgs`, `bh_cjc`, `bh_withdrawal`,
  `bh_rbf`, `bh_fearanxiety`) is served at `go.alwaysgreater.com/tool/<id>/` from the shell and
  document he pinned. Opening one from the rail opens THAT page in a frame that owns the whole
  screen, wearing the program's bar ("Freedom Accelerator › {tool}", the left name goes back,
  ↺ Start over, –). The rail underneath is untouched: done ticks, ★ scores, Continue, the
  skip door. His pin rulings all said "wherever the tool is offered, the Freedom Accelerator
  included"; this is the surface that was still serving the old widget.
- **The student's own program token is their key at the door.** The door's money gate asks
  the Gateway whether the token is real (`state`, token only) and covers the program's year;
  a buyer through the funnel is covered by that purchase first. Nothing is typed, nothing is
  bought twice, and a stranger with an email alone gets nothing. Reopens if the Gateway ever
  stops answering `state` with the projects list.
- **A session is named per project, and Start over is a new name.** `#session=p<id>-ph-<bot>`
  rides the door's launch hash, so a second project never resumes the first (the round-18
  scoping, kept), and ↺ bumps a generation instead of clearing anything. Resume is what the
  door reports back (one message: the tool, the session, "spoke"), never a guess.
- **The old widget stays one visit away.** `?tools=widget` on the lesson URL keeps the engine
  widget for that visit, for comparison; it is never remembered. The widget code stays in the
  file. Reopens the day the doors are wrong for a class of student the widget served.
- **What did not change, on purpose:** `d1_t1..d1_t4` ticks are still the student's own press
  ("I finished this tool → Continue"), never a signal from the tool; the coach handoff still
  rotates to a fresh session when the current one has turns; the Withdrawal Helper stays the
  optional fifth step and opens bare.

**Proof:** the mock harness (`test_home.html`, door stub `test_door_stub.html`) walked
`day1_fresh`: Open → the frame's address carried the tool, the identity, the token, the
project-scoped session name, the contract sentence and `lock=1`; the stub's "spoke" message
flipped the rail's button to Continue; the crumb closed the frame; Start over reopened on
`-r1`; `?tools=widget` mounted the old widget. ⏳ Not yet walked live: a real student token
against the real doors (Dave's test account is the first walk).

---

## 2026-08-20 (pm) · The end of Day 1 teaches tomorrow, and the day boundary is not a cage (round 22)

**Decided (Dave's second walk of the round-21 build, a full brain dump ending "trust your
intuition, create the plan and execute it"):**

- **The Withdrawal Helper is step 5 of the Freedom Power Hour, and it is optional.** Dave's
  framing: the Power Hour is one-time power moves, and the Withdrawal Helper is a one-time
  power move — some behaviors need it, most do not. It renders as "5 · Withdrawal Helper"
  with a gray *optional* tag, opens and bookmarks like the other four, and requires nothing:
  completion, the ★ scores unlock, the skip-door phrasing, and the router's guidance all
  still count only the four core tools. Deliberate, not an oversight — "all four" copy,
  completion[1], and the scores threshold keep one meaning. The Gateway needed nothing: its
  day-1 spec has carried `d1_withdrawal` with `optionalCheck: true` since v6.3. The safety
  line ships with the tool here exactly as it does in More-help.
- **The Minimalist Freedom Plan wears its importance.** A small blue "core daily plan" pill
  (blue = do) on its row and card, and the blurb says why it outranks its siblings: from
  Day 2 on, that tiny plan is the student's core daily move. Dave's worry was grandpa
  skipping the ONE tool the rest of the program depends on.
- **Whether he used every tool or none, the end of Day 1 answers tomorrow.** Both end cards
  (skipped and celebrate) carry the same "What happens next" card: Day 2 starts tomorrow
  morning, the 30-second-to-2-minute rewiring at the student's own saved moment (quoted word
  for word), the promise that the Minimalist Plan tool stays here as a refresher, and the
  coach + 7-to-22-minutes line. Clarity on the path is peace of mind — grandpa's exact
  questions ("when does day 2 start for me? what exactly am I going to do?") get answered
  before he asks them.
- **The recommended schedule gets a receded early door (rule 35 crossing the day
  boundary).** "I want to start my daily rhythm early ›" under both end cards, with the
  not-recommended case in plain words and the comeback promise. Dave's reasoning: someone
  scared and stressed who just finished the Power Hour and wants to keep working with the
  AI coach tonight should never have that momentum killed by a midnight gate. Confirming is
  purely local (Day 1 is already stamped) and lands on **the early daily rail**: the talk
  card with the real coach, progress, More-help, and one link back to the Power Hour.
- **The early rail is the talk step only — steps 1 and 3 stay tomorrow's.** The morning
  rewiring has had no morning yet, and Day 1's scores already live in the Power Hour's ★
  step. Rendering those steps early would invite writes that fight the day-1 row and teach
  a false rhythm. What the early student actually wants — Dave's words — is "access to the
  AI coach early," and that is exactly what the door opens.

**What Dave floated and this round dropped, with the why:**
- **Showing the unlock time or letting grandpa edit his timezone.** The day already rolls at
  the student's local midnight from his browser's own timezone, silently and correctly.
  "Tomorrow morning" is the entire honest answer; a clock or a timezone editor adds a
  concept and a decision for a mechanism grandpa should never have to know exists. Dave
  himself was on the fence ("I don't know if that's good or not") — the doctrine's
  subtraction test settled it.
- **The full daily rhythm on Day 1.** Considered as the early door's landing; dropped
  because steps 1 and 3 are dishonest on Day 1 (above) and the daily grid's day-1 writes
  would need the Gateway's `variant: 'daily'` lane threaded through the rail's save paths
  for no student benefit.

**Would reopen it:** real students reading the optional fifth step as an obligation during
watched walks, the early door pulling students away from finishing the four core tools, or
the What-happens-next card reading as a wall of text on a phone.

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
