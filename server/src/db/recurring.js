import { collection } from './connection.js';
import { record } from '../domain/identifiers.js';
export const recurring = (db) => ({
  list: (ownerId) =>
    collection(db, 'recurring').find({ ownerId }).sort({ nextDate: 1 }).limit(100).toArray(),
  create: async (ownerId, fields) => {
    const doc = record(ownerId, fields);
    await collection(db, 'recurring').insertOne(doc);
    return doc;
  },
  update: (_id, ownerId, fields) =>
    collection(db, 'recurring').findOneAndUpdate(
      { _id, ownerId },
      { $set: { ...fields, updatedAt: new Date() } },
      { returnDocument: 'after' },
    ),
  remove: (_id, ownerId) => collection(db, 'recurring').deleteOne({ _id, ownerId }),
});
