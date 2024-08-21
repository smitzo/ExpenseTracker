import { collection } from './connection.js';
import { newId } from '../domain/identifiers.js';
import { defaults } from '../domain/preferences.js';
export const users = db => ({
  byEmail: email => collection(db, 'users').findOne({ email }),
  byId: _id => collection(db, 'users').findOne({ _id }),
  create: async fields => { const user = { _id: newId(), ...fields, preferences: { ...defaults }, createdAt: new Date() }; await collection(db, 'users').insertOne(user); return user; },
  update: (_id, fields) => collection(db, 'users').findOneAndUpdate({ _id }, { $set: fields }, { returnDocument: 'after' }),
});
export function safeUser(user) { return { id: user._id, name: user.name, email: user.email, preferences: user.preferences, createdAt: user.createdAt }; }
