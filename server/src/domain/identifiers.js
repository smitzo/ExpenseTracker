import { randomUUID } from 'node:crypto';
import { z } from 'zod';
export const idSchema = z.uuid();
export const newId = () => randomUUID();
export function record(ownerId, fields) { return { _id: newId(), ownerId, ...fields, createdAt: new Date(), updatedAt: new Date() }; }
export function publicRecord(doc) { if (!doc) return null; const { _id, ownerId: _ownerId, ...rest } = doc; return { id: _id, ...rest }; }
