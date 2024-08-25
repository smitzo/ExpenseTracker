import { collection } from './connection.js';
import { newId } from '../domain/identifiers.js';
export const budgets = db => ({
  list: (ownerId, month) => collection(db, 'budgets').find({ ownerId, month }).limit(100).toArray(),
  save: (ownerId, fields) => collection(db, 'budgets').findOneAndUpdate({ ownerId, categoryId: fields.categoryId, month: fields.month }, { $set: { amount: fields.amount, updatedAt: new Date() }, $setOnInsert: { _id: newId(), createdAt: new Date() } }, { upsert: true, returnDocument: 'after' }),
  remove: (_id, ownerId) => collection(db, 'budgets').deleteOne({ _id, ownerId }),
});
