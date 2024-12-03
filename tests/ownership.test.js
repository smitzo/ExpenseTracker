import test from 'node:test';
import assert from 'node:assert/strict';
import { integration, enabled, account, write } from './helpers.js';
const ctx = integration();
test(
  'another account cannot read mutate or archive an owned transaction',
  { skip: !enabled },
  async () => {
    const a = await account(ctx),
      b = await account(ctx);
    const created = await write(a, 'post', '/transactions', {
      description: 'Private',
      date: '2026-10-01',
      amount: 100,
      kind: 'expense',
    }).expect(201);
    const id = created.body.data.id;
    await write(b, 'patch', '/transactions/' + id, { version: 1, description: 'Stolen' }).expect(
      404,
    );
    await write(b, 'delete', '/transactions/' + id).expect(404);
    assert.equal((await b.agent.get('/api/transactions').expect(200)).body.meta.total, 0);
    assert.equal(
      (await a.agent.get('/api/transactions').expect(200)).body.data[0].description,
      'Private',
    );
  },
);
test('foreign category identifiers cannot be assigned', { skip: !enabled }, async () => {
  const a = await account(ctx),
    b = await account(ctx);
  const cats = await a.agent.get('/api/categories').expect(200);
  await write(b, 'post', '/transactions', {
    description: 'No',
    amount: 100,
    kind: 'expense',
    date: '2026-10-01',
    categoryId: cats.body.data[0].id,
  }).expect(404);
  await write(b, 'put', '/budgets', {
    categoryId: cats.body.data[0].id,
    month: '2026-10',
    amount: 100,
  }).expect(404);
});
