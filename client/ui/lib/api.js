let csrf = '';
export const setCsrf = (value) => {
  csrf = value || '';
};
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api' + path, {
      credentials: 'same-origin',
      ...options,
      signal: options.signal
        ? AbortSignal.any([controller.signal, options.signal])
        : controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, ...options.headers },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    if (response.status === 204) return null;
    const payload = await response.json().catch(() => null);
    if (response.status === 401 && !['/auth/login', '/auth/register'].includes(path))
      dispatchEvent(new Event('penny:session-expired'));
    if (!response.ok)
      throw new ApiError(
        payload?.error?.message || 'The service is unavailable. Please try again.',
        response.status,
        payload?.error?.details,
      );
    return payload;
  } catch (error) {
    if (options.signal?.aborted) throw error;
    if (error.name === 'AbortError')
      throw new ApiError('The request timed out. Check your connection and retry.', 0);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
