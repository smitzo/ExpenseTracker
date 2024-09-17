import { monthlySummary } from './summary.js';
import { shiftMonth } from '../domain/dates.js';
export function monthComparison(rows, month) { const current = monthlySummary(rows, month), previous = monthlySummary(rows, shiftMonth(month, -1)); return { current, previous, expenseChange: current.expenses - previous.expenses, percentChange: previous.expenses ? Math.round((current.expenses - previous.expenses) / previous.expenses * 100) : null, explanation: 'Compares full recorded calendar months; incomplete months may not be comparable.' }; }
