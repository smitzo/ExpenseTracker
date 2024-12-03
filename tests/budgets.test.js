import test from 'node:test';
import assert from 'node:assert/strict';
import { integration, enabled, account, write } from './helpers.js';
const ctx = integration();
test(
  'budget upserts remain unique and report only matching expense spending',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const c = (await a.agent.get('/api/categories')).body.data[0];
    await write(a, 'put', '/budgets', { categoryId: c.id, month: '2026-10', amount: 1000 }).expect(
      200,
    );
    await write(a, 'put', '/budgets', { categoryId: c.id, month: '2026-10', amount: 2000 }).expect(
      200,
    );
    await write(a, 'post', '/transactions', {
      categoryId: c.id,
      date: '2026-10-01',
      amount: 500,
      kind: 'expense',
      description: 'Test',
    }).expect(201);
    const result = await a.agent.get('/api/budgets?month=2026-10').expect(200);
    assert.equal(result.body.data.length, 1);
    assert.equal(result.body.data[0].spent, 500);
    assert.equal(result.body.data[0].remaining, 1500);
  },
);
test('recurring plans project without creating ledger records', { skip: !enabled }, async () => {
  const a = await account(ctx);
  await write(a, 'post', '/recurring', {
    name: 'Monthly',
    amount: 100,
    frequency: 'monthly',
    nextDate: '2026-10-10',
    active: true,
  }).expect(201);
  const digest = await a.agent.get('/api/digest?month=2026-10').expect(200);
  assert.equal(digest.body.upcoming.length, 1);
  assert.equal(digest.body.summary.count, 0);
});
