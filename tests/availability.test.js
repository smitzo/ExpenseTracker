import test from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import { createApp } from '../server/src/app.js';
import { config } from './helpers.js';
test('liveness stays available and readiness safely reports transient database failures', async () => {
  const app = createApp({
    config,
    getDb: async () => {
      throw Object.assign(new Error('mongodb://secret:password@private-host'), {
        name: 'MongoServerSelectionError',
      });
    },
  });
  await supertest(app).get('/api/health').expect(200);
  const result = await supertest(app).get('/api/ready').expect(503);
  assert.equal(result.body.error.code, 'UNAVAILABLE');
  assert.equal(result.headers['retry-after'], '5');
  assert.ok(!JSON.stringify(result.body).includes('secret'));
  assert.equal(result.headers['cache-control'], 'no-store');
});
