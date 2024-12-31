# Architecture and boundaries
Penny is a personal finance workspace. React/Vite renders a same-origin client; Express exposes `/api`; MongoDB stores all account records. New code lives in `client/ui` and `server/src`. Original `client/src` and legacy controllers remain reference material and are excluded from active imports. Existing JWTs are deliberately not accepted by the new API.

Opaque sessions are hashed at rest. Each account owns its ledger, categories, budgets, recurring plans and audit events. Every query includes the authenticated owner. Dates are ISO days. Amounts are integer minor units in a single account currency. Changing currency requires an empty ledger to avoid silently relabeling money.

No bank connection, external AI, transaction execution or exchange-rate conversion is implied. Smart features are explainable calculations over recorded data. Recurring rules project future payments; they never silently create expenses. CSV imports validate the whole request and use a unique batch key to tolerate retries.

Production dependencies: durable MongoDB, indexes created before serving traffic, HTTPS origin, secrets managed by hosting, tested backups and release smoke. Use Node 24 and `npm ci`. Static validation is separate from live release evidence.

## Financial write and read boundaries
Creation retries and CSV batches are independent idempotency domains. Creation keys are unique per owner and bind an immutable payload fingerprint. Import keys persist normalized row snapshots and use unique owner/batch/row indexes to resume partial writes. Imports and account deletion are not cross-collection transactions; retry and partial-deletion behavior remain explicit API contracts.

The overview reads activity within the selected month instead of filtering a global recent-100 list. The ledger screen pages its own filtered query. Archived category definitions remain available to historical read models while active-category selection rejects archived records. Category name uniqueness is enforced by a named case-insensitive database index. Existing conflicting data must be resolved before installing that index; do not silently merge categories.

Connection pools are scoped by configured URI, and a failed connection can be retried without contaminating another pool. API health indicates process liveness; readiness reports database connectivity. Production release still requires an actual hosting origin, durable database, installed indexes, observed CI, backup restoration, realistic capacity checks, monitoring and support/privacy operations.
