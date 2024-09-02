import { randomUUID } from 'node:crypto';
export function requestLog(req, res, next) {
  req.requestId = randomUUID(); res.set('X-Request-Id', req.requestId);
  const start = performance.now();
  res.on('finish', () => { if (process.env.NODE_ENV !== 'test') console.info(JSON.stringify({ requestId: req.requestId, method: req.method, status: res.statusCode, durationMs: Math.round(performance.now() - start) })); });
  next();
}
