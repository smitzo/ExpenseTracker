import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';
const derive = promisify(scrypt);
export async function hashPassword(password) { const salt = randomBytes(16).toString('hex'); const key = await derive(password, salt, 64); return `scrypt:${salt}:${key.toString('hex')}`; }
export async function verifyPassword(password, stored) {
  if (stored?.startsWith('$2')) return bcrypt.compare(password, stored);
  const [scheme, salt, hex] = String(stored).split(':');
  if (scheme !== 'scrypt' || !salt || !/^[a-f0-9]{128}$/.test(hex || '')) return false;
  return timingSafeEqual(await derive(password, salt, 64), Buffer.from(hex, 'hex'));
}
