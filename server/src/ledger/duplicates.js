export function duplicateGroups(rows) {
  const groups = new Map();
  for (const t of rows) {
    const key = [t.date, t.kind, t.amount, t.description.trim().toLowerCase()].join('|');
    const list = groups.get(key) || [];
    list.push(t.id || t._id);
    groups.set(key, list);
  }
  return [...groups.values()].filter((v) => v.length > 1);
}
