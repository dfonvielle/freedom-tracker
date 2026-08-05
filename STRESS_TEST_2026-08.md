# Freedom Accelerator stress test — August 2026

*Run 2026-08-05 by Claude (Fable), playing brand-new confused students against the whole student path. Findings only. Nothing was changed, per Dave's registered decision (DREAMS.md: freedom-tools-stress-test, DECIDED 2026-08-05).*

## Dave's framing (the spec, in his words)

> Test a variety of common unwanted behaviors, bad habits, and addictions, the way students really will: kind of confused, rambling, talking about different things, guided through the AI tool to automatically get set up and running. The tool gives them options of things to do or not do. A lot of it is templated to some degree, so some phrasing might read weird. Pay attention to where something looks weird to a student and whether all the AI help is overwhelming or helpful. Could we get the same effect in less time or effort, or have we already reduced that enough? Take a really critical look at the Freedom Accelerator from a lot of different angles.

## What was tested, and how

Six personas across six behaviors (menthol cigarettes, doomscrolling + weed + energy drinks, evening wine, porn, sugar after dinner, sports betting), varying patience, verbosity, tech comfort, and time of day. Including the required rambler (Marcus, three topics plus a question in one message) and the required three-word answerer (Tammy, 58).

- **Where:** the repo harness `test_home.html` (all ten scenarios), at phone width (375, fullscreen takeover active) and desktop (1280). The Gateway was fully mocked by the harness, so **zero live student records were touched**. Bot conversations ran against the **live draft engine** (real model replies, real latency 5 to 15s per turn); sessions live only in the test browser's localStorage, and engine logs are metadata-only per `ai_tools/HANDOFF.md`.
- **Walks:** Tammy did the complete Day 1 (wizard → Day 0 → Power Hour with a real NBWE session → ticks → after-scores → celebrate). Marcus did the Day-5 daily loop (ramble at the coach, log-then-tell chip + Undo, guided flow, ready card, real RBF handoff). Derek did the "my UB" privacy path against a real tool. Rosa did Day-9 progress + the daily log. Kev read the explainer and every time-promise. Jen opened the Fear & Anxiety and Withdrawal tools. Plus the milestone card, the decision room, and the fresh-buyer "setting up" screen. Transcripts: [stress_test_2026-08/transcripts/](stress_test_2026-08/).
- **Also read end to end:** the welcome email, the rail (`freedom-home.v1.js`), the coach (`coach.v3.js`), the Gateway coach files (voice, chat instructions, guided flow, distress gate), and the six bot specs' greetings and openings.

## What was NOT tested, and why

- **Live coach replies** (chat, recommend, guided build). The harness cans them, and the live coach writes real student state, which this test was fenced from. The coach's canned copy, its model instructions, the chips, Undo, doors, and the handoff mechanics WERE tested. The coach's actual conversational judgment with a rambler was not. A safe probe plan is in the proposed plan below.
- **Feel Good Start and Create Joyous Chaos live openings** (round-20 proofs trusted; given finding 2 below, they deserve the same terse-input spot check NBWE got).
- **The real Systeme lesson embed on a real phone.** That is plan Phase 10, Dave's own walk, unchanged.
- **UI Copy tab overrides.** This test judged the baked copy; sheet cells can override it live.
- **The distress gate.** Code-verified (patterns fire before any model call, in chat and in guided-flow free text, with the verbatim 988 support message). The harness stub has no distress branch, and testing it against the live coach was fenced.
- **go.alwaysgreater.com** was never visited. Ads and splits untouched.

---

## Findings, in the order a real student hits them

Severity: 🔴 fix before more students · 🟡 worth a session soon · ⚪ polish.

### 1 🟡 The product's most-repeated words are its own jargon: "your UB"
**Where:** wizard step 2, the after-Power-Hour scores, and the daily log. Every scoring surface, every day.
**What happened:** Tammy typed "menthols" on step 1. Ten seconds later, three questions in a row asked about "your UB" ("How EASY is it to not do your UB?"). The abbreviation was invented one screen earlier. She now decodes UB → Unwanted Behavior → menthols, three times per scoring, every single day.
**What she feels:** a small translation tax at the exact moment she is being asked to reflect. The system knows her words and speaks its own instead.
**Smallest fix:** a `{UB}` token in the Gateway's `SCORE_QUESTIONS` (and the loaders substitute the student's short label, falling back to "your unwanted behavior" when it is long or placeholder-shaped). "How easy is it right now to not smoke menthols?" reads like a person asking.
**Removes:** one mental decode × three questions × every day of the program. The single highest-frequency friction found.

### 2 🔴 Tool 1 re-asks the question the page just answered
**Where:** Day 1, first tool (No-Brainer Willpower Eliminator), first reply. The first AI contact of the entire product.
**What happened:** the rail auto-sent Tammy's wizard sentence ("I want to make it easier and more enjoyable to be free from: menthols"), and the tool replied: *"Can you tell me more specifically about what behavior or habit you want to stop? When, where, or how often does this happen?"* Two questions in one message, re-asking what she answered twice, while dropping the greeting's second question (the freedom vision) entirely.
**What she feels:** "the machine didn't hear me." For a skeptic, on the very first exchange, that is the whole verdict forming.
**Why it happens:** the round-20 preload proof used richer wording. A terse wizard answer (which is NORMAL — grandpa types two words) degrades the contract. Minimalist Plan handled the identical preload perfectly, straight to personalized work, so this is NBWE's Screen 1 contract, not the preload's design.
**Smallest fix:** one line in `bh_nbwe` Screen 1 (same class as the round-10 no-questions fast-track, a content fix honoring the integration's promise): *"If the first message already names the behavior, however tersely, accept it. Do not re-ask what it is. Ask only the freedom-vision question."* Then re-verify Feel Good Start and CJC with terse UBs too.
**Removes:** one full model round trip (10 to 30 seconds of typing dots) + one re-typed answer, for every terse student, at the most first-impression-heavy moment in the product.

### 3 🔴 The wizard's own privacy promise has no contract in the tools
**Where:** wizard step 1 placeholder: *"or just write 'my UB' to keep it private"* → Day 1, tool 1.
**What happened:** Derek (porn, 1am, embarrassed) took the wizard's offer. The first tool reply challenged it (see finding 2), and when he said *"id rather not say what it is. thats why i put my UB"*, the tool "accepted" and then asked FOUR questions in one message (consume / action / mental-pattern categorization plus the vision question). An interrogation about the thing he explicitly declined to name. It took a volunteered euphemism before the flow proceeded (and from there it worked, with the euphemism respected).
**What he feels:** cornered at his most hesitant. This is the embarrassed-behavior segment — a real slice of "common unwanted behaviors and addictions."
**Smallest fix (rail-side, no tool touched):** when the UB is placeholder-shaped ("my UB", "private", "rather not say"), the preload adds one sentence: *"I'd rather not name the behavior. Please work with it as 'my UB' and don't ask what it is."* Optionally, one line in the shared bot rules honoring declared privacy (accept placeholders, skip identity digging).
**Removes:** two-plus shame-flavored turns and one broken promise, for exactly the students most likely to bounce silently.

### 4 🟡 The armor fired at the worst possible moment (and worked)
**Where:** Derek's most vulnerable message ("something i watch online late at night… not feel gross about myself").
**What happened:** *"Hmm - that reply came out scrambled on my end. Please send that message again and I'll pick up right where we were."* One resend later, full personalized recovery, no re-digging. The §4.8 clamp did its job — no raw JSON, human apology, honest instruction.
**What he feels:** he had to say the hard thing twice.
**What to do:** nothing in the copy — the message is good. Check the engine Log tab for that turn's error class (`node tools/logs.js`). If scrambles correlate with provider safety-flinches on sensitive content rather than random parse flakes, sensitive-behavior students will hit this repeatedly, and that is a provider/spec decision worth making deliberately.
**Removes (if confirmed and fixed):** a forced re-confession at peak vulnerability.

### 5 🟡 Day 1 ends without paying the wizard's promise
**Where:** the 🎉 celebrate card after the after-Power-Hour scores.
**What happened:** step 2 told Tammy *"You'll look back at these numbers to see proof of change."* She logged 2/1/4 before and 5/4/6 after her hour — and the celebration says "Massive rewiring head start!" without ever showing her the +3 / +3 / +2. The first personal proof of the method exists in her data and is never surfaced. (The plan doc's own Phase 8 spec intended this delta on the day1_done card.)
**What she feels:** told it worked, not shown.
**Smallest fix:** one line on the celebrate card rendering baseline → after-hour (the data is already fetched). This is the one place this report proposes ADDING a sentence, because it removes a doubt the method itself created: "did that hour actually do anything?"

### 6 🟡 Three doors out of the rail before the student has taken one step in it
**Where:** "Open your full Freedom Tracker →" footer, visible from wizard step 1 onward; the after-scores card ("Compare these to your baseline any time in your full tracker"); the progress overflow lines ("…plus 4 earlier wins in your full tracker").
**What happened:** a brand-new student is offered a door to a "full" surface they have never seen, implying the page they are on is the partial one. On Day 0 the footer is the only other tappable thing on screen.
**Smallest fix:** gate the footer link to day ≥ 2 (or to progress existing), and point the after-scores sub-line at the in-page progress button instead.
**Removes:** one should-I-go-there decision at the most fragile moments (mid-wizard, mid-Power-Hour).

### 7 ⚪ One practice, four names, one card
**Where:** wizard step 3.
**What happened:** "daily rewiring moment" (title), "the Happiness & Success Jumpstart" (body), "the H&S Jumpstart" (label), "morning rewiring" (label again). Rosa cannot tell if these are one thing or three.
**Smallest fix:** one surface name ("your morning rewiring"), the proper noun once in parentheses, kill "H&S" entirely.
**Removes:** two aliases and one "wait, is that the same thing?".

### 8 ⚪ Catalog fossils inside the rail
**What happened:** Minimalist Plan's greeting still says *"Pro Tip: use the No-Brainer Willpower Eliminator before this tool"* — to a student whose page just walked them out of exactly that tool. The widget bar also says "Minimalist Freedom Plan" while the rail card says "Minimalist Plan". And via the no-questions fast-track, RBF's "😰 SAD Sadie" arrives with zero introduction, because the screens that introduce the prison-guard characters were skipped.
**Smallest fixes:** an Accelerator greeting variant for minplan dropping the pro-tip line (the `data-greeting-variant` machinery already exists for exactly this); align the tool display name; one spec line giving the fast-track path a half-line character intro.
**Removes:** one wrong instruction, one identity question, one "who is Sadie?".

### 9 ⚪ Small phrasing catches
- Two consecutive tool replies opening "Thank you for sharing that." (templated tell — a variation note in `style.md` covers it).
- The guided flow's template echoed itself: *"overwhelm connected to the feeling of overwhelm"* (the "stop feeling {PHRASE}" line fed back through the model).
- Progress: "Last ~7 days (Day 2):" reads cryptic — "since Day 2" says it.
- Harness drift: the mock's score questions are cleaner than the Gateway's baked ones ("How EASY is it to not do your UB?" vs "How easy / no-big-deal is it right now to NOT do your UB?"), which means walks proof different daily words than production serves. One mock-label sync restores the §4.5 rule.

### 10 ⚪ The honest-tick question (flag, not a fix)
"I finished this tool → Continue" is tappable before the tool was ever opened, so a rusher can tick through Day 1 without opening anything. The current design chose honesty over enforcement, which fits the method's no-force voice. If Dave ever wants it: showing the done-button only once the session has a real user turn uses state that already exists, and removes a lie-shaped choice rather than adding a gate. Noted both ways.

### What a long reply feels like (the overwhelm angle, answered directly)
NBWE's second reply to Tammy was 7,589 characters (about 1,300 words) in a single message — Path A and Path B as one essay. That sounds alarming, and on a 9pm phone it IS heavy. But three things keep it working: the widget scrolls long replies to their top so she reads from line one; the essay ends in a numbered 4-option menu, so a three-word student answers with one keystroke; and the content is the method itself, not filler — her own words were woven through it. **Call: the AI help is helpful, not overwhelming, at the structural level. The length of the authored essays is a voice decision that belongs to Dave, and this report deliberately proposes no mechanical shortening.** Where overwhelm actually leaks in is the small stuff above: re-asked questions, four-question messages, duplicate names, jargon tokens.

---

## Dave's direct question, answered directly

**"Could we get the same effect in less time or effort, or have we already reduced that enough?"**

The structure is already reduced enough. The wizard is four screens with about eight inputs. The daily loop is honestly three steps and the log really is 30 seconds. The doors doctrine, the one-tap handoff with the no-questions fast-track (verified live this session), log-then-tell with Undo, the instant guided flow, the minimize/resume seams, the progress view with the Freedom Proof headline, the milestone room — all of it passed a hostile walk with nothing structural to remove. There is no step in the daily loop that could disappear without losing the method.

The remaining fat is not architecture. It is **words** (the UB token, the four-named practice, the full-tracker doors, catalog fossils) and **tool-edge contracts** (what tools do with terse or private first messages). Both are copy-level sessions, not builds.

---

## PROPOSED plan (nothing here is started — this is for Dave to decide from)

Ranked by what each phase removes for the student per unit of Dave's time. No plan document exists; say the word and one gets written properly.

- **PROPOSED Phase A — the words pass** (one session, rail + Gateway copy only, zero tool changes): {UB} token in score questions · one name for the morning practice · footer gated to day ≥ 2 · after-scores line points at in-page progress · "since Day 2" · tool display-name alignment · harness score-question sync. *Removes: the highest-frequency daily decodes and the early escape doors.*
- **PROPOSED Phase B — tool-edge contracts** (one session, draft → harness → promote per house flow): NBWE terse-accept line · privacy preload tail for placeholder UBs (+ optional shared-rules privacy line) · fast-track character-intro line · terse spot checks on Feel Good Start + CJC. *Removes: the Day-1 re-ask and the privacy interrogation.*
- **PROPOSED Phase C — pay the proof** (half session): the baseline → after-hour delta line on the Day-1 celebrate card. *Removes: the "did it work?" doubt at the end of the biggest day.*
- **PROPOSED Phase D — live probes** (Dave-gated, needs his word on a designated test student): one real coach conversation as the rambler (does it untangle three topics and answer the embedded question?) · engine-log review of the scrambled-reply class for sensitive-content correlation · then the existing Phase 10 real-lesson walk, which stays exactly as planned.

**Deliberately not proposed:** shortening the bots' authored essays (voice, Dave's), enforcing tool completion (no-force is the method), any new feature.

## Open questions left for Dave

1. The scrambled reply on Derek's confession: parse flake or provider flinch? One `node tools/logs.js` look answers it. If flinch, is the answer provider routing or a spec line?
2. Does "my UB" privacy matter enough to also add the one shared-rules line (Phase B option), or is the rail-side preload sentence enough?
3. The honest-tick flag (finding 10): keep honesty-over-enforcement, or gate the done-button on a real turn?

---

*Method note: doctrine §1 (seams, not surfaces) was the hunting method and §3 (interaction rules) the scoring rubric. Working files: [stress_test_2026-08/](stress_test_2026-08/) — personas, per-persona transcripts, findings worksheet. Reopen phrase: "show me the freedom stress test findings".*
