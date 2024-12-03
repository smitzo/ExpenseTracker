import { budgets } from '../db/budgets.js';
import { ledger } from '../db/ledger.js';
import { budgetSchema, budgetProgress } from '../domain/budgets.js';
import { monthSchema } from '../domain/dates.js';
import { idSchema, publicRecord } from '../domain/identifiers.js';
import { checkCategory } from '../accounts/writeCategories.js';
import { ensure } from '../domain/errors.js';
export async function listBudgets(req, res) {
  const month = monthSchema.parse(req.query.month);
  const rows = await ledger(req.db).all(req.user._id);
  res.json({
    data: (await budgets(req.db).list(req.user._id, month)).map((b) =>
      budgetProgress(publicRecord(b), rows),
    ),
  });
}
export async function saveBudget(req, res) {
  const body = budgetSchema.parse(req.body);
  await checkCategory(req, body.categoryId);
  res.json({ data: publicRecord(await budgets(req.db).save(req.user._id, body)) });
}
export async function removeBudget(req, res) {
  const r = await budgets(req.db).remove(idSchema.parse(req.params.id), req.user._id);
  ensure(r.deletedCount, 404, 'NOT_FOUND', 'Budget is unavailable.');
  res.status(204).end();
}
