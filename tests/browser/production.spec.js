import { readdir, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { spawn } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { build, preview } from 'vite';
test('production bundle renders without third-party requests or console errors', async ({
  browser,
}) => {
  test.setTimeout(30000);
  await build({ configFile: 'client/vite.config.js', root: 'client', logLevel: 'error' });
  const server = await preview({
    configFile: 'client/vite.config.js',
    root: 'client',
    preview: { port: 4188, strictPort: true, host: '127.0.0.1' },
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const external = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1:4188') && !r.url().startsWith('data:'))
      external.push(r.url());
  });
  try {
    await page.goto('http://127.0.0.1:4188/?demo=1');
    await expect(page.getByRole('heading', { name: 'Your money, at a glance.' })).toBeVisible();
    await page.screenshot({ path: '.local/screenshots/overview-desktop.png', fullPage: true });
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  } finally {
    await page.close();
    server.httpServer.close();
  }
});

test('Node runtime serves built UI and health from the same origin', async () => {
  const server = spawn(process.execPath, ['server/src/start.js'], {
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '4187',
      APP_ORIGIN: 'http://127.0.0.1:4187',
      MONGODB_URI: 'mongodb://127.0.0.1:27128/penny_runtime',
      RATE_SECRET: 'runtime-test-secret-at-least-32-characters',
    },
    stdio: 'ignore',
  });
  try {
    let response;
    for (let i = 0; i < 30; i++) {
      try {
        response = await fetch('http://127.0.0.1:4187/');
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    expect(response?.status).toBe(200);
    expect(await response.text()).toContain('<div id="root"></div>');
    const health = await fetch('http://127.0.0.1:4187/api/health');
    expect((await health.json()).status).toBe('ok');
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
  }
});

test('release build keeps production dependencies when called from a test environment', async () => {
  await promisify(execFile)(process.execPath, ['client/build.js'], {
    env: { ...process.env, NODE_ENV: 'test' },
    timeout: 20000,
  });
  const files = await readdir('client/dist/assets');
  const entry = files.find((name) => /^index-.*\.js$/.test(name));
  expect(entry).toBeTruthy();
  const contents = await readFile('client/dist/assets/' + entry);
  expect(contents.length).toBeLessThan(500000);
});
