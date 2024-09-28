import { ledger } from '../db/ledger.js';
import { categories } from '../db/categories.js';
import { budgets } from '../db/budgets.js';
import { recurring } from '../db/recurring.js';
import { monthSchema, today } from '../domain/dates.js';
import { publicRecord } from '../domain/identifiers.js';
import { monthlySummary } from '../planning/summary.js';
import { dailySeries } from '../planning/daily.js';
import { categoryTotals } from '../planning/categoryTotals.js';
import { monthComparison } from '../planning/comparison.js';
import { spendingForecast } from '../planning/forecast.js';
import { budgetOverview } from '../planning/budgetProgress.js';
import { savingsTarget } from '../planning/savings.js';
import { monthlyRecurring } from '../planning/projection.js';
import { unusualExpenses } from './unusual.js';
import { paceAlerts } from './pace.js';
import { detectRecurring } from './recurringDetection.js';
import { savingsSuggestions } from './savingsSuggestions.js';
import { suggestCategory } from './suggestions.js';
export async function digest(req, res) { const month = monthSchema.parse(req.query.month); const owner = req.user._id; const rows = await ledger(req.db).all(owner), cats = await categories(req.db).list(owner), plans = await budgets(req.db).list(owner, month), rules = await recurring(req.db).list(owner); const summary = monthlySummary(rows, month), totals = categoryTotals(rows, cats, month), budget = budgetOverview(plans.map(publicRecord), rows); res.json({ summary, daily: dailySeries(rows, month), categories: totals, comparison: monthComparison(rows, month), forecast: spendingForecast(rows, month, today()), budgets: budget, savings: savingsTarget(summary, req.user.preferences.monthlyTarget), upcoming: monthlyRecurring(rules, month), insights: [...unusualExpenses(rows, month), ...paceAlerts(budget.data, today()), ...detectRecurring(rows), ...savingsSuggestions(totals, summary)] }); }
export async function suggestion(req, res) { const description = String(req.query.description || '').slice(0, 160); res.json({ data: suggestCategory(description, await ledger(req.db).all(req.user._id), await categories(req.db).list(req.user._id)) }); }
