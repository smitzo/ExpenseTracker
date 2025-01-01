import { fileURLToPath } from 'node:url';
// A release build must not inherit test/development React from a caller's environment.
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build({
  root: fileURLToPath(new URL('.', import.meta.url)),
  configFile: fileURLToPath(new URL('vite.config.js', import.meta.url)),
  mode: 'production',
});
