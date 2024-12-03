import { ledger } from '../db/ledger.js';
import { idSchema } from '../domain/identifiers.js';
import { notFound } from '../domain/errors.js';
export async function archiveTransaction(req, res) {
  const doc = await ledger(req.db).archive(idSchema.parse(req.params.id), req.user._id);
  if (!doc) throw notFound();
  res.status(204).end();
}
