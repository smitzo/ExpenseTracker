# Legacy migration
The refactor preserves legacy source and isolates new collections under `v2_`. Existing JWTs are not valid sessions. Back up the complete source database before migration. Test restoration to an isolated database first.

Run `node --env-file=.env scripts/migrate-legacy.js` to dry-run. It validates every planned record before any write and prints counts without private values. It assumes old positive amounts are expenses; the old schema had no currency metadata. Review source currency before setting LEGACY_CURRENCY=INR and adding --apply. Other currencies need a reviewed migration adjustment; never relabel silently.

The utility checks normalized duplicate emails, password hash format, calendar validity, positive two-decimal amounts and orphan ownership. It rejects ambiguous source data. Category ID mismatches become uncategorized transactions. Duplicate category names can conflict with the new unique index; resolve them in a copy before apply. No live migration was performed by this refactor.

Stable IDs and set-on-insert make retries nonoverwriting. A bulk-write interruption may leave partial target records; keep traffic disabled, resolve the cause, rerun and compare counts. Never run migration against an already active account with overlapping normalized email. Dry-run again, reconcile source totals by account/month and test login, edit and export in an isolated copy before cutover.

Legacy bcrypt credentials can sign in even if shorter than the new registration minimum. Ask those users to choose a new password. The server never returns password hashes. Reverting the API handler requires handling new v2 data separately; do not point old handlers at v2 collections.

Category preflight applies the active category schema and rejects case-ambiguous names before any target records are written. Index setup includes the named case-insensitive category-name index and transaction creation-key index. Run setup on the target database before enabling the new handler.
