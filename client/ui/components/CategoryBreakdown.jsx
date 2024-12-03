import { useSession } from '../lib/Session.jsx';
import { money } from '../lib/format.js';
export function CategoryBreakdown({ categories }) {
  const { user } = useSession();
  const total = categories.reduce((s, c) => s + c.amount, 0);
  return (
    <section className="card">
      <div className="card-heading">
        <div>
          <h2>Where it’s going</h2>
          <div className="chart-subtitle">A closer look at your spending</div>
        </div>
        <span className="muted">···</span>
      </div>
      {categories.slice(0, 6).map((c) => (
        <div className={'category-row ' + c.color} key={c.id}>
          <div>
            <i className="dot" />
            {c.name}
          </div>
          <span className="amount">{money(c.amount, user.preferences.currency)}</span>
          <div
            className="progress"
            role="meter"
            aria-label={c.name + ' share of spending'}
            aria-valuenow={Math.round((c.amount / total) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: (c.amount / total) * 100 + '%' }} />
          </div>
        </div>
      ))}
      {!categories.length && (
        <p className="help-note">Your spending categories will appear after your first expense.</p>
      )}
      <p className="help-note" style={{ marginTop: 22, marginBottom: 0 }}>
        Every entry is a little piece of the picture.
      </p>
    </section>
  );
}
