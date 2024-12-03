import { spawn } from 'node:child_process';
import { mkdir, chmod, stat } from 'node:fs/promises';
const config = process.env.MONGODB_CONFIG_PATH;
if (!config) throw new Error('Set MONGODB_CONFIG_PATH to a private mongodump YAML config with uri');
const info = await stat(config);
if (info.mode & 0o077) throw new Error('Database config must be readable only by its owner');
await mkdir('.local/backups', { recursive: true, mode: 0o700 });
const path =
  '.local/backups/penny-' + new Date().toISOString().replaceAll(':', '-') + '.archive.gz';
const child = spawn('mongodump', ['--config', config, '--archive=' + path, '--gzip'], {
  stdio: ['ignore', 'ignore', 'ignore'],
});
const status = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('exit', resolve);
});
if (status !== 0)
  throw new Error('Backup failed; check database access using private operational tools');
await chmod(path, 0o600);
console.info('Backup created: ' + path);
