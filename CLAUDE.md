# freedom-tracker — session contract

> ⚠️ **This repo is PUBLIC on GitHub** — anything written here is world-readable.

Belongs here: standing rules, repo gotchas, conventions.
Belongs elsewhere: current state → `DASHBOARD.md` · next steps → `PLAN_*.md`.

## Standing rules

1. **This repo MUST stay public** — live Systeme lessons load `loader.v7.js` (and
   the coach files) from `dfonvielle.github.io/freedom-tracker/`, and GitHub Pages
   on this account only builds from public repos. Making it private takes the
   tracker down for every student.
2. **Never commit a live engine URL or `at_…` key here.** Test harnesses ship
   their `#freedom-home` stub EMPTY (`data-engine=""` / `data-key=""`) — hand-fill
   locally for a live draft-bot mount, and don't commit the fill. A key committed
   here is world-readable the moment it lands (2026-07-18 → 2026-08-17 it happened;
   the key had to be rotated). Do not add comments naming where the live values
   live — a signpost to a credential in a public file is the same leak one step out.
3. The `APP_KEY: '2br02b_…'` inside the loader/coach files is **public by design**
   (it ships to every student's browser; the Gateway treats it as a speed bump and
   trusts only per-user tokens server-side). Its presence here is not a leak — do
   not "fix" it.
