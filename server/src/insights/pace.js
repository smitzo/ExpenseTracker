import { monthDays } from '../domain/dates.js';
export function paceAlerts(budgets, asOf) {
  return budgets
    .filter(
      (b) =>
        asOf.startsWith(b.month) &&
        Number(asOf.slice(8)) >= 7 &&
        b.spent / b.amount > Number(asOf.slice(8)) / monthDays(b.month) + 0.15,
    )
    .map((b) => ({
      type: 'pace',
      title: 'Your budget is moving quickly',
      detail: `${b.percent}% of this category budget is used. ${Math.round((Number(asOf.slice(8)) / monthDays(b.month)) * 100)}% of the month has elapsed.`,
      categoryId: b.categoryId,
    }));
}
