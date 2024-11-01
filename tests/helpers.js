import { before, after } from 'node:test';
import { randomUUID } from 'node:crypto';
import supertest from 'supertest';
import { createApp } from '../server/src/app.js';
import { database, disconnect } from '../server/src/db/connection.js';
import { createIndexes } from '../server/src/db/indexes.js';
export const enabled = Boolean(process.env.TEST_MONGODB_URI);
export const config = { NODE_ENV: 'test', APP_ORIGIN: 'http://localhost:5173', RATE_SECRET: 'test-secret-that-is-longer-than-32-characters', SESSION_DAYS: 7 };
export function integration() {
  let db; let app;
  before(async () => { if (!enabled) return; const base = process.env.TEST_MONGODB_URI; const url = new URL(base); url.pathname = '/penny_test_' + randomUUID().replaceAll('-', ''); db = await database(url.toString()); await createIndexes(db); app = createApp({ config, getDb: async () => db }); });
  after(async () => { if (db) { await db.dropDatabase(); await disconnect(); } });
  return { get db() { return db; }, get app() { return app; } };
}
export async function account(ctx, label = randomUUID()) { const agent = supertest.agent(ctx.app); const result = await agent.post('/api/auth/register').set('Origin', config.APP_ORIGIN).send({name:'Test User',email:label+'@example.com',password:'correct horse battery staple'}).expect(201); return { agent, csrf: result.body.csrf, user: result.body.user }; }
export function write(user,method,path,body={}) { return user.agent[method]('/api'+path).set('Origin',config.APP_ORIGIN).set('X-CSRF-Token',user.csrf).send(body); }
