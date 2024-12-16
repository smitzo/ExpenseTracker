import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { database, disconnect } from '../server/src/db/connection.js';
const enabled = Boolean(process.env.TEST_MONGODB_URI);
test(
  'connection cache reuses one URI without crossing database boundaries',
  { skip: !enabled },
  async () => {
    const a = new URL(process.env.TEST_MONGODB_URI),
      b = new URL(process.env.TEST_MONGODB_URI);
    a.pathname = '/penny_test_pool_a_' + randomUUID().replaceAll('-', '');
    b.pathname = '/penny_test_pool_b_' + randomUUID().replaceAll('-', '');
    let first, second;
    try {
      first = await database(a.toString());
      second = await database(b.toString());
      assert.equal(await database(a.toString()), first);
      assert.notEqual(first, second);
      await first.collection('boundary').insertOne({ value: 'first' });
      assert.equal(await second.collection('boundary').countDocuments(), 0);
      await disconnect(a.toString());
      assert.equal((await second.command({ ping: 1 })).ok, 1);
    } finally {
      if (first) {
        const reopened = await database(a.toString());
        await reopened.dropDatabase();
      }
      if (second) await second.dropDatabase();
      await disconnect();
    }
  },
);
