import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { database, disconnect } from './db/connection.js';
const config = loadConfig();
const app = createApp({ config, getDb: () => database(config.MONGODB_URI) });
app.use(
  (await import('express')).default.static(new URL('../../client/dist', import.meta.url).pathname),
);
const server = app.listen(config.PORT, '127.0.0.1', () =>
  console.info(`Penny API listening on ${config.PORT}`),
);
for (const signal of ['SIGTERM', 'SIGINT'])
  process.once(signal, () => {
    server.close(async () => {
      await disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
