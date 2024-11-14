# Environment and configuration
Use Node 24, install from the root with `npm ci`, copy `.env.example` to `.env`, and generate a real RATE_SECRET. Never put secrets in a VITE_ variable. The browser only uses same-origin `/api` and needs no secret or public API URL.

Required backend variables: MONGODB_URI with a database name, RATE_SECRET with at least 32 random characters, APP_ORIGIN with an exact origin and no trailing slash. NODE_ENV must be production on Vercel. SESSION_DAYS defaults to 7 and allows 1–30. PORT is local only.

Use the actual preview origin for preview cookies and CSRF. A production domain does not authorize preview-origin writes. Use separate databases and secrets for preview and production. MongoDB must be in a nearby region, require TLS for hosted connections, and use least-privilege credentials. Configure Atlas networking for the hosting environment; do not guess entitlement or network access.

Local full stack: `npm run dev -- --database` starts a loopback-only MongoDB on port 27128, creates indexes, and launches both services. This requires mongod installed and cannot run in NODE_ENV=production. Without --database, configure your own MongoDB and run `npm run indexes -w server` once before starting. The default dev origin is localhost:5173; the managed local database mode uses 127.0.0.1:5173. Open the configured origin exactly.
