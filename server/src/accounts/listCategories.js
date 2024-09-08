import { categories } from '../db/categories.js';
import { publicRecord } from '../domain/identifiers.js';
export async function listCategories(req, res) { res.json({ data: (await categories(req.db).list(req.user._id)).map(publicRecord) }); }
