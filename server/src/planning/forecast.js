import { monthDays } from '../domain/dates.js';
export function spendingForecast(rows, month, asOf) {
  const history = rows.filter(
    (t) => t.kind === 'expense' && t.date.startsWith(month) && t.date <= asOf,
  );
  const days = Math.min(Number(asOf.slice(8)), monthDays(month));
  if (!asOf.startsWith(month) || days < 7 || history.length < 5)
    return {
      projected: null,
      explanation:
        'Record at least five expenses across the first seven days of the current month.',
    };
  const spent = history.reduce((s, t) => s + t.amount, 0);
  return {
    projected: Math.round((spent / days) * monthDays(month)),
    daysObserved: days,
    explanation:
      'Recorded month-to-date expenses divided by elapsed days, extended to the full month. An estimate, not a prediction.',
  };
}
