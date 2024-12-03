export function categoryTotals(rows, cats, month) {
  const totals = new Map();
  for (const t of rows.filter((t) => t.kind === 'expense' && t.date.startsWith(month))) {
    const key = t.categoryId || 'other';
    totals.set(key, (totals.get(key) || 0) + t.amount);
  }
  const names = new Map(cats.map((c) => [c.id || c._id, c]));
  return [...totals]
    .map(([id, amount]) => ({
      id,
      amount,
      name: names.get(id)?.name || 'Uncategorized',
      color: names.get(id)?.color || 'slate',
    }))
    .sort((a, b) => b.amount - a.amount);
}
