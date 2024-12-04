import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const run = promisify(execFile);
const uri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27128/penny_test';
const name = (prefix) => prefix + randomUUID().replaceAll('-', '');
const uriFor = (db) => {
  const url = new URL(uri);
  url.pathname = '/' + db;
  return url.toString();
};

test('legacy migration dry-run and idempotent apply preserve exact owned amounts', async () => {
  const dbName = name('penny_test_migrate_');
  const client = new mongoose.mongo.MongoClient(uriFor(dbName));
  await client.connect();
  const db = client.db(dbName);
  try {
    const userId = new mongoose.Types.ObjectId(),
      categoryId = new mongoose.Types.ObjectId();
    await db.collection('users').insertOne({
      _id: userId,
      firstName: 'Legacy',
      lastName: 'Fixture',
      email: 'legacy@example.com',
      password: await bcrypt.hash('legacy-password', 4),
      categories: [{ _id: categoryId, label: 'Food' }],
    });
    await db.collection('transactions').insertOne({
      user_id: userId,
      category_id: categoryId,
      amount: 123.45,
      description: 'Migration fixture',
      date: new Date('2026-10-01T00:00:00Z'),
    });
    const options = {
      env: { ...process.env, MONGODB_URI: uriFor(dbName), LEGACY_CURRENCY: 'INR' },
      timeout: 15000,
    };
    const dry = await run(process.execPath, ['scripts/migrate-legacy.js'], options);
    expect(JSON.parse(dry.stdout).mode).toBe('dry-run');
    expect(await db.collection('v2_ledger').countDocuments()).toBe(0);
    for (let i = 0; i < 2; i++)
      await run(process.execPath, ['scripts/migrate-legacy.js', '--apply'], options);
    expect(await db.collection('v2_ledger').countDocuments()).toBe(1);
    const row = await db.collection('v2_ledger').findOne();
    const user = await db.collection('v2_users').findOne();
    expect(row.amount).toBe(12345);
    expect(row.ownerId).toBe(user._id);
    expect(await bcrypt.compare('legacy-password', user.passwordHash)).toBe(true);
  } finally {
    await db.dropDatabase();
    await client.close();
  }
});

test('private backup restores exact fixture data into an isolated namespace', async () => {
  test.skip(
    Boolean(process.env.CI && !process.env.MONGODB_TOOLS),
    'Optional recovery drill requires MongoDB Database Tools',
  );
  const source = name('penny_test_backup_'),
    target = name('penny_test_restore_');
  const client = new mongoose.mongo.MongoClient(uriFor(source));
  await client.connect();
  const dir = await mkdtemp(join(tmpdir(), 'penny-recovery-'));
  let archive;
  try {
    await client
      .db(source)
      .collection('v2_ledger')
      .insertOne({ _id: 'fixture', ownerId: 'fixture-owner', amount: 12529, date: '2026-10-01' });
    const config = join(dir, 'source.yml'),
      restoreConfig = join(dir, 'restore.yml');
    await writeFile(config, 'uri: ' + JSON.stringify(uriFor(source)) + '\n', { mode: 0o600 });
    await writeFile(restoreConfig, 'uri: ' + JSON.stringify(uriFor('')) + '\n', { mode: 0o600 });
    const result = await run(process.execPath, ['scripts/backup.js'], {
      env: { ...process.env, MONGODB_CONFIG_PATH: config },
      timeout: 15000,
    });
    archive = result.stdout.trim().replace('Backup created: ', '');
    await run(
      'mongorestore',
      [
        '--config',
        restoreConfig,
        '--archive=' + archive,
        '--gzip',
        '--nsFrom=' + source + '.*',
        '--nsTo=' + target + '.*',
      ],
      { timeout: 15000 },
    );
    expect(
      (await client.db(target).collection('v2_ledger').findOne({ _id: 'fixture' })).amount,
    ).toBe(12529);
    expect(await client.db(target).collection('v2_ledger').countDocuments()).toBe(1);
  } finally {
    await client.db(source).dropDatabase();
    await client.db(target).dropDatabase();
    await client.close();
    await rm(dir, { recursive: true, force: true });
    if (archive) await rm(archive, { force: true });
  }
});
