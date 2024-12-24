import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('overview and transaction dialog pass WCAG A and AA automated checks', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: 'Your money, at a glance.' })).toBeVisible();
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.getByRole('button', { name: 'Add transaction', exact: true }).click();
  result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }))).toEqual(
    [],
  );
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Add transaction', exact: true })).toBeFocused();
});

for (const [screen, heading] of [
  ['transactions', 'The everyday details.'],
  ['budgets', 'Give your money a little direction.'],
  ['recurring', 'A little less to remember.'],
  ['insights', 'A little perspective changes things.'],
  ['import', 'Bring your story with you.'],
  ['categories', 'Organized, your way.'],
  ['settings', 'A workspace that feels like you.'],
]) {
  test(screen + ' screen passes automated WCAG A and AA checks', async ({ page }) => {
    await page.goto('/?demo=1#' + screen);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
test('sign-in and registration forms pass automated WCAG A and AA checks', async ({ page }) => {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: { message: 'Sign in to continue.' } }),
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A familiar place to check in.' })).toBeVisible();
  for (let i = 0; i < 2; i++) {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
    if (!i) await page.getByRole('button', { name: 'Create an account', exact: true }).click();
  }
});
