import { AppError } from '../domain/errors.js';
export const originPolicy = config => (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (req.headers.origin !== config.APP_ORIGIN) throw new AppError(403, 'ORIGIN', 'This request origin is not allowed.');
    if (!req.is('application/json')) throw new AppError(415, 'CONTENT_TYPE', 'Send application/json.');
  }
  next();
};
