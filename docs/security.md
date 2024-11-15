# Security model
All owned queries include ownerId derived from the session. Input schemas reject unknown fields. Money is integral and bounded. Transaction versions prevent lost updates. Sessions contain 256-bit random bearer tokens and persist only their SHA-256 digest; CSRF tokens are separately derived from the bearer token. Cookies are HttpOnly, SameSite=Lax, Secure in production and expire server-side independently of MongoDB TTL cleanup.

Origin checks cover login, registration and every mutation. Authenticated mutations additionally check CSRF. No wildcard CORS or browser-stored bearer token is used. Authentication throttles use MongoDB counters keyed with HMAC so all function instances share limits. Failed login attempts include dummy password work. Password hashing uses async scrypt; legacy bcrypt hashes are supported for migration.

Do not trust arbitrary forwarded IP headers. Vercel proxy trust is enabled only with VERCEL set. Put a hosting firewall limit on unauthenticated traffic as well as database-backed login controls. Account creation and public readiness still incur database work. Set project spend limits and monitoring.

Logs include request ID, method, status and duration, excluding bodies, cookies, emails, query strings and secrets. Audit writes are best effort after successful responses; they are an operational activity view, not a guaranteed compliance ledger. Audit records expire after 90 days. CSV formulas are escaped. Exports are returned in memory without shared temporary files.

Known release boundaries: no email verification, password-reset email, bank integration, MFA or compliance certification. Do not promise those features. Run an independent security review before holding sensitive financial records at scale. Legacy controllers are preserved as reference and never deployed through the active handler. No live security or hosted availability claim follows from local tests.
