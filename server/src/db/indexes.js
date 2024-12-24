import { collection } from './connection.js';
export async function createIndexes(db) {
  const specs = {
    users: [[{ email: 1 }, { unique: true }]],
    sessions: [
      [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
      [{ ownerId: 1 }, {}],
    ],
    ledger: [
      [
        { ownerId: 1, creationKey: 1 },
        { unique: true, partialFilterExpression: { creationKey: { $type: 'string' } } },
      ],
      [{ ownerId: 1, archived: 1, date: -1, _id: -1 }, {}],
      [
        { ownerId: 1, importKey: 1, importIndex: 1 },
        { unique: true, partialFilterExpression: { importKey: { $type: 'string' } } },
      ],
    ],
    categories: [[{ ownerId: 1, name: 1 }, { unique: true }]],
    budgets: [[{ ownerId: 1, categoryId: 1, month: 1 }, { unique: true }]],
    recurring: [[{ ownerId: 1, nextDate: 1 }, {}]],
    batches: [[{ ownerId: 1 }, {}]],
    rates: [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
    audit: [
      [{ ownerId: 1, createdAt: -1 }, {}],
      [{ expiresAt: 1 }, { expireAfterSeconds: 0 }],
    ],
  };
  for (const [name, indexes] of Object.entries(specs))
    for (const [keys, options] of indexes) await collection(db, name).createIndex(keys, options);
}
