import { recurring } from '../db/recurring.js';
import { recurringSchema } from '../domain/recurring.js';
import { idSchema, publicRecord } from '../domain/identifiers.js';
import { checkCategory } from '../accounts/writeCategories.js';
import { ensure, notFound } from '../domain/errors.js';
export async function listRecurring(req, res) {
  res.json({ data: (await recurring(req.db).list(req.user._id)).map(publicRecord) });
}
export async function createRecurring(req, res) {
  ensure(
    (await recurring(req.db).list(req.user._id)).length < 100,
    422,
    'RULE_LIMIT',
    'You can have up to 100 recurring plans.',
  );
  const body = recurringSchema.parse(req.body);
  await checkCategory(req, body.categoryId);
  res.status(201).json({ data: publicRecord(await recurring(req.db).create(req.user._id, body)) });
}
export async function updateRecurring(req, res) {
  const body = recurringSchema.parse(req.body);
  await checkCategory(req, body.categoryId);
  const doc = await recurring(req.db).update(idSchema.parse(req.params.id), req.user._id, body);
  if (!doc) throw notFound();
  res.json({ data: publicRecord(doc) });
}
export async function removeRecurring(req, res) {
  const r = await recurring(req.db).remove(idSchema.parse(req.params.id), req.user._id);
  ensure(r.deletedCount, 404, 'NOT_FOUND', 'Plan is unavailable.');
  res.status(204).end();
}
