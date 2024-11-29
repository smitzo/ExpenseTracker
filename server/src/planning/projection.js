import { nextDue, monthOf } from '../domain/dates.js';
export function projectRecurring(rules, from, through) {
  const result = [];
  for (const rule of rules.filter(r => r.active)) { let date = rule.nextDate; let iterations = 0; while (date <= through && iterations++ < 6000) { if (date >= from) result.push({ ruleId: rule.id || rule._id, name: rule.name, amount: rule.amount, date }); const next = nextDue(date, rule.frequency, Number(rule.nextDate.slice(8))); if (next <= date) break; date = next; } }
  return result.sort((a, b) => a.date.localeCompare(b.date));
}
export const monthlyRecurring = (rules, month) => projectRecurring(rules, month + '-01', month + '-31').filter(r => monthOf(r.date) === month);
