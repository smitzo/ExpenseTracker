import { z } from 'zod';
import { categories } from '../db/categories.js';
import { ledger } from '../db/ledger.js';
import { pageSchema, pageMeta } from '../domain/pagination.js';
import { daySchema } from '../domain/dates.js';
import { idSchema, publicRecord } from '../domain/identifiers.js';
const schema = pageSchema
  .extend({
    q: z.string().trim().max(100).optional(),
    kind: z.enum(['income', 'expense']).optional(),
    categoryId: idSchema.optional(),
    from: daySchema.optional(),
    to: daySchema.optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: 'End date must not precede start date.',
    path: ['to'],
  });
export async function listTransactions(req, res) {
  const q = schema.parse(req.query);
  const filter = {};
  if (q.kind) filter.kind = q.kind;
  if (q.categoryId) filter.categoryId = q.categoryId;
  if (q.from || q.to)
    filter.date = { ...(q.from ? { $gte: q.from } : {}), ...(q.to ? { $lte: q.to } : {}) };
  if (q.q) {
    const literal = q.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { description: { $regex: literal, $options: 'i' } },
      { note: { $regex: literal, $options: 'i' } },
    ];
  }
  const store = ledger(req.db);
  const total = await store.count(req.user._id, filter);
  const rows = await store.list(req.user._id, filter, (q.page - 1) * q.limit, q.limit);
  const names = new Map((await categories(req.db).history(req.user._id)).map((c) => [c._id, c]));
  res.json({
    data: rows.map((row) => ({
      ...publicRecord(row),
      categoryName: names.get(row.categoryId)?.name || 'Uncategorized',
      categoryColor: names.get(row.categoryId)?.color || 'slate',
    })),
    meta: pageMeta(q.page, q.limit, total),
  });
}
