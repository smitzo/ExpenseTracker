# Refactor acceptance evidence

Date: 2026-10-29. Status: locally validated implementation; hosted release gates remain open.

## Observed checks
| Check | Observed result |
| --- | --- |
| `npm run check` | Formatting, ESLint, Node test command and Vite production build passed. |
| Full database-enabled Node suite inside `npm run test:browser` | 31 passed, 0 failed, 0 skipped against real local MongoDB. |
| `npm run test:browser` | 14 passed in 16.9 seconds, including the database suite, connected account flows, demo isolation, mobile, axe, production assets/runtime, migration and restoration. |
| `npm audit --audit-level=high` | Found 0 known vulnerabilities in the resolved dependency set, including development dependencies. |
| `openspec validate --all --strict --no-interactive` with telemetry disabled | 1 change passed, 0 failed. |
| Source audit through `git ls-files -z` piped to `node scripts/audit-source.js --stdin` | No tracked local plans, assistant instructions, secret env files or private keys. |
| `git diff --check` | Passed. |

The ordinary test command can skip database cases when TEST_MONGODB_URI is absent. The 31-test result above is the enabled suite run by the Chromium runner and explicitly checks zero skips. An initial direct sandboxed database attempt failed; the successful database run used the permitted test runner with loopback access. No in-memory database adapter substituted for MongoDB.

## What the tests establish
Account HTTP integration verifies ownership, expiring/revocable sessions, CSRF and origin rejection, login throttling, safe user serialization, strict input validation, precise amounts, version conflicts, currency locking, budget uniqueness, nonposting recurring projections, CSV preview isolation, retry-safe imports and privacy controls. Pure regressions cover money, leap days, year boundaries, month-end anchors, sparse forecasts and heuristic thresholds.

Connected Chromium checks register real disposable accounts through a same-origin Vite proxy, persist entries across reload, sign out, preview/import/export CSV, handle expired sessions, download account JSON and delete after password review. Demo tests prove browser-memory isolation. Axe WCAG A/AA checks cover the overview and transaction dialog; focus restoration and Escape are checked. Mobile navigation and page overflow are checked at 390 px. These checks do not certify every screen or assistive technology.

Production smoke renders built assets and verifies the Node static/API entrypoint. No third-party network requests or browser errors were observed in the built demo. Desktop and mobile screenshots are generated under ignored `.local/screenshots/`.

Migration rehearsal uses a disposable legacy fixture and proves dry-run isolation, stable idempotent apply, bcrypt preservation and exact minor-unit/owner mapping. Recovery uses the private backup utility and real mongorestore to a new disposable namespace, then reconciles the fixture amount and count. This does not validate a real production migration, backup retention or recovery objective.

## Delivery and remaining gates
The task has 163 local commits, including the original-source snapshot and meaningful implementation/verification fixes beyond the 150 planned boundaries. The original `.git` mount was empty and read-only; local history is stored in ignored `.git-local`. A portable Git bundle is generated under `.local/penny-history.bundle`. No canonical remote was inferred and no push or live deployment occurred.

OpenSpec and assistant instructions are ignored; tracked docs preserve the clone-safe architecture, roadmap, API contract, product guide and operational procedures. The supplied extra ignore entries for generated review artifacts were retained.

Hosted CI, Vercel preview/production, actual-hostname routing/cookies, production MongoDB/network/indexes, realistic load, real-data migration/reconciliation, production restore acceptance, alerting and privacy/support operations remain unchecked in [the release checklist](release-checklist.md). Do not describe local acceptance as a live production release.
