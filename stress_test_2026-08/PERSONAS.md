# Stress test 2026-08 — the six students

Working notes for the Freedom Accelerator stress test. Each persona is played
end to end in the harnesses (test_home.html scenarios, live DRAFT engine for
bot replies, Gateway fully mocked). No live student records anywhere.

Variety axes per Dave's framing: behavior, patience, verbosity, tech comfort,
time of day. At least one rambler mixing three topics, one three-word answerer.

| # | Name | Behavior | Style | Device / time | Coverage |
|---|------|----------|-------|---------------|----------|
| 1 | Tammy, 58 | menthol cigarettes | THE THREE-WORD ANSWERER. Skeptical of AI, low tech comfort, hates reading | iPhone, 9pm | FULL Day 1 (wizard → Power Hour all 4 tools → scores) |
| 2 | Marcus, 34 | late-night doomscrolling (+ weed + energy drinks in the same breath) | THE RAMBLER. Walls of text, three topics per message, 11:30pm energy | laptop, 11:30pm | Wizard + NBWE + minplan, daily loop with coach handoff |
| 3 | Jen, 41 | wine every evening | Anxious, apologetic, "is this normal?", worried about withdrawal | phone, 10pm | Wizard + F&A route + Withdrawal Helper + distress-adjacent phrasing |
| 4 | Derek, 27 | porn | Embarrassed. Uses the "my UB" privacy option. Skims, taps fast, reads nothing | phone, 1am | PRIVACY PATH: does "my UB" hold up through preloads, coach, tools? |
| 5 | Rosa, 63 | sugar after dinner | Chatty but off-topic (grandkids), misreads buttons, no hurry | desktop, 2pm | Wizard comprehension + Feel Good Start + daily loop + progress |
| 6 | Kev, 45 | sports betting app | Blunt skeptic. "how long does this take." Wants the deal up front | phone, 7am | Day-0 card, How-this-works explainer, time honesty, progress view |

## Walk plan

- Day 1 full: Tammy (1), plus Marcus (2) through tool 2.
- Daily loops (?s=day5 / ?s=day9): Marcus, Rosa, Kev. Coach replies are CANNED
  in the harness (Gateway mocked) — coach conversational quality is scored
  from the Gateway instructions + canned strings, and flagged as not
  live-tested. The coach→RBF handoff mechanics + the real RBF reply to a
  loaded prompt ARE live (draft engine).
- Mobile (375px) walks: Tammy, Derek, Jen. Desktop: Rosa, Marcus.
- Transcripts land in transcripts/ as they happen; findings in FINDINGS_RAW.md.

## What live means here

- Bot turns: REAL model replies via the draft channel (sessions in browser
  localStorage; engine logs are metadata-only per ai_tools/HANDOFF.md — no
  student content or identity server-side; verified before use).
- Gateway (state, saves, coach): MOCKED by test_home.html. Zero live writes.
- go.alwaysgreater.com: never visited (Dave may be running ads/splits).
