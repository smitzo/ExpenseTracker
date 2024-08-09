# Architecture and boundaries
Penny is a personal finance workspace. React/Vite renders a same-origin client; Express exposes `/api`; MongoDB stores all account records. New code lives in `client/ui` and `server/src`. Original `client/src` and legacy controllers remain reference material and are excluded from active imports. Existing JWTs are deliberately not accepted by the new API.

Opaque sessions are hashed at rest. Each account owns its ledger, categories, budgets, recurring plans and audit events. Every query includes the authenticated owner. Dates are ISO days. Amounts are integer minor units in a single account currency. Changing currency requires an empty ledger to avoid silently relabeling money.

No bank connection, external AI, transaction execution or exchange-rate conversion is implied. Smart features are explainable calculations over recorded data. Recurring rules project future payments; they never silently create expenses. CSV imports validate the whole request and use a unique batch key to tolerate retries.

Production dependencies: durable MongoDB, indexes created before serving traffic, HTTPS origin, secrets managed by hosting, tested backups and release smoke. Use Node 24 and `npm ci`. Static validation is separate from live release evidence.
