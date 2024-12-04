# Vercel release runbook
Import the repository into a Vercel project with the repository root as Root Directory. vercel.json runs npm ci, builds the Vite client into client/dist, and bundles api/index.js with server/src. Node 24 is pinned in package.json. No persistent local files, background jobs or timers are required for application data.

Configure production and preview environments separately using docs/environment.md. Use an external durable MongoDB deployment near the function region. Run the index setup command against the intended database before traffic. Verify network access and connection limits against your Atlas/Vercel plans. Index creation is explicit and not performed on every invocation.

Before production: npm run check; a MongoDB-enabled integration run; npm run test:browser; npm audit --omit=dev --audit-level=high; OpenSpec strict validation; migration rehearsal if applicable; backup restoration drill. Inspect a preview build with the actual hostname set as APP_ORIGIN. Check /api/health and /api/ready, register two disposable accounts, verify cookie attributes and cross-account isolation, then test entry/edit/archive, budgets, import and export from that hostname.

The deployable configuration is prepared locally. This workspace has no configured canonical remote or Vercel project. No push or live publication has been performed. Publishing requires the repository destination, Vercel access and database environment; supply those only through secure hosting settings. Git pushes are done only on explicit request.

Rollback by selecting the previous verified Vercel deployment. Do not automatically roll back database changes. Reconcile any v2 writes before considering legacy handlers. Confirm health and account origin again after rollback. Monitor 5xx, authentication failures, MongoDB pool usage, latency and unexpected spend. Set error-rate and availability alerts in hosting.

Implementation references: [Vercel Vite deployment](https://vercel.com/docs/frameworks/frontend/vite), [Vercel Express support](https://vercel.com/docs/frameworks/backend/express), and [Mongoose serverless connection guidance](https://mongoosejs.com/docs/lambda.html). These describe platform behavior; they are not evidence that this project has been deployed.
