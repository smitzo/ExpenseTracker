# API contract
All routes begin `/api`. Public GET `/health` is liveness and GET `/ready` checks MongoDB. Errors use `{error:{code,message,details?,requestId?}}`. API responses are private and no-store. Request bodies are JSON and limited to 300 KB.

POST `/auth/register` accepts name, email, password (12–128 characters). POST `/auth/login` accepts email and password. They return a sanitized user and csrf token and set an expiring HttpOnly cookie. GET `/auth/session` restores the same contract. POST `/auth/logout` revokes the session. Every mutation requires the configured Origin. Authenticated mutations also require X-CSRF-Token. Production uses a Secure __Host-penny cookie.

GET/PATCH `/profile`; PUT `/preferences`; PUT `/password`; GET `/sessions`; DELETE `/sessions/:id`. Password changes require currentPassword and password and revoke every session. Currency cannot be changed after financial records exist.

GET/POST `/categories`, PATCH/DELETE `/categories/:id`. GET/POST `/transactions`, PATCH/DELETE `/transactions/:id`. Transactions have amount (positive integer minor units), description, date (ISO day), kind (income/expense), categoryId (owned UUID or null), note. Updates require version; stale writes return 409. DELETE archives. List filters: q, kind, categoryId, from, to, page, limit (maximum 100). Query matching escapes regular expressions.

GET `/transactions/export` downloads formula-safe CSV. GET `/transactions/duplicates` returns exact candidate groups. POST `/imports/preview` accepts csv. POST `/imports/commit` accepts csv and a UUID key. Maximum 500 rows and 250 KB; every row validates before writing. Unique import row indexes make retries safe; partial infrastructure failures may require retrying the same batch key before reporting completion.

GET `/budgets?month=YYYY-MM`, PUT `/budgets` with categoryId,month,amount, DELETE `/budgets/:id`. GET/POST `/recurring`, PUT/DELETE `/recurring/:id`. Recurring fields: name,amount,frequency,nextDate,categoryId,active. GET `/digest?month=YYYY-MM` returns recorded summaries, series, category totals, comparison, forecast, budget progress, savings, plans and insights. GET `/suggestion?description=...` suggests a category. GET `/audit` returns the last 50 mutation events.

Analytics/export currently cap active history at 10,000 records and return a clear limit error beyond that. Design a server-side aggregation/archive policy before exceeding this bound. Category and recurring-plan limits are 100 each. Account export includes archived records.

## Retry and history semantics
POST /transactions accepts an optional UUID `Idempotency-Key` header. The key is scoped to the authenticated owner. The first write returns 201; replay returns 200 and `Idempotency-Replayed: true`. A different normalized payload with the same key returns 409. Replaying an archived transaction does not unarchive it. Clients retain keys after ambiguous failures and replace them after a confirmed success or a changed intent. Install the unique creation-key index before traffic.

An accepted import stores its validated rows with its owner-scoped key and payload fingerprint. Incomplete batches resume that snapshot after category changes; completed batches replay their recorded count without validating category names again. Old incomplete batches created before snapshot support still require their source categories to validate. The browser keeps only the CSV fingerprint and pending key in session storage, not the CSV text. Restricted storage falls back to memory for navigation within the current page lifetime. Acknowledged success clears the pending key; re-uploading after acknowledged success creates a new batch.

Category names are unique per owner under case-insensitive English collation, matching the common case-insensitive CSV naming rule. Historical transactions, summaries and CSV preserve the label of archived categories. Date filters reject an end date earlier than the start date.

GET /health does not need database access. Transient database connection failures return 503 with a short Retry-After and omit connection details. Rate-limit Retry-After values use the applicable bucket reset time rather than a fixed interval.
