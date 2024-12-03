import { sessions } from '../db/sessions.js';
import { idSchema } from '../domain/identifiers.js';
import { ensure } from '../domain/errors.js';
export async function revokeSession(req, res) {
  const result = await sessions(req.db).revokePublic(idSchema.parse(req.params.id), req.user._id);
  ensure(result.deletedCount, 404, 'NOT_FOUND', 'Session is unavailable.');
  res.status(204).end();
}
