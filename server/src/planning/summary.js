import { sumMoney } from '../domain/money.js';
export function monthlySummary(rows, month) {
  const data = rows.filter((t) => t.date.startsWith(month));
  const income = sumMoney(data.filter((t) => t.kind === 'income').map((t) => t.amount));
  const expenses = sumMoney(data.filter((t) => t.kind === 'expense').map((t) => t.amount));
  return { month, income, expenses, balance: income - expenses, count: data.length };
}
