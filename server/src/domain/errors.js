export class AppError extends Error {
  constructor(status, code, message, details) { super(message); Object.assign(this, { status, code, details }); }
}
export function ensure(condition, status, code, message) { if (!condition) throw new AppError(status, code, message); }
export function notFound() { return new AppError(404, 'NOT_FOUND', 'This record is unavailable.'); }
