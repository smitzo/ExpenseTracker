import { ledger } from '../db/ledger.js';
import { duplicateGroups } from './duplicates.js';
export async function getDuplicates(req, res) {
  res.json({
    data: duplicateGroups(await ledger(req.db).all(req.user._id)),
    explanation:
      'Same date, amount, type and description. Review before archiving; records are never removed automatically.',
  });
}
export function searchText(transaction) {
  return [transaction.description, transaction.note].filter(Boolean).join(' ').toLowerCase();
}
