const fallback = new Map();
const storageKey = (owner) => 'penny:pending-import:' + owner;
export async function pendingImportKey(owner, csv) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(csv));
  const fingerprint = [...new Uint8Array(digest)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
  let existing = fallback.get(owner);
  try {
    existing = JSON.parse(sessionStorage.getItem(storageKey(owner))) || existing;
  } catch {
    /* Memory fallback for restricted browser storage. */
  }
  if (existing?.fingerprint === fingerprint) return existing.key;
  const entry = { fingerprint, key: crypto.randomUUID() };
  fallback.set(owner, entry);
  try {
    sessionStorage.setItem(storageKey(owner), JSON.stringify(entry));
  } catch {
    /* The in-memory key still survives navigation. */
  }
  return entry.key;
}
export function completeImportKey(owner, key) {
  if (fallback.get(owner)?.key === key) fallback.delete(owner);
  try {
    if (JSON.parse(sessionStorage.getItem(storageKey(owner)))?.key === key)
      sessionStorage.removeItem(storageKey(owner));
  } catch {
    /* No persisted CSV data is required. */
  }
}
