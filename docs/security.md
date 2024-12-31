# Security model
All owned queries include ownerId derived from the session. Input schemas reject unknown fields. Money is integral and bounded. Transaction versions prevent lost updates. Sessions contain 256-bit random bearer tokens and persist only their SHA-256 digest; CSRF tokens are separately derived from the bearer token. Cookies are HttpOnly, SameSite=Lax, Secure in production and expire server-side independently of MongoDB TTL cleanup.

Origin checks cover login, registration and every mutation. Authenticated mutations additionally check CSRF. No wildcard CORS or browser-stored bearer token is used. Authentication throttles use MongoDB counters keyed with HMAC so all function instances share limits. Failed login attempts include dummy password work. Password hashing uses async scrypt; legacy bcrypt hashes are supported for migration.

Do not trust arbitrary forwarded IP headers. Vercel proxy trust is enabled only with VERCEL set. Put a hosting firewall limit on unauthenticated traffic as well as database-backed login controls. Account creation and public readiness still incur database work. Set project spend limits and monitoring.

Logs include request ID, method, status and duration, excluding bodies, cookies, emails, query strings and secrets. Audit writes are best effort after successful responses; they are an operational activity view, not a guaranteed compliance ledger. Audit records expire after 90 days. CSV formulas are escaped. Exports are returned in memory without shared temporary files.

Known release boundaries: no email verification, password-reset email, bank integration, MFA or compliance certification. Do not promise those features. Run an independent security review before holding sensitive financial records at scale. Legacy controllers are preserved as reference and never deployed through the active handler. No live security or hosted availability claim follows from local tests.

Credential changes use compare-and-set on the stored password hash and atomically increment a credential revision. Authentication compares the session revision with the current user revision. This rejects delayed sessions saved after password-session cleanup, and prevents concurrent password changes from silently overwriting each other. Existing users and sessions without a revision are treated as revision zero.

Production configuration refuses bundled development/placeholder secrets and requires a named MongoDB database. Connection caching uses the complete configured URI as its key; pools are never silently reused for a different configured database. Never expose the cache keys in logs.
