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
  await users(req.db).update(req.user._id, { passwordHash: await hashPassword(body.password) });
  await sessions(req.db).revokeAll(req.user._id);
  clearSession(res, config);
  res.status(204).end();
};
