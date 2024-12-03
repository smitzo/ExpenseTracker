import { monthDays } from '../domain/dates.js';
export function dailySeries(rows, month) {
  const totals = new Map();
  for (const t of rows.filter((t) => t.date.startsWith(month) && t.kind === 'expense'))
    totals.set(t.date, (totals.get(t.date) || 0) + t.amount);
  let cumulative = 0;
  return Array.from({ length: monthDays(month) }, (_, i) => {
    const date = month + '-' + String(i + 1).padStart(2, '0');
    const amount = totals.get(date) || 0;
    cumulative += amount;
    return { date, amount, cumulative };
  });
}
