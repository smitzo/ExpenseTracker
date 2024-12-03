import { timingSafeEqual } from 'node:crypto';
import { tokenHash } from './sessionTokens.js';
import { AppError } from '../domain/errors.js';
export function csrf(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.headers['x-csrf-token'];
  if (
    typeof token !== 'string' ||
    !/^[a-f0-9]{64}$/.test(token) ||
    !timingSafeEqual(Buffer.from(tokenHash(token)), Buffer.from(req.session.csrfHash))
  )
    throw new AppError(403, 'CSRF', 'Refresh your session and try again.');
  next();
}
