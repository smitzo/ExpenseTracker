import { collection } from './connection.js';
import { record } from '../domain/identifiers.js';
import { AppError } from '../domain/errors.js';
export const ledger = (db) => ({
  list: (ownerId, filter = {}, skip = 0, limit = 100) =>
    collection(db, 'ledger')
      .find({ ...filter, ownerId, archived: false })
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  count: (ownerId, filter = {}) =>
    collection(db, 'ledger').countDocuments({ ...filter, ownerId, archived: false }),
  all: async (ownerId) => {
    const rows = await collection(db, 'ledger')
      .find({ ownerId, archived: false })
      .limit(10001)
      .toArray();
    if (rows.length > 10000)
      throw new AppError(
        422,
        'HISTORY_LIMIT',
        'Filter or archive history before running analysis over more than 10,000 records.',
      );
    return rows;
  },
  byCreationKey: (ownerId, creationKey) =>
    collection(db, 'ledger').findOne({ ownerId, creationKey }),
  createOnce: async (ownerId, creationKey, creationFingerprint, fields) => {
    const c = collection(db, 'ledger');
    try {
      const result = await c.findOneAndUpdate(
        { ownerId, creationKey },
        {
          $setOnInsert: record(ownerId, {
            ...fields,
            creationKey,
            creationFingerprint,
            version: 1,
            archived: false,
          }),
        },
        { upsert: true, returnDocument: 'after', includeResultMetadata: true },
      );
      return { doc: result.value, replay: Boolean(result.lastErrorObject?.updatedExisting) };
    } catch (error) {
      if (error.code !== 11000) throw error;
      const doc = await c.findOne({ ownerId, creationKey });
      if (!doc) throw error;
      return { doc, replay: true };
    }
  },
  find: (_id, ownerId) => collection(db, 'ledger').findOne({ _id, ownerId, archived: false }),
  create: async (ownerId, fields) => {
    const doc = record(ownerId, { ...fields, version: 1, archived: false });
    await collection(db, 'ledger').insertOne(doc);
    return doc;
  },
  update: (_id, ownerId, version, fields) =>
    collection(db, 'ledger').findOneAndUpdate(
      { _id, ownerId, version, archived: false },
      { $set: { ...fields, updatedAt: new Date() }, $inc: { version: 1 } },
      { returnDocument: 'after' },
    ),
  archive: (_id, ownerId) =>
    collection(db, 'ledger').findOneAndUpdate(
      { _id, ownerId, archived: false },
      { $set: { archived: true, updatedAt: new Date() }, $inc: { version: 1 } },
      { returnDocument: 'after' },
    ),
});
