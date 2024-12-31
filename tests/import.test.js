import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { integration, enabled, account, write } from './helpers.js';
const ctx = integration();
const csv = 'date,description,amount,kind,category,note\n2026-10-01,Coffee,1.25,expense,,Note';
test(
  'preview never writes and retried imports never duplicate rows',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const p = await write(a, 'post', '/imports/preview', { csv }).expect(200);
    assert.equal(p.body.data[0].data.amount, 125);
    assert.equal((await a.agent.get('/api/transactions')).body.meta.total, 0);
    const key = randomUUID();
    await write(a, 'post', '/imports/commit', { csv, key }).expect(200);
    const replay = await write(a, 'post', '/imports/commit', { csv, key }).expect(200);
    assert.equal(replay.body.replay, true);
    assert.equal((await a.agent.get('/api/transactions')).body.meta.total, 1);
    await write(a, 'post', '/imports/commit', { csv: csv.replace('Coffee', 'Tea'), key }).expect(
      409,
    );
  },
);
test(
  'invalid batches write no rows and exports neutralize formulas',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    await write(a, 'post', '/imports/commit', {
      csv: csv + '\n2026-02-30,Invalid,1.00,expense,,',
      key: randomUUID(),
    }).expect(400);
    assert.equal((await a.agent.get('/api/transactions')).body.meta.total, 0);
    await write(a, 'post', '/transactions', {
      description: '=SUM(A1)',
      amount: 100,
      kind: 'expense',
      date: '2026-10-01',
    }).expect(201);
    const output = await a.agent.get('/api/transactions/export').expect(200);
    assert.ok(output.text.includes('"\'=SUM(A1)"'));
  },
);

test('completed imports replay after their category is renamed', { skip: !enabled }, async () => {
  const a = await account(ctx);
  const c = (await a.agent.get('/api/categories')).body.data[0];
  const text = csv.replace(',,Note', ',' + c.name + ',Note'),
    key = randomUUID();
  await write(a, 'post', '/imports/commit', { csv: text, key }).expect(200);
  await write(a, 'patch', '/categories/' + c.id, {
    name: 'Renamed category',
    color: c.color,
  }).expect(200);
  const result = await write(a, 'post', '/imports/commit', { csv: text, key }).expect(200);
  assert.equal(result.body.replay, true);
  assert.equal(result.body.imported, 1);
});

test('interrupted imports resume the accepted category snapshot', { skip: !enabled }, async () => {
  const a = await account(ctx);
  const c = (await a.agent.get('/api/categories')).body.data[0];
  const text = csv.replace(',,Note', ',' + c.name + ',Note'),
    key = randomUUID();
  const { previewRows } = await import('../server/src/ledger/importPreview.js');
  const { claimBatch, payloadHash } = await import('../server/src/db/idempotency.js');
  const rows = await previewRows({ db: ctx.db, user: { _id: a.user.id } }, text);
  await claimBatch(ctx.db, a.user.id, key, payloadHash(text), rows);
  await write(a, 'patch', '/categories/' + c.id, {
    name: 'Another renamed category',
    color: c.color,
  }).expect(200);
  await write(a, 'post', '/imports/commit', { csv: text, key }).expect(200);
  const result = await a.agent.get('/api/transactions').expect(200);
  assert.equal(result.body.meta.total, 1);
  assert.equal(result.body.data[0].categoryId, c.id);
});

test(
  'concurrent identical batch requests leave one set of ledger rows',
  { skip: !enabled },
  async () => {
    const a = await account(ctx),
      key = randomUUID();
    const results = await Promise.all(
      Array.from({ length: 3 }, () => write(a, 'post', '/imports/commit', { csv, key })),
    );
    assert.ok(results.some((r) => r.status === 200));
    assert.ok(results.every((r) => [200, 409].includes(r.status)));
    await write(a, 'post', '/imports/commit', { csv, key }).expect(200);
    assert.equal((await a.agent.get('/api/transactions')).body.meta.total, 1);
  },
);
