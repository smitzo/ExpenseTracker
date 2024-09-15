import { z } from 'zod';
import { previewRows, csvRequest } from './importPreview.js';
import { claimBatch, payloadHash } from '../db/idempotency.js';
import { collection } from '../db/connection.js';
import { record } from '../domain/identifiers.js';
import { ensure } from '../domain/errors.js';
export async function commitImport(req, res) {
  const { csv, key } = csvRequest.extend({ key: z.uuid() }).parse(req.body);
  const rows = await previewRows(req, csv); ensure(rows.length > 0 && rows.every(r => r.data), 400, 'IMPORT_INVALID', 'Fix every preview error before importing.');
  const prior = await claimBatch(req.db, req.user._id, key, payloadHash(csv));
  if (!prior?.completed) {
    const ops = rows.map((r, importIndex) => ({ updateOne: { filter: { ownerId: req.user._id, importKey: key, importIndex }, update: { $setOnInsert: record(req.user._id, { ...r.data, archived: false, version: 1, importKey: key, importIndex }) }, upsert: true } }));
    await collection(req.db, 'ledger').bulkWrite(ops, { ordered: true });
    await collection(req.db, 'batches').updateOne({ _id: req.user._id + ':' + key }, { $set: { completed: true, count: rows.length } });
  }
  res.json({ imported: rows.length, replay: Boolean(prior?.completed) });
}
