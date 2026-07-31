# API_MAP — freedom-tracker (the student-facing loader/coach front-ends)

Written by the fleet defect audit's tail sweep (PLAN_fleet_defect_audit Phase 4, 2026-07-31).
**Marker sweep only — NOT deep-audited.** Part of rank 4 on `mission_control/AUDIT_MAP.md`.

Markers live in `loader.v7.js` — the current loader. The older `loader.v1-v6`, `coach.v1-v3` and
`freedom-home.v1` copies carry the same two beliefs; they are frozen artifacts, deliberately not
edited by this sweep.

| # | Marker | Where | The belief | Probe that flips it to PROVEN/DENIED |
|---|--------|-------|-----------|--------------------------------------|
| 1 | `UNVERIFIED(systeme)` | `loader.v7.js` → `fetchSystemeIdentity` | `/api/user/user-data` and `/api/settings/profile` keep their shape | Log both raw responses once from a live student session and store the shapes here. These are Systeme.io's INTERNAL member-area endpoints — undocumented, unversioned, and the only thing binding a logged-in student to their tracker. |
| 2 | `UNVERIFIED(systeme)` | `loader.v7.js` → `identityMatches_` | when neither accountId nor email is comparable, it is the same student | Clear cookies mid-session so both endpoints 401, then log in as a second student on the same device and see what they are shown. The final `return true` makes absence of evidence mean "same person" — deliberate (never nuke a cache on ambiguity) but unverified in the case that matters. |
