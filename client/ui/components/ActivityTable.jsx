import { ShoppingBag, Coffee, ArrowDownLeft, Pencil } from 'lucide-react';
import { useSession } from '../lib/Session.jsx';
import { money, dayLabel } from '../lib/format.js';
import { ActivityActions } from './ActivityActions.jsx';
export function ActivityTable({ transactions, categories, onEdit, onArchive }) {
  const { user } = useSession();
  const map = new Map(categories.map((c) => [c.id, c]));
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const c = map.get(t.categoryId) || {
              name: t.categoryName || 'Uncategorized',
              color: t.categoryColor || 'slate',
            };
            const Icon =
              t.kind === 'income'
                ? ArrowDownLeft
                : c?.name === 'Food & dining'
                  ? Coffee
                  : ShoppingBag;
            return (
              <tr key={t.id}>
                <td>
                  <div className={'merchant ' + (c?.color || 'slate')}>
                    <span className="merchant-icon">
                      <Icon size={15} />
                    </span>
                    <div>
                      {t.description}
                      {t.note && <small>{t.note.slice(0, 30)}</small>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={'pill ' + c?.color}>
                    <i className="dot" />
                    {c?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="muted">{dayLabel(t.date)}</td>
                <td className={'amount ' + (t.kind === 'income' ? 'positive' : '')}>
                  {t.kind === 'income' ? '+' : '−'}
                  {money(t.amount, user.preferences.currency)}
                </td>
                <td>
                  <ActivityActions transaction={t} onEdit={onEdit} onArchive={onArchive} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!transactions.length && (
        <div className="empty">
          <Pencil size={22} />
          <h3>A fresh page for your finances</h3>
          <p>Add a transaction to start seeing your story.</p>
        </div>
      )}
    </div>
  );
}
