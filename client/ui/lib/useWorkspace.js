import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from './Session.jsx';
import { request } from './api.js';
import { monthDays } from '../../../server/src/domain/dates.js';
import { monthlySummary } from '../../../server/src/planning/summary.js';
import { dailySeries } from '../../../server/src/planning/daily.js';
import { categoryTotals } from '../../../server/src/planning/categoryTotals.js';
import { monthComparison } from '../../../server/src/planning/comparison.js';
import { spendingForecast } from '../../../server/src/planning/forecast.js';
import { savingsTarget } from '../../../server/src/planning/savings.js';
import { monthlyRecurring } from '../../../server/src/planning/projection.js';
import { savingsSuggestions } from '../../../server/src/insights/savingsSuggestions.js';
export function demoWorkspace(sample, month) {
  const rows = sample.transactions,
    summary = monthlySummary(rows, month),
    cats = categoryTotals(rows, sample.categories, month);
  const budgets = sample.budgets
    .filter((b) => b.month === month)
    .map((b) => {
      const spent = rows
        .filter(
          (t) => t.kind === 'expense' && t.categoryId === b.categoryId && t.date.startsWith(month),
        )
        .reduce((s, t) => s + t.amount, 0);
      return {
        ...b,
        spent,
        remaining: b.amount - spent,
        percent: Math.round((spent / b.amount) * 100),
        status: spent >= b.amount ? 'over' : spent >= b.amount * 0.8 ? 'near' : 'healthy',
      };
    });
  return {
    categories: sample.categories,
    transactions: [...rows].sort((a, b) => b.date.localeCompare(a.date)),
    recurring: sample.recurring,
    budgets,
    digest: {
      summary,
      categories: cats,
      daily: dailySeries(rows, month),
      comparison: monthComparison(rows, month),
      forecast: spendingForecast(rows, month, new Date().toISOString().slice(0, 10)),
      savings: savingsTarget(summary, sample.user.preferences.monthlyTarget),
      upcoming: monthlyRecurring(sample.recurring, month),
      insights: savingsSuggestions(cats, summary),
      budgets: {
        planned: budgets.reduce((s, b) => s + b.amount, 0),
        spent: budgets.reduce((s, b) => s + b.spent, 0),
        data: budgets,
      },
    },
  };
}
export function useWorkspace(month) {
  const { demo, sample, setSample } = useSession();
  const generation = useRef(0);
  const [data, setData] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState('');
  const reload = useCallback(async () => {
    const ticket = ++generation.current;
    setLoading(true);
    setError('');
    try {
      if (demo) {
        setData(demoWorkspace(sample, month));
        return;
      }
      const [digest, cats, tx, recurring, budgets] = await Promise.all([
        request('/digest?month=' + month),
        request('/categories'),
        request(
          '/transactions?' +
            new URLSearchParams({
              limit: '100',
              from: month + '-01',
              to: month + '-' + String(monthDays(month)).padStart(2, '0'),
            }),
        ),
        request('/recurring'),
        request('/budgets?month=' + month),
      ]);
      if (ticket !== generation.current) return;
      setData({
        digest,
        categories: cats.data,
        transactions: tx.data,
        recurring: recurring.data,
        budgets: budgets.data,
      });
    } catch (e) {
      if (ticket === generation.current) setError(e.message);
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, [month, demo, sample]);
  useEffect(() => {
    reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  async function mutate(resource, method, body, id) {
    if (demo) {
      setSample((prev) => {
        let list = [...prev[resource]];
        if (method === 'DELETE') list = list.filter((v) => v.id !== id);
        else if (id)
          list = list.map((v) =>
            v.id === id ? { ...v, ...body, version: (v.version || 1) + 1 } : v,
          );
        else if (resource === 'budgets') {
          list = list.filter((v) => !(v.month === body.month && v.categoryId === body.categoryId));
          list.push({ ...body, id: crypto.randomUUID() });
        } else list.push({ ...body, id: crypto.randomUUID(), version: 1 });
        return { ...prev, [resource]: list };
      });
      return;
    }
    await request('/' + resource + (id ? '/' + id : ''), { method, body });
    await reload();
  }
  return { data, loading, error, reload, mutate };
}
