import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { database, disconnect } from '../server/src/db/connection.js';
import { createIndexes } from '../server/src/db/indexes.js';
const children = [];
const launch = (command, args, env = process.env) => {
  const child = spawn(command, args, { stdio: 'inherit', env });
  children.push(child);
  return child;
};
async function stop() {
  for (const child of children) child.kill('SIGTERM');
  await disconnect();
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, () => {
    stop().then(() => process.exit());
  });
const local = process.argv.includes('--database');
if (local) {
  if (process.env.NODE_ENV === 'production') throw new Error('Local database is development-only');
  await mkdir('.local/mongo', { recursive: true });
  launch('mongod', [
    '--dbpath',
    '.local/mongo',
    '--bind_ip',
    '127.0.0.1',
    '--port',
    '27128',
    '--nounixsocket',
    '--logpath',
    '.local/mongo.log',
  ]);
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:27128/penny_dev';
  process.env.RATE_SECRET ||= 'local-development-secret-please-never-deploy';
  process.env.APP_ORIGIN ||= 'http://127.0.0.1:5173';
  let db;
  for (let i = 0; i < 5; i++) {
    try {
      db = await database(process.env.MONGODB_URI);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  if (!db) {
    await stop();
    throw new Error('Local MongoDB did not start');
  }
  await createIndexes(db);
  await disconnect();
}
launch('node', ['--env-file-if-exists=.env', 'server/src/start.js']);
if (!process.argv.includes('--api-only')) launch('npm', ['run', 'dev', '-w', 'client']);
for (const child of children)
  child.once('exit', (code) => {
    if (code && code !== 0) stop().then(() => process.exit(code));
  });
