import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { minorInput } from '../lib/format.js';
export function BudgetEditor({ budget, month, categories, mutate, onClose }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      await mutate('budgets', 'PUT', {
        categoryId: String(f.get('categoryId')),
        month,
        amount: minorInput(f.get('amount')),
      });
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="A little spending plan" onClose={onClose}>
      <form className="form" onSubmit={save}>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <label>
          Category
          <select name="categoryId" defaultValue={budget.categoryId || categories[0]?.id} required>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Monthly limit
          <input
            name="amount"
            inputMode="decimal"
            required
            defaultValue={budget.amount ? budget.amount / 100 : ''}
            placeholder="0.00"
          />
        </label>
        <p className="help-note">
          This updates the category’s budget for {month}. Existing transactions stay as recorded.
        </p>
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            Save budget
          </button>
        </div>
      </form>
    </Modal>
  );
}
