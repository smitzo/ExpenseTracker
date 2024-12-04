# Expense Tracker delivery roadmap

Scope: full refactor into an accessible personal finance workspace with a MongoDB-backed Express API and React/Vite client. Minimum 150 meaningful commits, organized as 15 phases of 10 reviewable boundaries. No push is authorized. Deployment needs an actual Vercel project and durable MongoDB credentials. Local validation does not prove hosted operation.

OpenSpec is local and ignored at the user’s request. This tracked document is the clone-safe plan. Original source is preserved; only the new entrypoints are deployed. The original `.git` mount is empty and read-only; local history uses `.git-local` via `git --git-dir=.git-local --work-tree=.`.

Delivery checkpoint: all 150 planned local boundaries are implemented and verified by the checks in [verification.md](verification.md). The full history has 163 commits, including follow-up defect fixes and recovery checks. Hosted release gates remain open in [release-checklist.md](release-checklist.md). CI acceptance means the workflow is prepared and local checks pass; a hosted CI run has not been observed.

## Phase 1: Foundation

- [x] 001 Source snapshot.
- [x] 002 architecture.
- [x] 003 workspace scripts.
- [x] 004 frontend build.
- [x] 005 backend runtime.
- [x] 006 lint.
- [x] 007 formatting.
- [x] 008 environment.
- [x] 009 browser harness.
- [x] 010 CI.

## Phase 2: Domain

- [x] 011 Errors.
- [x] 012 money.
- [x] 013 dates.
- [x] 014 identifiers.
- [x] 015 pagination.
- [x] 016 transaction validation.
- [x] 017 categories.
- [x] 018 budgets.
- [x] 019 recurring rules.
- [x] 020 preferences.

## Phase 3: Persistence

- [x] 021 Database cache.
- [x] 022 users.
- [x] 023 sessions.
- [x] 024 ledger.
- [x] 025 categories.
- [x] 026 budgets.
- [x] 027 recurring records.
- [x] 028 idempotency.
- [x] 029 rate limits.
- [x] 030 indexes.

## Phase 4: Security

- [x] 031 Password hashing.
- [x] 032 session tokens.
- [x] 033 cookies.
- [x] 034 authentication.
- [x] 035 CSRF.
- [x] 036 login throttling.
- [x] 037 origin policy.
- [x] 038 headers.
- [x] 039 request logging.
- [x] 040 safe errors.

## Phase 5: Accounts

- [x] 041 Registration.
- [x] 042 login.
- [x] 043 logout.
- [x] 044 profile.
- [x] 045 preferences.
- [x] 046 password change.
- [x] 047 session listing.
- [x] 048 session revocation.
- [x] 049 category list.
- [x] 050 category writes.

## Phase 6: Ledger

- [x] 051 List filters.
- [x] 052 create.
- [x] 053 update.
- [x] 054 archive.
- [x] 055 CSV export.
- [x] 056 import parser.
- [x] 057 import preview.
- [x] 058 import commit.
- [x] 059 duplicate detection.
- [x] 060 notes and search.

## Phase 7: Planning

- [x] 061 Budget endpoints.
- [x] 062 budget progress.
- [x] 063 recurring endpoints.
- [x] 064 recurring projection.
- [x] 065 monthly summary.
- [x] 066 daily series.
- [x] 067 category totals.
- [x] 068 month comparison.
- [x] 069 cashflow forecast.
- [x] 070 savings rate.

## Phase 8: Insights

- [x] 071 Merchant classification.
- [x] 072 suggested category.
- [x] 073 unusual spending.
- [x] 074 pace alerts.
- [x] 075 recurring detection.
- [x] 076 savings suggestions.
- [x] 077 financial digest.
- [x] 078 audit trail.
- [x] 079 health.
- [x] 080 readiness.

## Phase 9: Application

- [x] 081 API assembly.
- [x] 082 local runtime.
- [x] 083 Vercel function.
- [x] 084 fixtures.
- [x] 085 API client.
- [x] 086 session provider.
- [x] 087 formatting.
- [x] 088 navigation.
- [x] 089 feedback.
- [x] 090 modal.

## Phase 10: Overview UI

- [x] 091 Design tokens.
- [x] 092 layout.
- [x] 093 overview.
- [x] 094 summary cards.
- [x] 095 trend chart.
- [x] 096 category breakdown.
- [x] 097 activity table.
- [x] 098 quick add.
- [x] 099 transaction editor.
- [x] 100 activity actions.

## Phase 11: Workspace UI

- [x] 101 Ledger screen.
- [x] 102 search and filters.
- [x] 103 budgets screen.
- [x] 104 budget editor.
- [x] 105 recurring screen.
- [x] 106 recurring editor.
- [x] 107 insights screen.
- [x] 108 categories screen.
- [x] 109 settings screen.
- [x] 110 authentication screen.

## Phase 12: Smart UX

- [x] 111 Import screen.
- [x] 112 CSV download.
- [x] 113 demo experience.
- [x] 114 empty states.
- [x] 115 error recovery.
- [x] 116 responsive navigation.
- [x] 117 keyboard shortcuts.
- [x] 118 accessibility.
- [x] 119 help content.
- [x] 120 loading states.

## Phase 13: Verification

- [x] 121 Money regressions.
- [x] 122 calendar regressions.
- [x] 123 insight regressions.
- [x] 124 validation regressions.
- [x] 125 authentication integration.
- [x] 126 ownership integration.
- [x] 127 ledger integration.
- [x] 128 budget integration.
- [x] 129 import integration.
- [x] 130 browser journeys.

## Phase 14: Operations

- [x] 131 Vercel configuration.
- [x] 132 environment guide.
- [x] 133 API contract.
- [x] 134 security model.
- [x] 135 migration utility.
- [x] 136 migration guide.
- [x] 137 backup utility.
- [x] 138 restore drill.
- [x] 139 deployment runbook.
- [x] 140 privacy controls.

## Phase 15: Release

- [x] 141 CI acceptance.
- [x] 142 dependency audit.
- [x] 143 production smoke.
- [x] 144 accessibility browser checks.
- [x] 145 mobile browser checks.
- [x] 146 import browser checks.
- [x] 147 demo isolation checks.
- [x] 148 release checklist.
- [x] 149 project README.
- [x] 150 final evidence.
