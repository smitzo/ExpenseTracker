import { ledger } from '../db/ledger.js';
import { transactionPatch } from '../domain/ledger.js';
import { idSchema, publicRecord } from '../domain/identifiers.js';
import { checkCategory } from '../accounts/writeCategories.js';
import { ensure, notFound } from '../domain/errors.js';
export async function updateTransaction(req, res) {
  const id = idSchema.parse(req.params.id);
  const { version, ...body } = transactionPatch.parse(req.body);
  const store = ledger(req.db);
  if (!(await store.find(id, req.user._id))) throw notFound();
  await checkCategory(req, body.categoryId);
  const doc = await store.update(id, req.user._id, version, body);
  ensure(doc, 409, 'STALE_VERSION', 'This transaction changed. Refresh before editing again.');
  res.json({ data: publicRecord(doc) });
}
