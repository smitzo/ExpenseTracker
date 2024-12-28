import test from 'node:test';
import assert from 'node:assert/strict';
import { integration, enabled, account, write } from './helpers.js';
const ctx = integration();
test(
  'case-insensitive category uniqueness is atomic and owner-scoped',
  { skip: !enabled },
  async () => {
    const a = await account(ctx);
    const results = await Promise.all(
      ['Travel fund', 'TRAVEL FUND'].map((name) =>
        write(a, 'post', '/categories', { name, color: 'blue' }),
      ),
    );
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    const b = await account(ctx);
    await write(b, 'post', '/categories', { name: 'Travel fund', color: 'blue' }).expect(201);
    const rows = (await a.agent.get('/api/categories')).body.data;
    assert.equal(rows.filter((c) => c.name.toLowerCase() === 'travel fund').length, 1);
  },
);
