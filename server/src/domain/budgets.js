import { z } from 'zod';
import { moneySchema } from './money.js';
import { monthSchema } from './dates.js';
import { idSchema } from './identifiers.js';
export const budgetSchema = z.strictObject({ categoryId: idSchema, month: monthSchema, amount: moneySchema });
export function budgetProgress(budget, transactions) { const spent = transactions.filter(t => t.kind === 'expense' && t.categoryId === budget.categoryId && t.date.startsWith(budget.month)).reduce((s, t) => s + t.amount, 0); return { ...budget, spent, remaining: budget.amount - spent, percent: Math.round(spent / budget.amount * 100), status: spent >= budget.amount ? 'over' : spent >= budget.amount * 0.8 ? 'near' : 'healthy' }; }
