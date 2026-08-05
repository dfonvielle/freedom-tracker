# Findings worksheet (scored against doctrine §3 rubric + Dave's angles)

Encounter-ordered. SEV: H/M/L/T(rivial). Each: what / rubric rule / smallest fix / what the fix removes.

| # | Where hit | Finding | SEV | Rubric | Smallest fix | Removes |
|---|-----------|---------|-----|--------|--------------|---------|
| 1 | Wizard s1→daily, forever | "UB" jargon in the most-repeated copy (score questions ×3, daily); system has their words, doesn't use them | M | §3.6 de-jargon | {UB} token in SCORE_QUESTIONS, substitute student words (fallback "your unwanted behavior") | 1 decode ×3 questions ×every day |
| 2 | Wizard s1 onward | "Open your full Freedom Tracker →" footer during wizard/D0/D1 + PH_SCORES_SUB + wins/exps overflow lines all point at an unexplained second surface | L-M | §2 one-page rail | Gate footer to day≥2; PH_SCORES_SUB → point at in-page progress | 1 escape-door decision at the most fragile moment |
| 3 | Wizard s3 | 4 names for one practice (daily rewiring moment / H&S Jumpstart / Happiness & Success Jumpstart / morning rewiring) | L | §3.6 | One surface name ("morning rewiring"), proper noun once | 2 concept-aliases |
| 4 | D1 tool 1 first reply | NBWE re-asks the behavior after the preload when UB is terse ("menthols"); 2 questions in 1 msg; vision question dropped | H | §3.1 handoff lands on fresh ground; §4.7 promise | 1 spec line in bh_nbwe S1: accept terse behavior, ask only the vision question | 1 model round trip + 1 re-typed answer for every terse student, on the product's first AI touch |
| 5 | D1 tool 1 (private student) | "my UB" wizard promise has no tool contract → challenge + 4-question categorization interrogation | H | §3.4 one question; wizard's own promise | Rail: placeholder-shaped UB ⇒ preload adds "don't ask what it is" line; opt. 1 shared-rules privacy line | 2+ shame-flavored turns for the embarrassed segment |
| 6 | D1 tool 1, sensitive msg | "came out scrambled — send again" armor fired on the vulnerable confession; recovered fully on resend | M | §4.8 (worked!) | Read engine Log rows for error class; if refusal-shaped, provider/spec fallback for sensitive content | 1 resend at the worst possible moment |
| 7 | D1 tool 1 | 7,589-char single reply (Path A/B essay); ends in numbered menu (good) | L-M | word-count angle | None mechanical — content-length is Dave's authored voice; flag only | — (honest already-lean caveat) |
| 8 | PH rail every step | "I finished this tool → Continue" tappable before tool ever opened | L | §3.8 time-honesty | Show done-button only when session has ≥1 user turn (state exists) | A lie-shaped choice pre-open |
| 9 | D1 end | Celebrate card never shows baseline→after-PH delta (2/1/4→5/4/6 unshown); wizard promised "you'll look back at these numbers" | M | §3.7 progress=numbers+wins | Render the delta line on day1_done from existing scores action | A doubt ("did the hour do anything?") — the one justified ADD |
| 10 | D1 tool 2 greeting | "Pro Tip: use the NBWE before this tool" — catalog navigation tip inside the rail that just did that | L | §3.6 per-surface dejargon (rule 16 class) | Accelerator greeting-variant dropping the line (machinery exists) | 1 confusing instruction |
| 11 | D1 tool 2 | "Minimalist Plan" (rail) vs "Minimalist Freedom Plan" (widget bar) | T | — | Align TOOLS name w/ bot name | 1 identity question |
| 12 | Daily handoff reply | "😰 SAD Sadie" unintroduced (fast-track skips the intro screens) | L-M | §3.1 cost | Spec line: on no-questions entry, half-line character intro | 1 "who?" moment |
| 13 | Guided-flow reply | Template echo: "overwhelm connected to the feeling of overwhelm" | L | weird-phrasing angle | stopPhrase wording + spec nudge | occasional broken sentence |
| 14 | Tool replies | Consecutive "Thank you for sharing that." openers | T | templated-phrasing angle | style.md variation note | repetition tell |
| 15 | Progress view | "Last ~7 days (Day 2):" cryptic | T | — | "since Day 2" | 1 squint |
| 16 | Harness itself | Mock SCORE_QUESTIONS drifted from Gateway baked copy (harness shows cleaner questions than production serves) | L | §4.5 mocks mirror reality | Sync mock labels to Gateway copy | walk-blindness to the real daily words |

## Already lean enough (Dave's direct question — the YES list)
Wizard (4 screens, ~8 inputs, chips, tappable recap) · Day-0 card · PH stepped
rail + minimize/resume seams · doors doctrine (idle/guided/convo/ready) ·
log-then-tell + Undo · guided flow instant open · ready card + no-questions
fast-track (VERIFIED LIVE) · daily log honestly 30s · day-9 progress view
(best screen in the product) · milestone card + decision room · explainer ·
welcome email. Structure has no removable step left in the daily loop; the
remaining fat is WORDS (jargon tokens, duplicate names) and TOOL-EDGE
contracts (terse/private first messages), not architecture.

## Not tested (fences + mock boundaries)
Live coach replies (chat/recommend/build — Gateway mocked; live = real student
state, fenced) · FGS/CJC live preloads · real Systeme lesson embed (Phase 10,
Dave's walk) · UI Copy tab overrides · email→activation live flow ·
multi-project rooms (code+State-Map only) · distress gate (code-verified only).
