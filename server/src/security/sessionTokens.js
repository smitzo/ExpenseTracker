import { randomBytes, createHash } from 'node:crypto';
import { newId } from '../domain/identifiers.js';
export const tokenHash = token => createHash('sha256').update(token).digest('hex');
export function makeSession(ownerId, days) { const token = randomBytes(32).toString('hex'); const csrf = tokenHash('csrf:' + token); return { token, csrf, record: { _id: tokenHash(token), publicId: newId(), ownerId, csrfHash: tokenHash(csrf), createdAt: new Date(), expiresAt: new Date(Date.now() + days * 86400000) } }; }
