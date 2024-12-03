import { z } from 'zod';
import { parseCsv } from './csvParser.js';
import { transactionSchema } from '../domain/ledger.js';
import { toMinor } from '../domain/money.js';
import { categories } from '../db/categories.js';
import { ensure } from '../domain/errors.js';
export const csvRequest = z.strictObject({ csv: z.string().min(1).max(250000) });
export async function previewRows(req, csv) {
  const [headers, ...rows] = parseCsv(csv);
  ensure(
    headers &&
      ['date', 'description', 'amount', 'kind', 'category', 'note'].join(',') ===
        headers.map((h) => h.trim().toLowerCase()).join(','),
    400,
    'CSV_HEADERS',
    'Use columns: date,description,amount,kind,category,note',
  );
  const cats = await categories(req.db).list(req.user._id);
  const names = new Map(cats.map((c) => [c.name.toLowerCase(), c._id]));
  return rows.map((values, index) => {
    try {
      ensure(values.length === 6, 400, 'CSV_COLUMNS', 'Expected six columns.');
      const [date, description, amount, kind, category, note] = values;
      const categoryId = category ? names.get(category.trim().toLowerCase()) : null;
      ensure(!category || categoryId, 400, 'CSV_CATEGORY', 'Unknown category: ' + category);
      return {
        row: index + 2,
        data: transactionSchema.parse({
          date,
          description,
          amount: toMinor(amount),
          kind,
          categoryId,
          note,
        }),
      };
    } catch (e) {
      return { row: index + 2, error: e.issues?.[0]?.message || e.message };
    }
  });
}
export async function previewImport(req, res) {
  res.json({ data: await previewRows(req, csvRequest.parse(req.body).csv) });
}
