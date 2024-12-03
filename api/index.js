import { createApp } from '../server/src/app.js';
import { loadConfig } from '../server/src/config.js';
import { database } from '../server/src/db/connection.js';
let app;
export default async function handler(req, res) {
  try {
    if (!app) {
      const config = loadConfig();
      app = createApp({ config, getDb: () => database(config.MONGODB_URI) });
    }
    return app(req, res);
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        error: {
          code: 'UNAVAILABLE',
          message: 'Service is not configured. Please try again later.',
        },
      }),
    );
  }
}
