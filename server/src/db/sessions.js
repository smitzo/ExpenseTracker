import { collection } from './connection.js';
export const sessions = (db) => ({
  create: (data) => collection(db, 'sessions').insertOne(data),
  find: (hash) => collection(db, 'sessions').findOne({ _id: hash, expiresAt: { $gt: new Date() } }),
  list: (ownerId) =>
    collection(db, 'sessions')
      .find(
        { ownerId, expiresAt: { $gt: new Date() } },
        { projection: { _id: 0, publicId: 1, createdAt: 1, expiresAt: 1 } },
      )
      .toArray(),
  revoke: (_id, ownerId) => collection(db, 'sessions').deleteOne({ _id, ownerId }),
  revokePublic: (publicId, ownerId) => collection(db, 'sessions').deleteOne({ publicId, ownerId }),
  revokeAll: (ownerId) => collection(db, 'sessions').deleteMany({ ownerId }),
});
