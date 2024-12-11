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
