import { categories } from '../db/categories.js';
import { categorySchema } from '../domain/categories.js';
import { idSchema, publicRecord } from '../domain/identifiers.js';
import { ensure, notFound } from '../domain/errors.js';
export async function checkCategory(req, categoryId) {
  if (categoryId && !(await categories(req.db).find(categoryId, req.user._id))) throw notFound();
}
export async function createCategory(req, res) {
  ensure(
    (await categories(req.db).list(req.user._id)).length < 100,
    422,
    'CATEGORY_LIMIT',
    'You can have up to 100 categories.',
  );
  res.status(201).json({
    data: publicRecord(
      await categories(req.db).create(req.user._id, categorySchema.parse(req.body)),
    ),
  });
}
export async function updateCategory(req, res) {
  const doc = await categories(req.db).update(
    idSchema.parse(req.params.id),
    req.user._id,
    categorySchema.parse(req.body),
  );
  if (!doc) throw notFound();
  res.json({ data: publicRecord(doc) });
}
export async function archiveCategory(req, res) {
  const doc = await categories(req.db).update(idSchema.parse(req.params.id), req.user._id, {
    archived: true,
  });
  if (!doc) throw notFound();
  res.status(204).end();
}
