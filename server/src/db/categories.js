import { collection } from './connection.js';
import { AppError } from '../domain/errors.js';
import { record } from '../domain/identifiers.js';
export const categories = (db) => ({
  list: (ownerId) =>
    collection(db, 'categories')
      .find({ ownerId, archived: false })
      .sort({ name: 1 })
      .limit(100)
      .toArray(),
  history: async (ownerId) => {
    const rows = await collection(db, 'categories').find({ ownerId }).limit(10001).toArray();
    if (rows.length > 10000)
      throw new AppError(
        422,
        'CATEGORY_HISTORY_LIMIT',
        'Contact support to process more than 10,000 historical categories.',
      );
    return rows;
  },
  find: (_id, ownerId) => collection(db, 'categories').findOne({ _id, ownerId, archived: false }),
  create: async (ownerId, fields) => {
    const doc = record(ownerId, { ...fields, archived: false });
    await collection(db, 'categories').insertOne(doc);
    return doc;
  },
  update: (_id, ownerId, fields) =>
    collection(db, 'categories').findOneAndUpdate(
      { _id, ownerId, archived: false },
      { $set: { ...fields, updatedAt: new Date() } },
      { returnDocument: 'after' },
    ),
});
