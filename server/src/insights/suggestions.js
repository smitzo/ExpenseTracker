import { merchantKey, merchantRules } from './merchants.js';
export function suggestCategory(description, rows, categories) {
  const key = merchantKey(description);
  if (!key) return null;
  const owned = new Set(categories.map((c) => c.id || c._id));
  const history = rows.filter((t) => merchantKey(t.description) === key && owned.has(t.categoryId));
  const counts = new Map();
  for (const t of history) counts.set(t.categoryId, (counts.get(t.categoryId) || 0) + 1);
  const best = [...counts].sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= 2 && best[1] / history.length >= 0.7)
    return {
      categoryId: best[0],
      confidence: 'history',
      reason: `Used for ${best[1]} matching entries. Review before saving.`,
    };
  const words = key.split(' ');
  const rule = merchantRules.find((r) => r.words.some((w) => words.includes(w)));
  const category = categories.find((c) => c.name === rule?.category);
  return category
    ? {
        categoryId: category.id || category._id,
        confidence: 'keyword',
        reason: 'Suggested from merchant keywords. Review before saving.',
      }
    : null;
}
