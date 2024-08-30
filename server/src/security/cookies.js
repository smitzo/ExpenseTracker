import { parse, serialize } from 'cookie';
export const cookieName = config => config.NODE_ENV === 'production' ? '__Host-penny' : 'penny';
export function readSession(req, config) { return parse(req.headers.cookie || '')[cookieName(config)]; }
export function setSession(res, config, token, expires) { res.setHeader('Set-Cookie', serialize(cookieName(config), token, { httpOnly: true, secure: config.NODE_ENV === 'production', sameSite: 'lax', path: '/', expires })); }
export function clearSession(res, config) { setSession(res, config, '', new Date(0)); }
