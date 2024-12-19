import { test, expect } from '@playwright/test';
import { createServer } from 'vite';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../server/src/app.js';
import { database, disconnect } from '../../server/src/db/connection.js';
import { createIndexes } from '../../server/src/db/indexes.js';
let db, http, vite;
const origin = 'http://127.0.0.1:5181';
test.beforeAll(async () => {
  const uri = new URL(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27128/penny_test');
  uri.pathname = '/penny_test_browser_' + randomUUID().replaceAll('-', '');
  db = await database(uri.toString());
  await createIndexes(db);
  const app = createApp({
    config: {
      NODE_ENV: 'test',
      APP_ORIGIN: origin,
      RATE_SECRET: 'browser-test-secret-at-least-32-chars',
      SESSION_DAYS: 7,
    },
    getDb: async () => db,
  });
  http = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => http.once('listening', resolve));
  vite = await createServer({
    configFile: 'client/vite.config.js',
    root: 'client',
    server: {
      port: 5181,
      strictPort: true,
      host: '127.0.0.1',
      proxy: { '/api': 'http://127.0.0.1:' + http.address().port },
    },
  });
  await vite.listen();
});
test.afterAll(async () => {
  await vite?.close();
  await new Promise((resolve) => (http ? http.close(resolve) : resolve()));
  if (db) await db.dropDatabase();
  await disconnect();
});
async function register(page) {
  await page.goto(origin);
  await page.getByRole('button', { name: 'Create an account', exact: true }).click();
  await page.getByLabel('Your name').fill('Browser Account');
  await page.getByLabel('Email', { exact: true }).fill(randomUUID() + '@example.com');
  await page.getByLabel('Password', { exact: true }).fill('browser test correct horse battery');
  await page.getByRole('button', { name: 'Create your workspace', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your money, at a glance.' })).toBeVisible();
}
test('real registration persists transactions across reload and signs out', async ({ page }) => {
  await register(page);
  await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
  const d = page.getByRole('dialog');
  await d.getByLabel('Description', { exact: true }).fill('Persistent coffee');
  await d.getByLabel('Amount (INR)').fill('29.29');
  await page.getByRole('button', { name: 'Save transaction', exact: true }).click();
  await expect(d).not.toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: 'Persistent coffee', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A familiar place to check in.' })).toBeVisible();
});
test('CSV preview validates rows then imports to the real owned ledger', async ({ page }) => {
  await register(page);
  await page.getByRole('link', { name: 'Import data', exact: true }).click();
  const csv =
    'date,description,amount,kind,category,note\n2026-10-01,Imported lunch,12.29,expense,,Browser note';
  await page.getByLabel('Or paste CSV').fill(csv);
  await page.getByRole('button', { name: 'Preview entries' }).click();
  await expect(page.getByRole('cell', { name: 'Ready', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm import' }).click();
  await expect(page.getByRole('status').filter({ hasText: '1 entries imported' })).toBeVisible();
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await expect(
    page.getByRole('cell', { name: 'Imported lunch Browser note', exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  expect((await download).suggestedFilename()).toBe('penny-transactions.csv');
});

test('expired account sessions return the workspace to sign-in', async ({ page }) => {
  await register(page);
  await page.context().clearCookies();
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A familiar place to check in.' })).toBeVisible();
});

test('account controls download private records and delete after password review', async ({
  page,
}) => {
  await register(page);
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const waiting = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download account data', exact: true }).click();
  expect((await waiting).suggestedFilename()).toBe('penny-account.json');
  await page.getByRole('button', { name: 'Delete account', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByLabel('Confirm your password')
    .fill('browser test correct horse battery');
  await page.getByRole('button', { name: 'Delete my account', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A familiar place to check in.' })).toBeVisible();
});

test('overview loads historical month activity beyond the recent hundred entries', async ({
  page,
}) => {
  await register(page);
  const profile = await (await page.request.get(origin + '/api/auth/session')).json();
  const base = {
    ownerId: profile.user.id,
    kind: 'expense',
    categoryId: null,
    note: '',
    version: 1,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db
    .collection('v2_ledger')
    .insertMany([
      ...Array.from({ length: 105 }, (_, i) => ({
        ...base,
        _id: randomUUID(),
        date: '2026-10-01',
        description: 'Recent ' + i,
        amount: 100,
      })),
      {
        ...base,
        _id: randomUUID(),
        date: '2026-06-10',
        description: 'Historical lunch',
        amount: 12529,
      },
    ]);
  await page.getByLabel('Overview month').fill('2026-06');
  await expect(page.getByRole('cell', { name: 'Historical lunch', exact: true })).toBeVisible();
});
