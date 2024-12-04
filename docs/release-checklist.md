# Release gates
Local acceptance and hosted release are separate. This checklist records the current refactor, not an approval to publish.

## Local acceptance
- [x] OpenSpec proposal/design/specs and 150-boundary plan validate strictly.
- [x] Supported root dependency lock, source formatting, lint and production bundle build pass.
- [x] Real MongoDB integration verifies sessions, CSRF, ownership, concurrency, budgets, import retries and privacy.
- [x] Chromium covers demo and connected journeys, keyboard focus, automated WCAG A/AA overview/dialog checks, mobile navigation and overflow.
- [x] Built assets and Node runtime smoke pass. Demo makes no private API calls.
- [x] Disposable legacy fixture migration validates dry-run and idempotent apply.
- [x] Private fixture backup restores exact amounts into a disposable namespace.
- [x] Dependency audit reports no known vulnerabilities in the resolved dependency set.
- [x] OpenSpec, assistant instructions, secrets, logs and generated artifacts are ignored.

## Hosted production release
- [ ] Canonical Git remote and desired Vercel project supplied; push explicitly requested.
- [ ] Durable production MongoDB provisioned, credentials scoped, network access and region verified.
- [ ] APP_ORIGIN, RATE_SECRET and environment scopes configured for the actual hostname.
- [ ] Indexes applied to the actual production database.
- [ ] Vercel preview build, rewrites, secure cookies and actual-origin account journeys verified.
- [ ] Hosted CI execution observed for the release revision.
- [ ] Real migration/currency reconciliation completed if existing accounts are moving.
- [ ] Production backup retention, restore reconciliation and recovery objectives accepted.
- [ ] Load limits, monitoring, error alerts, spend limits and support/privacy contacts configured.
- [ ] Public release smoke and rollback confirmation recorded.

The implementation has a 10,000-active-record analytics/export bound. Account JSON export fails clearly above 100,000 records per collection. Cross-collection account deletion and import recovery are explicitly documented; they are not MongoDB transactions. Email verification/reset, MFA, bank sync and external AI are outside the delivered feature scope.

The optional CI recovery drill requires MongoDB Database Tools and MONGODB_TOOLS=1. Migration rehearsal runs without those tools. Automated accessibility checks cover selected screens and do not constitute a full accessibility certification.
