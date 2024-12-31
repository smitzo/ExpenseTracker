# Penny
A considered home for everyday spending. Penny turns a basic expense tracker into a responsive personal finance workspace with a React/Vite client and a modular Express/MongoDB API.

## What you can do
- Record income and expenses with precise amounts, categories, notes, search, pagination, edit conflict checks and archiving.
- Set monthly category budgets, review spending progress and plan recurring payments.
- Explore explainable category suggestions, unusual-spending checks, recurring-payment candidates, pace alerts and savings scenarios.
- Preview and import CSV batches, download formula-safe CSV, export account records and delete an account after password confirmation.
- Use expiring secure cookie sessions, revoke sessions, change passwords and manage preferences.
- Explore a clearly labeled interactive demo using browser-only sample records.

## Run locally
Use Node 24 and install from the repository root:

```sh
npm ci
npm run dev -- --database
```

The managed local mode requires `mongod` installed. Open `http://127.0.0.1:5173` for an account or `http://127.0.0.1:5173/?demo=1` for sample data. It uses a local MongoDB on port 27128 and creates indexes. Never use its development secret for hosting.

For an existing MongoDB deployment, copy `.env.example` to `.env`, configure all values, run `npm run indexes -w server`, then `npm run dev`. Open the exact APP_ORIGIN. The browser always calls same-origin `/api`; it never needs database credentials. See [environment configuration](docs/environment.md).

## Verify

```sh
npm run check
TEST_MONGODB_URI=mongodb://127.0.0.1:27128/penny_test npm test
npm run test:browser
npm audit --audit-level=high
```

`npm run check` checks formatting, lint, Node tests and the Vite production build. Set TEST_MONGODB_URI to enable database tests; test databases use random penny_test_ names and are removed afterward. The Chromium suite expects the local MongoDB above or TEST_MONGODB_URI, and uses Google Chrome at `/usr/bin/google-chrome`; set CHROME_PATH for another installation. Browser tests create disposable accounts and databases, exercise real API flows and include the full database-enabled Node suite. Recovery drills additionally need mongodump/mongorestore. CI provides a MongoDB service; its optional recovery drill requires Database Tools and MONGODB_TOOLS=1.

## Production and Vercel
`npm run build` writes `client/dist`. `npm start` serves the built client and API locally. Vercel uses the root [configuration](vercel.json), static client and import-safe `api/index.js` handler, backed by external durable MongoDB. Set NODE_ENV=production, MONGODB_URI, RATE_SECRET and an exact HTTPS APP_ORIGIN in the hosting environment. Run `npm run indexes -w server` against the intended database before traffic. Validate a preview on its actual hostname, including `/api/health`, `/api/ready`, cookies, account isolation and import/export. Keep preview and production databases separate. Hosting, production data migration, production restore acceptance and hosted smoke remain pending until configured and verified.

## Code map
- `client/ui`: active React screens, components and workspace state.
- `server/src`: domain validation, persistence, security, accounts, ledger, planning and insights.
- `api`: Vercel adapter; importing it opens no listener or database connection.
- `tests`: exact money/calendar checks, MongoDB HTTP integration and Chromium acceptance.
- `scripts`: development, source audit, migration and private backups.
- `docs`: [architecture](docs/architecture.md), [API](docs/api.md), [security](docs/security.md), [privacy](docs/privacy.md), [migration](docs/migration.md), [recovery](docs/recovery.md), [product guide](docs/product-guide.md).

The original CRA client and legacy server files remain reference material outside active imports. Their nested lockfiles describe the old dependency trees; use the root lockfile and root commands. OpenSpec and assistant instructions stay local and ignored as requested. Tracked docs are the fresh-clone source of truth.

## Git and local planning
The workspace uses a `.git` pointer to the existing ignored `.git-local` history; normal Git commands work without rewriting commits. Fresh clones use ordinary Git metadata. OpenSpec plans, task notes, review screenshots and hosting handoff reports remain ignored. Essential setup and hosting commands live here, while reusable engineering material remains in `docs/`.

## Operational limits
Analytics and CSV export currently cap active ledger history at 10,000 entries. Account JSON export fails above 100,000 records per collection. Recurring plans and active category views are bounded. Category index upgrades fail on ambiguous existing names; reconcile them in an isolated copy before release. There is no email verification/reset, MFA, bank sync or external AI dependency.

A production release requires observed CI, a preview verified on its actual APP_ORIGIN, durable MongoDB with the required indexes, a tested restore and rollback, realistic capacity checks, monitoring/spend limits and published support/privacy operations. These are environment gates and cannot be established by local fixtures. See [security](docs/security.md), [migration](docs/migration.md) and [recovery](docs/recovery.md) for reusable engineering guidance.
