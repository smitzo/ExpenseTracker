import test from 'node:test';
import assert from 'node:assert/strict';
import { integration, enabled, account, write, config } from './helpers.js';
const ctx = integration();
test(
  'accounts use private cookies, sanitized users and CSRF protection',
  { skip: !enabled },
  async () => {
    const u = await account(ctx);
    assert.ok(!('passwordHash' in u.user));
    const profile = await u.agent.get('/api/auth/session').expect(200);
    assert.equal(profile.body.csrf, u.csrf);
    const cookies = profile.headers['cache-control'];
    assert.equal(cookies, 'no-store');
    await u.agent.post('/api/auth/logout').set('Origin', config.APP_ORIGIN).send({}).expect(403);
    await write(u, 'post', '/auth/logout').expect(204);
    await u.agent.get('/api/auth/session').expect(401);
  },
);
test('origin and bad credentials are rejected', { skip: !enabled }, async () => {
  const u = await account(ctx);
  await u.agent.post('/api/auth/login').set('Origin', 'https://evil.example').send({}).expect(403);
  await u.agent
    .post('/api/auth/login')
    .set('Origin', config.APP_ORIGIN)
    .send({ email: u.user.email, password: 'incorrect password value' })
    .expect(401);
});
test('password change revokes every existing session', { skip: !enabled }, async () => {
  const u = await account(ctx);
  await write(u, 'put', '/password', {
    currentPassword: 'correct horse battery staple',
    password: 'new long unrelated word sequence',
  }).expect(204);
  await u.agent.get('/api/auth/session').expect(401);
});

test('expired sessions are rejected before TTL cleanup', { skip: !enabled }, async () => {
  const a = await account(ctx);
  await ctx.db
    .collection('v2_sessions')
    .updateMany({ ownerId: a.user.id }, { $set: { expiresAt: new Date(0) } });
  await a.agent.get('/api/auth/session').expect(401);
});
test('persistent login throttling blocks repeated attempts', { skip: !enabled }, async () => {
  const a = await account(ctx);
  for (let i = 0; i < 12; i++)
    await a.agent
      .post('/api/auth/login')
      .set('Origin', config.APP_ORIGIN)
      .send({ email: a.user.email, password: 'bad password long enough' })
      .expect(401);
  await a.agent
    .post('/api/auth/login')
    .set('Origin', config.APP_ORIGIN)
    .send({ email: a.user.email, password: 'bad password long enough' })
    .expect(429);
});

test(
  'sessions inserted after password revocation cannot reuse an old credential revision',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const { makeSession } = await import('../server/src/security/sessionTokens.js');
    const delayed = makeSession(a.user.id, 7, 0);
    await write(a, 'put', '/password', {
      currentPassword: 'correct horse battery staple',
      password: 'a new unrelated word sequence',
    }).expect(204);
    await ctx.db.collection('v2_sessions').insertOne(delayed.record);
    await a.agent
      .get('/api/auth/session')
      .set('Cookie', 'penny=' + delayed.token)
      .expect(401);
  },
);

test('short throttle windows expose their actual retry interval', { skip: !enabled }, async () => {
  const { throttle } = await import('../server/src/db/rateLimits.js');
  const key = 'window-' + crypto.randomUUID();
  await throttle(ctx.db, config.RATE_SECRET, key, 1, 60);
  await assert.rejects(
    throttle(ctx.db, config.RATE_SECRET, key, 1, 60),
    (e) => e.status === 429 && e.retryAfter >= 1 && e.retryAfter <= 60,
  );
});
