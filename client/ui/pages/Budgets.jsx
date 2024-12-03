import { useState } from 'react';
import { Plus, Wallet, Trash2 } from 'lucide-react';
import { BudgetEditor } from '../components/BudgetEditor.jsx';
import { useSession } from '../lib/Session.jsx';
import { money, monthLabel } from '../lib/format.js';
export function Budgets({ data, month, setMonth, mutate }) {
  const { user } = useSession();
  const [edit, setEdit] = useState(null),
    [error, setError] = useState('');
  const total = data.budgets.reduce((s, b) => s + b.amount, 0),
    spent = data.budgets.reduce((s, b) => s + b.spent, 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Give your money a little direction.</h1>
          <p>Thoughtful limits. More room for the things you love.</p>
        </div>
        <button className="button" onClick={() => setEdit({})}>
          <Plus size={15} />
          Set a budget
        </button>
      </div>
      <div className="inline spread section-gap">
        <h2>{monthLabel(month)}</h2>
        <input
          type="month"
          className="filter-input"
          aria-label="Budget month"
          value={month}
          min="2000-01"
          max="2099-12"
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          style={{ width: 'auto' }}
        />
      </div>
      <div className="summary-grid section-gap">
        <section className="card stat">
          <div className="stat-label">
            Planned spending
            <Wallet size={16} />
          </div>
          <h2>{money(total, user.preferences.currency)}</h2>
        </section>
        <section className="card stat">
          <div className="stat-label">Spent in budgeted categories</div>
          <h2>{money(spent, user.preferences.currency)}</h2>
        </section>
        <section className="card stat featured">
          <div className="stat-label">Room remaining</div>
          <h2>{money(total - spent, user.preferences.currency)}</h2>
        </section>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid-3">
        {data.budgets.map((b) => {
          const c = data.categories.find((c) => c.id === b.categoryId);
          return (
            <section className={'card ' + (c?.color || 'slate')} key={b.id}>
              <div className="card-heading">
                <h2 className="inline">
                  <i className="dot" />
                  {c?.name || 'Archived category'}
                </h2>
                <button
                  className="icon-button"
                  aria-label={'Remove ' + (c?.name || 'category') + ' budget'}
                  onClick={async () => {
                    try {
                      await mutate('budgets', 'DELETE', undefined, b.id);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="inline spread">
                <strong>{money(b.spent, user.preferences.currency)}</strong>
                <small className="muted">of {money(b.amount, user.preferences.currency)}</small>
              </div>
              <div className="progress section-gap">
                <span style={{ width: Math.min(100, b.percent) + '%' }} />
              </div>
              <div className="inline spread section-gap">
                <span className={'help-note ' + (b.status === 'over' ? 'negative' : '')}>
                  {b.percent}% used{b.status === 'over' ? ' · Over budget' : ''}
                </span>
                <button className="text-button" onClick={() => setEdit(b)}>
                  Adjust
                </button>
              </div>
            </section>
          );
        })}
      </div>
      {!data.budgets.length && (
        <section className="card empty section-gap">
          <Wallet size={26} />
          <h3>A plan that fits your life</h3>
          <p>Set your first category budget for this month.</p>
        </section>
      )}
      {edit && (
        <BudgetEditor
          budget={edit}
          month={month}
          categories={data.categories}
          mutate={mutate}
          onClose={() => setEdit(null)}
        />
      )}
    </>
  );
}
