import { throttle } from '../db/rateLimits.js';
export async function guardLogin(req, config, email) {
  await throttle(req.db, config.RATE_SECRET, 'login-ip:' + req.ip, 40);
  await throttle(req.db, config.RATE_SECRET, 'login-email:' + email, 12);
}
export const guardRegistration = (req, config) =>
  throttle(req.db, config.RATE_SECRET, 'register:' + req.ip, 10, 3600);
export const guardWrites = (config) => async (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method))
    await throttle(req.db, config.RATE_SECRET, 'write:' + req.user._id, 120, 60);
  next();
};
