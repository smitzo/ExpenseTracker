import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const script = resolve('scripts/audit-source.js');
test('source audit keeps engineering docs and rejects local handoff and validation reports', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'penny-source-audit-'));
  try {
    await mkdir(join(dir, 'docs'));
    await writeFile(join(dir, 'docs', 'architecture.md'), '# Engineering architecture');
    const safe = spawnSync(process.execPath, [script, '--stdin'], {
      cwd: dir,
      input: 'docs/architecture.md\0',
      encoding: 'utf8',
    });
    assert.equal(safe.status, 0, safe.stderr);
    for (const path of [
      'openspec/changes/task/tasks.md',
      'openspec/changes/task/.env.example',
      '.git-local/HEAD',
      'docs/verification.md',
      'VERCEL.md',
      'docs/images/demo-showcase-desktop.png',
    ]) {
      const rejected = spawnSync(process.execPath, [script, '--stdin'], {
        cwd: dir,
        input: path + '\0',
        encoding: 'utf8',
      });
      assert.notEqual(rejected.status, 0);
      assert.match(rejected.stderr, /Unexpected private/);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
