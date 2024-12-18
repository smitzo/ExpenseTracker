import { ledger } from '../db/ledger.js';
import { categories } from '../db/categories.js';
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export async function exportTransactions(req, res) {
  const rows = await ledger(req.db).all(req.user._id);
  const names = new Map(
    (await categories(req.db).history(req.user._id)).map((c) => [c._id, c.name]),
  );
  const csv = [
    'date,description,amount,kind,category,note',
    ...rows.map((t) =>
      [
        t.date,
        t.description,
        (t.amount / 100).toFixed(2),
        t.kind,
        names.get(t.categoryId) || '',
        t.note,
      ]
        .map(csvCell)
        .join(','),
    ),
  ].join('\r\n');
  res
    .set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="penny-transactions.csv"',
      'X-Content-Type-Options': 'nosniff',
    })
    .send(csv);
}
