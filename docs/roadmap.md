# Expense Tracker delivery roadmap

Scope: full refactor into an accessible personal finance workspace with a MongoDB-backed Express API and React/Vite client. Minimum 150 meaningful commits, organized as 15 phases of 10 reviewable boundaries. No push is authorized. Deployment needs an actual Vercel project and durable MongoDB credentials. Local validation does not prove hosted operation.

OpenSpec is local and ignored at the user’s request. This tracked document is the clone-safe plan. Original source is preserved; only the new entrypoints are deployed. The original `.git` mount is empty and read-only; local history uses `.git-local` via `git --git-dir=.git-local --work-tree=.`.

## Phase 1: Foundation

- [ ] 001 Source snapshot.
- [ ] 002 architecture.
- [ ] 003 workspace scripts.
- [ ] 004 frontend build.
- [ ] 005 backend runtime.
- [ ] 006 lint.
- [ ] 007 formatting.
- [ ] 008 environment.
- [ ] 009 browser harness.
- [ ] 010 CI.

## Phase 2: Domain

- [ ] 011 Errors.
- [ ] 012 money.
- [ ] 013 dates.
- [ ] 014 identifiers.
- [ ] 015 pagination.
- [ ] 016 transaction validation.
- [ ] 017 categories.
- [ ] 018 budgets.
- [ ] 019 recurring rules.
- [ ] 020 preferences.

## Phase 3: Persistence

- [ ] 021 Database cache.
- [ ] 022 users.
- [ ] 023 sessions.
- [ ] 024 ledger.
- [ ] 025 categories.
- [ ] 026 budgets.
- [ ] 027 recurring records.
- [ ] 028 idempotency.
- [ ] 029 rate limits.
- [ ] 030 indexes.

## Phase 4: Security

- [ ] 031 Password hashing.
- [ ] 032 session tokens.
- [ ] 033 cookies.
- [ ] 034 authentication.
- [ ] 035 CSRF.
- [ ] 036 login throttling.
- [ ] 037 origin policy.
- [ ] 038 headers.
- [ ] 039 request logging.
- [ ] 040 safe errors.

## Phase 5: Accounts

- [ ] 041 Registration.
- [ ] 042 login.
- [ ] 043 logout.
- [ ] 044 profile.
- [ ] 045 preferences.
- [ ] 046 password change.
- [ ] 047 session listing.
- [ ] 048 session revocation.
- [ ] 049 category list.
- [ ] 050 category writes.

## Phase 6: Ledger

- [ ] 051 List filters.
- [ ] 052 create.
- [ ] 053 update.
- [ ] 054 archive.
- [ ] 055 CSV export.
- [ ] 056 import parser.
- [ ] 057 import preview.
- [ ] 058 import commit.
- [ ] 059 duplicate detection.
- [ ] 060 notes and search.

## Phase 7: Planning

- [ ] 061 Budget endpoints.
- [ ] 062 budget progress.
- [ ] 063 recurring endpoints.
- [ ] 064 recurring projection.
- [ ] 065 monthly summary.
- [ ] 066 daily series.
- [ ] 067 category totals.
- [ ] 068 month comparison.
- [ ] 069 cashflow forecast.
- [ ] 070 savings rate.

## Phase 8: Insights

- [ ] 071 Merchant classification.
- [ ] 072 suggested category.
- [ ] 073 unusual spending.
- [ ] 074 pace alerts.
- [ ] 075 recurring detection.
- [ ] 076 savings suggestions.
- [ ] 077 financial digest.
- [ ] 078 audit trail.
- [ ] 079 health.
- [ ] 080 readiness.

## Phase 9: Application

- [ ] 081 API assembly.
- [ ] 082 local runtime.
- [ ] 083 Vercel function.
- [ ] 084 fixtures.
- [ ] 085 API client.
- [ ] 086 session provider.
- [ ] 087 formatting.
- [ ] 088 navigation.
- [ ] 089 feedback.
- [ ] 090 modal.

## Phase 10: Overview UI

- [ ] 091 Design tokens.
- [ ] 092 layout.
- [ ] 093 overview.
- [ ] 094 summary cards.
- [ ] 095 trend chart.
- [ ] 096 category breakdown.
- [ ] 097 activity table.
- [ ] 098 quick add.
- [ ] 099 transaction editor.
- [ ] 100 activity actions.

## Phase 11: Workspace UI

- [ ] 101 Ledger screen.
- [ ] 102 search and filters.
- [ ] 103 budgets screen.
- [ ] 104 budget editor.
- [ ] 105 recurring screen.
- [ ] 106 recurring editor.
- [ ] 107 insights screen.
- [ ] 108 categories screen.
- [ ] 109 settings screen.
- [ ] 110 authentication screen.

## Phase 12: Smart UX

- [ ] 111 Import screen.
- [ ] 112 CSV download.
- [ ] 113 demo experience.
- [ ] 114 empty states.
- [ ] 115 error recovery.
- [ ] 116 responsive navigation.
- [ ] 117 keyboard shortcuts.
- [ ] 118 accessibility.
- [ ] 119 help content.
- [ ] 120 loading states.

## Phase 13: Verification

- [ ] 121 Money regressions.
- [ ] 122 calendar regressions.
- [ ] 123 insight regressions.
- [ ] 124 validation regressions.
- [ ] 125 authentication integration.
- [ ] 126 ownership integration.
- [ ] 127 ledger integration.
- [ ] 128 budget integration.
- [ ] 129 import integration.
- [ ] 130 browser journeys.

## Phase 14: Operations

- [ ] 131 Vercel configuration.
- [ ] 132 environment guide.
- [ ] 133 API contract.
- [ ] 134 security model.
- [ ] 135 migration utility.
- [ ] 136 migration guide.
- [ ] 137 backup utility.
- [ ] 138 restore drill.
- [ ] 139 deployment runbook.
- [ ] 140 privacy controls.

## Phase 15: Release

- [ ] 141 CI acceptance.
- [ ] 142 dependency audit.
- [ ] 143 production smoke.
- [ ] 144 accessibility browser checks.
- [ ] 145 mobile browser checks.
- [ ] 146 import browser checks.
- [ ] 147 demo isolation checks.
- [ ] 148 release checklist.
- [ ] 149 project README.
- [ ] 150 final evidence.
