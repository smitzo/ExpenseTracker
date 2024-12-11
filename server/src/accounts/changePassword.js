import { z } from 'zod';
import { verifyPassword, hashPassword } from '../security/passwords.js';
import { users } from '../db/users.js';
import { sessions } from '../db/sessions.js';
import { clearSession } from '../security/cookies.js';
import { ensure } from '../domain/errors.js';
const schema = z.strictObject({
  currentPassword: z.string().min(1).max(128),
  password: z.string().min(12).max(128),
});
export const changePassword = (config) => async (req, res) => {
  const body = schema.parse(req.body);
  ensure(
    await verifyPassword(body.currentPassword, req.user.passwordHash),
    401,
    'CREDENTIALS',
    'Your current password is incorrect.',
  );
  const updated = await users(req.db).changePassword(
    req.user._id,
    req.user.passwordHash,
    await hashPassword(body.password),
  );
  ensure(
    updated,
    409,
    'CREDENTIALS_CHANGED',
    'Your credentials changed. Sign in before trying again.',
  );
  await sessions(req.db).revokeAll(req.user._id);
  clearSession(res, config);
  res.status(204).end();
};
