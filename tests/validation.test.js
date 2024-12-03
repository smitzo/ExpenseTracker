import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { transactionSchema, transactionPatch } from '../server/src/domain/ledger.js';
import { loadConfig } from '../server/src/config.js';
import { csvCell } from '../server/src/ledger/export.js';
import { parseCsv } from '../server/src/ledger/csvParser.js';
const base = {
  amount: 100,
  date: '2026-10-01',
  kind: 'expense',
  description: 'Test',
  categoryId: randomUUID(),
};
test('transaction validation rejects mass assignment and nonminor amounts', () => {
  assert.equal(transactionSchema.parse(base).note, '');
  assert.throws(() => transactionSchema.parse({ ...base, ownerId: randomUUID() }));
  assert.throws(() => transactionSchema.parse({ ...base, amount: 1.2 }));
  assert.throws(() => transactionPatch.parse({ version: 1 }));
});
test('production config refuses unsafe origins and placeholder secrets', () => {
  const env = {
    MONGODB_URI: 'mongodb://localhost/test',
    RATE_SECRET: 'x'.repeat(32),
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://penny.example.com',
  };
  assert.equal(loadConfig(env).PORT, 4000);
  for (const origin of ['http://penny.example.com', 'https://penny.example.com/'])
    assert.throws(() => loadConfig({ ...env, APP_ORIGIN: origin }));
});
test('CSV parser handles quoted commas newlines escaped quotes and UTF8 BOM', () => {
  assert.deepEqual(parseCsv('\uFEFFa,b\r\n"x,y","a""b"\r\n'), [
    ['a', 'b'],
    ['x,y', 'a"b'],
  ]);
  assert.deepEqual(parseCsv('a,b\n"line\nline",x'), [
    ['a', 'b'],
    ['line\nline', 'x'],
  ]);
  assert.throws(() => parseCsv('a\n"bad'));
  assert.throws(() => parseCsv('a\n"ok"bad'));
});
test('CSV output neutralizes leading formula characters', () => {
  for (const v of ['=SUM(A1)', '+cmd', '-cmd', '@cmd', '  =cmd'])
    assert.ok(csvCell(v).startsWith('"\''));
  assert.equal(csvCell('hello'), '"hello"');
});
