export const money = (minor, currency = 'INR', compact = false) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact ? 'compact' : 'standard',
  }).format((minor || 0) / 100);
export const dayLabel = (date) =>
  new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
    new Date(date + 'T00:00:00Z'),
  );
export const monthLabel = (month) =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(month + '-01T00:00:00Z'),
  );
export const currentMonth = () => new Date().toISOString().slice(0, 7);
export function minorInput(value) {
  const s = String(value);
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(s))
    throw new Error('Use an amount with at most two decimal places.');
  const [a, b = ''] = s.split('.');
  const n = Number(a) * 100 + Number(b.padEnd(2, '0'));
  if (n <= 0) throw new Error('Amount must be greater than zero.');
  return n;
}
