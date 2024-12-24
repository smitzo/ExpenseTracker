import { payloadHash } from '../db/idempotency.js';
import { ensure } from '../domain/errors.js';
import { ledger } from '../db/ledger.js';
import { transactionSchema } from '../domain/ledger.js';
import { idSchema, publicRecord } from '../domain/identifiers.js';
import { checkCategory } from '../accounts/writeCategories.js';
export async function createTransaction(req, res) {
  const body = transactionSchema.parse(req.body);
  const key = req.get('Idempotency-Key');
  if (key) {
    idSchema.parse(key);
    const store = ledger(req.db),
      fingerprint = payloadHash(body);
    const previous = await store.byCreationKey(req.user._id, key);
    if (!previous) await checkCategory(req, body.categoryId);
    const result = previous
      ? { doc: previous, replay: true }
      : await store.createOnce(req.user._id, key, fingerprint, body);
    ensure(
      result.doc.creationFingerprint === fingerprint,
      409,
      'KEY_REUSED',
      'Use a new creation key for different transaction data.',
    );
    res.set('Idempotency-Replayed', String(result.replay));
    return res.status(result.replay ? 200 : 201).json({ data: publicRecord(result.doc) });
  }
  await checkCategory(req, body.categoryId);
  const doc = await ledger(req.db).create(req.user._id, body);
  res.status(201).json({ data: publicRecord(doc) });
}
