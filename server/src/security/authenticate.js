import { readSession } from './cookies.js';
import { tokenHash } from './sessionTokens.js';
import { sessions } from '../db/sessions.js';
import { users } from '../db/users.js';
import { AppError } from '../domain/errors.js';
export const authenticate = (config) => async (req, _res, next) => {
  const token = readSession(req, config);
  if (!/^[a-f0-9]{64}$/.test(token || ''))
    throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  const session = await sessions(req.db).find(tokenHash(token));
  const user = session && (await users(req.db).byId(session.ownerId));
  if (!user || (session.credentialVersion || 0) !== (user.credentialVersion || 0))
    throw new AppError(401, 'UNAUTHENTICATED', 'Your session has expired. Please sign in.');
  req.csrf = tokenHash('csrf:' + token);
  req.session = session;
  req.user = user;
  next();
};
