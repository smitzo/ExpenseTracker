import test from 'node:test';
import assert from 'node:assert/strict';
import { integration, enabled, account, write } from './helpers.js';
const ctx = integration();
test(
  'ledger lifecycle preserves omitted fields checks versions and excludes archives',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const c = (await a.agent.get('/api/categories')).body.data[0];
    const tx = await write(a, 'post', '/transactions', {
      description: 'Groceries',
      amount: 29,
      kind: 'expense',
      date: '2026-10-01',
      categoryId: c.id,
      note: 'Keep this',
    }).expect(201);
    const id = tx.body.data.id;
    const edited = await write(a, 'patch', '/transactions/' + id, {
      version: 1,
      description: 'Market',
    }).expect(200);
    assert.equal(edited.body.data.note, 'Keep this');
    assert.equal(edited.body.data.categoryId, c.id);
    await write(a, 'patch', '/transactions/' + id, { version: 1, description: 'Stale' }).expect(
      409,
    );
    const filtered = await a.agent.get('/api/transactions?q=Market&kind=expense').expect(200);
    assert.equal(filtered.body.meta.total, 1);
    await write(a, 'delete', '/transactions/' + id).expect(204);
    assert.equal((await a.agent.get('/api/transactions')).body.meta.total, 0);
  },
);
test(
  'invalid JSON and mass assignment return safe validation responses',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    await write(a, 'post', '/transactions', {
      description: 'Bad',
      amount: 1.2,
      kind: 'expense',
      date: '2026-10-01',
      ownerId: 'override',
    }).expect(400);
  },
);

test(
  'currency remains fixed after archiving the last transaction',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const tx = await write(a, 'post', '/transactions', {
      description: 'Historical',
      date: '2026-10-01',
      amount: 100,
      kind: 'expense',
    }).expect(201);
    await write(a, 'delete', '/transactions/' + tx.body.data.id).expect(204);
    await write(a, 'put', '/preferences', {
      currency: 'USD',
      monthlyTarget: 0,
      weekStartsOn: 'monday',
    }).expect(409);
  },
);

test(
  'date filters reject reversed ranges and search treats regex symbols literally',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    await a.agent.get('/api/transactions?from=2026-10-20&to=2026-10-01').expect(400);
    await write(a, 'post', '/transactions', {
      description: 'Coffee (large)+',
      amount: 100,
      kind: 'expense',
      date: '2026-10-01',
    }).expect(201);
    await write(a, 'post', '/transactions', {
      description: 'Something else',
      amount: 100,
      kind: 'expense',
      date: '2026-10-01',
    }).expect(201);
    const result = await a.agent
      .get('/api/transactions?q=' + encodeURIComponent('(large)+'))
      .expect(200);
    assert.equal(result.body.meta.total, 1);
  },
);

test(
  'archived categories retain their labels in ledger summaries and CSV',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const c = (await a.agent.get('/api/categories')).body.data[0];
    await write(a, 'post', '/transactions', {
      description: 'Historical label',
      date: '2026-10-01',
      amount: 100,
      kind: 'expense',
      categoryId: c.id,
    }).expect(201);
    await write(a, 'delete', '/categories/' + c.id).expect(204);
    const ledger = await a.agent.get('/api/transactions').expect(200);
    assert.equal(ledger.body.data[0].categoryName, c.name);
    const digest = await a.agent.get('/api/digest?month=2026-10').expect(200);
    assert.equal(digest.body.categories[0].name, c.name);
    const csv = await a.agent.get('/api/transactions/export').expect(200);
    assert.ok(csv.text.includes(c.name));
  },
);

test(
  'concurrent creation retries insert one owned record and reject changed payloads',
  { skip: !enabled },
  async () => {
    const { randomUUID } = await import('node:crypto');
    const a = await account(ctx),
      key = randomUUID();
    const body = {
      description: 'Retry-safe expense',
      date: '2026-10-01',
      amount: 12529,
      kind: 'expense',
    };
    const results = await Promise.all(
      Array.from({ length: 3 }, () =>
        write(a, 'post', '/transactions', body).set('Idempotency-Key', key),
      ),
    );
    assert.ok(results.every((r) => [200, 201].includes(r.status)));
    assert.equal(new Set(results.map((r) => r.body.data.id)).size, 1);
    assert.equal((await a.agent.get('/api/transactions')).body.meta.total, 1);
    assert.ok(!('creationFingerprint' in results[0].body.data));
    await write(a, 'post', '/transactions', { ...body, amount: 100 })
      .set('Idempotency-Key', key)
      .expect(409);
    const b = await account(ctx);
    await write(b, 'post', '/transactions', body).set('Idempotency-Key', key).expect(201);
  },
);
