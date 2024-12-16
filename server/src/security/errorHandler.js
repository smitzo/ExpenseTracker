import { ZodError } from 'zod';
export function errorHandler(error, req, res, _next) {
  let status = error.status || 500;
  let code = error.code || 'INTERNAL';
  let message = status < 500 ? error.message : 'Something went wrong. Please try again.';
  let details;
  if (error instanceof ZodError) {
    status = 400;
    code = 'VALIDATION';
    message = 'Check the highlighted fields.';
    details = error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  }
  if (error.code === 11000) {
    status = 409;
    code = 'CONFLICT';
    message = 'This record already exists.';
  }
  if (error.type === 'entity.too.large') {
    status = 413;
    code = 'BODY_LIMIT';
    message = 'The request is too large.';
  }
  if (error.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'The request is not valid JSON.';
  }
  if (
    [
      'MongoNetworkError',
      'MongoNetworkTimeoutError',
      'MongoServerSelectionError',
      'MongooseServerSelectionError',
    ].includes(error.name)
  ) {
    status = 503;
    code = 'UNAVAILABLE';
    message = 'The database is temporarily unavailable. Please retry shortly.';
    res.set('Retry-After', '5');
  }
  if (status >= 500 && process.env.NODE_ENV !== 'test')
    console.error(
      JSON.stringify({ requestId: req.requestId, errorType: error.name, code: 'INTERNAL' }),
    );
  if (status === 429) res.set('Retry-After', String(error.retryAfter || 900));
  res.status(status).json({ error: { code, message, details, requestId: req.requestId } });
}
