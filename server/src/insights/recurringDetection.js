import { merchantKey } from './merchants.js';
export function detectRecurring(rows) {
  const groups = new Map();
  for (const t of rows.filter((t) => t.kind === 'expense')) {
    const key = merchantKey(t.description);
    const list = groups.get(key) || [];
    list.push(t);
    groups.set(key, list);
  }
  return [...groups]
    .flatMap(([name, group]) => {
      const sorted = group.sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length < 3) return [];
      const recent = sorted.slice(-3);
      const gaps = recent
        .slice(1)
        .map((t, i) => (new Date(t.date) - new Date(recent[i].date)) / 86400000);
      const amount = recent[2].amount;
      if (
        !gaps.every((g) => g >= 25 && g <= 35) ||
        !recent.every((t) => Math.abs(t.amount - amount) <= amount * 0.05)
      )
        return [];
      return [
        {
          type: 'recurring',
          title: 'A possible recurring payment',
          detail: `${name} appears monthly with a similar amount across three entries. Confirm before adding a plan.`,
          amount,
        },
      ];
    })
    .slice(0, 5);
}
