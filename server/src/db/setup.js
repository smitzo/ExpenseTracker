import { loadConfig } from '../config.js';
import { database, disconnect } from './connection.js';
import { createIndexes } from './indexes.js';
const config = loadConfig();
try { await createIndexes(await database(config.MONGODB_URI)); console.info('Indexes ready.'); } finally { await disconnect(); }
