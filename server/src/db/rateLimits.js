import { collection } from './connection.js';
import { createHmac } from 'node:crypto';
import { AppError } from '../domain/errors.js';
export async function throttle(db, secret, key, limit, seconds = 900) {
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const _id = createHmac('sha256', secret).update(key + ':' + bucket).digest('hex');
  let row;
  try { row = await collection(db, 'rates').findOneAndUpdate({ _id }, { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * seconds * 1000) } }, { upsert: true, returnDocument: 'after' }); }
  catch (e) { if (e.code !== 11000) throw e; row = await collection(db, 'rates').findOneAndUpdate({ _id }, { $inc: { count: 1 } }, { returnDocument: 'after' }); }
  if (row.count > limit) throw new AppError(429, 'RATE_LIMIT', 'Too many attempts. Please try again later.');
}
