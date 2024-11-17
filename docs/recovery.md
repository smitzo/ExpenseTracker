# Backup and restoration drill
Use an encrypted managed MongoDB backup policy with retention and access controls before launch. The local backup utility is an operator aid, not a hosted scheduler. It requires MongoDB Database Tools.

Create a private YAML file containing `uri: "mongodb..."` and chmod 600. Set MONGODB_CONFIG_PATH to its path and run `node scripts/backup.js`. The utility avoids placing the URI in process arguments and writes ignored, owner-readable archives under .local/backups. Encrypt and transfer backups to controlled storage; local archives are not disaster recovery.

Restore into a disposable database with mongorestore --config PRIVATE_CONFIG --archive=ARCHIVE --gzip --nsFrom='SOURCE.*' --nsTo='penny_restore_DATE.*'. Never add --drop or point this drill at a live namespace. Confirm indexes, user counts, monthly income/expense totals, category references and archive contents. Configure a local API against the restored database and exercise login, transaction listing and CSV export.

Record archive hash, source time, restore destination, record counts, total reconciliation, elapsed recovery time and operator. Define acceptable RPO/RTO before launch; neither is measured by a passing unit test. Keep the original source and backup until the cutover and restore reconciliation are accepted. Rotate compromised credentials and revoke sessions after an incident.
