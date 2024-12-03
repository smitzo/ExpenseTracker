import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_ORIGIN: z.url().default('http://localhost:5173'),
  MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\//),
  SESSION_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  RATE_SECRET: z.string().min(32),
});
export function loadConfig(env = process.env) {
  const config = schema.parse(env);
  const url = new URL(config.APP_ORIGIN);
  if (url.origin !== config.APP_ORIGIN)
    throw new Error('APP_ORIGIN must be an origin without a path');
  if (
    config.NODE_ENV === 'production' &&
    (url.protocol !== 'https:' || config.RATE_SECRET.startsWith('replace-'))
  )
    throw new Error('Production requires HTTPS and a random RATE_SECRET');
  return Object.freeze(config);
}
