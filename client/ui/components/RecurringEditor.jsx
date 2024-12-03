import { useState } from 'react';
import { Modal } from './Modal.jsx';
import { minorInput } from '../lib/format.js';
export function RecurringEditor({ rule, categories, mutate, onClose }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      await mutate(
        'recurring',
        rule.id ? 'PUT' : 'POST',
        {
          name: String(f.get('name')).trim(),
          amount: minorInput(f.get('amount')),
          frequency: String(f.get('frequency')),
          nextDate: String(f.get('nextDate')),
          categoryId: String(f.get('categoryId')) || null,
          active: f.get('active') === 'on',
        },
        rule.id,
      );
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={rule.id ? 'Edit recurring plan' : 'A regular little plan'} onClose={onClose}>
      <form className="form" onSubmit={save}>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <label>
          Name
          <input name="name" defaultValue={rule.name} required maxLength={100} />
        </label>
        <div className="form-row">
          <label>
            Amount
            <input
              name="amount"
              inputMode="decimal"
              defaultValue={rule.amount ? rule.amount / 100 : ''}
              required
            />
          </label>
          <label>
            Frequency
            <select name="frequency" defaultValue={rule.frequency || 'monthly'}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
        </div>
        <label>
          Next payment
          <input
            type="date"
            name="nextDate"
            defaultValue={rule.nextDate || new Date().toISOString().slice(0, 10)}
            min="2000-01-01"
            max="2100-12-31"
            required
          />
        </label>
        <label>
          Category
          <select name="categoryId" defaultValue={rule.categoryId || ''}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="inline">
          <input
            type="checkbox"
            name="active"
            defaultChecked={rule.active !== false}
            style={{ width: 'auto' }}
          />
          Active plan
        </label>
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy}>
            Save plan
          </button>
        </div>
      </form>
    </Modal>
  );
}
