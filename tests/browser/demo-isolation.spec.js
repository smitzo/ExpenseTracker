import { test, expect } from '@playwright/test';
test('demo changes stay in memory and never reach private API endpoints', async ({ page }) => {
  const api = [];
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/')) api.push(r.url());
  });
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByLabel('Description', { exact: true })
    .fill('Disposable demo entry');
  await page.getByRole('dialog').getByLabel('Amount (INR)').fill('11');
  await page.getByRole('button', { name: 'Save transaction', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search transactions' }).fill('Disposable demo entry');
  await expect(
    page.getByRole('cell', { name: 'Disposable demo entry', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('textbox', { name: 'Search transactions' }).fill('Disposable demo entry');
  await expect(page.getByRole('cell', { name: 'Disposable demo entry', exact: true })).toHaveCount(
    0,
  );
  expect(api).toEqual([]);
});
