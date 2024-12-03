import { collection } from './connection.js';
import { createHash } from 'node:crypto';
import { AppError } from '../domain/errors.js';
export const payloadHash = (body) =>
  createHash('sha256').update(JSON.stringify(body)).digest('hex');
export async function claimBatch(db, ownerId, key, fingerprint) {
  const c = collection(db, 'batches');
  try {
    await c.insertOne({ _id: ownerId + ':' + key, ownerId, fingerprint, createdAt: new Date() });
    return null;
  } catch (e) {
    if (e.code !== 11000) throw e;
    const prior = await c.findOne({ _id: ownerId + ':' + key });
    if (prior.fingerprint !== fingerprint)
      throw new AppError(409, 'KEY_REUSED', 'Use a new import key for different data.');
    return prior;
  }
}
