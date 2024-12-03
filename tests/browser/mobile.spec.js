import { test, expect } from '@playwright/test';
test('mobile navigation reaches every tool without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: 'Your money, at a glance.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open workspace tools' }).click();
  await page
    .getByRole('navigation', { name: 'Mobile tools' })
    .getByRole('link', { name: 'Settings' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'A workspace that feels like you.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The everyday details.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await page.screenshot({ path: '.local/screenshots/overview-mobile.png', fullPage: true });
});
