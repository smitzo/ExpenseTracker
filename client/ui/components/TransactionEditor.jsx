import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { minorInput } from '../lib/format.js';
import { request } from '../lib/api.js';
import { useSession } from '../lib/Session.jsx';
import { suggestCategory } from '../../../server/src/insights/suggestions.js';
export function TransactionEditor({ transaction, categories, mutate, onClose }) {
  const { user, demo, sample } = useSession();
  const [kind, setKind] = useState(transaction?.kind || 'expense'),
    [categoryId, setCategory] = useState(transaction?.categoryId || ''),
    [suggestion, setSuggestion] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function suggest(description) {
    try {
      const result = demo
        ? suggestCategory(description, sample.transactions, categories)
        : (await request('/suggestion?description=' + encodeURIComponent(description))).data;
      setSuggestion(result);
    } catch {
      setSuggestion(null);
    }
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const f = new FormData(e.currentTarget);
      const body = {
        description: String(f.get('description')).trim(),
        amount: minorInput(f.get('amount')),
        date: String(f.get('date')),
        kind,
        categoryId: categoryId || null,
        note: String(f.get('note')).trim(),
      };
      if (transaction) body.version = transaction.version;
      await mutate('transactions', transaction ? 'PATCH' : 'POST', body, transaction?.id);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={transaction ? 'Edit transaction' : 'A new little entry'} onClose={onClose}>
      <form className="form" onSubmit={save}>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <label>
          Description
          <input
            name="description"
            defaultValue={transaction?.description}
            required
            maxLength={160}
            placeholder="Coffee, groceries, a good day…"
            onBlur={(e) => suggest(e.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            Amount ({user.preferences.currency})
            <input
              name="amount"
              defaultValue={transaction ? (transaction.amount / 100).toFixed(2) : ''}
              inputMode="decimal"
              required
              placeholder="0.00"
            />
          </label>
          <label>
            Type
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Date
            <input
              type="date"
              name="date"
              defaultValue={transaction?.date || new Date().toISOString().slice(0, 10)}
              min="2000-01-01"
              max="2100-12-31"
              required
            />
          </label>
          <label>
            Category
            <select value={categoryId} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {suggestion && (
          <div className="help-note">
            {suggestion.reason}{' '}
            <button
              type="button"
              className="text-button"
              onClick={() => setCategory(suggestion.categoryId)}
            >
              Use {categories.find((c) => c.id === suggestion.categoryId)?.name}
            </button>
          </div>
        )}
        <label>
          Note <span className="muted">Optional</span>
          <textarea
            name="note"
            defaultValue={transaction?.note}
            maxLength={1000}
            placeholder="Anything you’d like to remember"
          />
        </label>
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            {busy ? 'Saving…' : 'Save transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
