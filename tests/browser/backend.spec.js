import { test, expect } from '@playwright/test';
import { execFile } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { promisify } from 'node:util';
const run = promisify(execFile);
test('MongoDB-backed security ledger ownership and import acceptance', async () => {
  test.setTimeout(60000);
  const { stdout } = await run(
    process.execPath,
    [
      '--test',
      '--test-concurrency=1',
      ...(await readdir('tests'))
        .filter((name) => name.endsWith('.test.js'))
        .sort()
        .map((name) => 'tests/' + name),
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: 'test',
        TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27128/penny_test',
      },
      timeout: 55000,
    },
  );
  console.log(stdout);
  expect(stdout).toMatch(/fail 0/);
  expect(stdout).toMatch(/skipped 0/);
});
