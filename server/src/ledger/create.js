import { ledger } from '../db/ledger.js';
import { transactionSchema } from '../domain/ledger.js';
import { publicRecord } from '../domain/identifiers.js';
import { checkCategory } from '../accounts/writeCategories.js';
export async function createTransaction(req, res) { const body = transactionSchema.parse(req.body); await checkCategory(req, body.categoryId); const doc = await ledger(req.db).create(req.user._id, body); res.status(201).json({ data: publicRecord(doc) }); }
