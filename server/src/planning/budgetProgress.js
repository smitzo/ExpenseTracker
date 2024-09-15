import { budgetProgress } from '../domain/budgets.js';
export function budgetOverview(budgets, rows) { const data = budgets.map(b => budgetProgress(b, rows)); return { planned: data.reduce((s, b) => s + b.amount, 0), spent: data.reduce((s, b) => s + b.spent, 0), over: data.filter(b => b.status === 'over').length, data }; }
