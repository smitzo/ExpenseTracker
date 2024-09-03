import { credentialsSchema } from '../domain/preferences.js';
import { users, safeUser } from '../db/users.js';
import { verifyPassword, hashPassword } from '../security/passwords.js';
import { guardLogin } from '../security/loginThrottle.js';
import { makeSession } from '../security/sessionTokens.js';
import { sessions } from '../db/sessions.js';
import { setSession } from '../security/cookies.js';
import { AppError } from '../domain/errors.js';
const dummyHash = hashPassword('a-dummy-password-never-used');
export const login = config => async (req, res) => {
  const body = credentialsSchema.parse(req.body); await guardLogin(req, config, body.email);
  const user = await users(req.db).byEmail(body.email);
  const valid = await verifyPassword(body.password, user?.passwordHash || await dummyHash);
  if (!user || !valid) throw new AppError(401, 'CREDENTIALS', 'Email or password is incorrect.');
  const session = makeSession(user._id, config.SESSION_DAYS); await sessions(req.db).create(session.record); setSession(res, config, session.token, session.record.expiresAt);
  res.json({ user: safeUser(user), csrf: session.csrf });
};
