import { registrationSchema } from '../domain/preferences.js';
import { users, safeUser } from '../db/users.js';
import { categories } from '../db/categories.js';
import { collection } from '../db/connection.js';
import { defaultCategories } from '../domain/categories.js';
import { hashPassword } from '../security/passwords.js';
import { guardRegistration } from '../security/loginThrottle.js';
import { makeSession } from '../security/sessionTokens.js';
import { sessions } from '../db/sessions.js';
import { setSession } from '../security/cookies.js';
export const register = config => async (req, res) => {
  await guardRegistration(req, config);
  const body = registrationSchema.parse(req.body);
  const user = await users(req.db).create({ name: body.name, email: body.email, passwordHash: await hashPassword(body.password) });
  try { for (const category of defaultCategories) await categories(req.db).create(user._id, category); }
  catch (error) { await collection(req.db, 'categories').deleteMany({ ownerId: user._id }); await collection(req.db, 'users').deleteOne({ _id: user._id }); throw error; }
  const session = makeSession(user._id, config.SESSION_DAYS); await sessions(req.db).create(session.record);
  setSession(res, config, session.token, session.record.expiresAt);
  res.status(201).json({ user: safeUser(user), csrf: session.csrf });
};
