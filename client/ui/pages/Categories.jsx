import { useState } from 'react';
import { Plus, Shapes, Pencil } from 'lucide-react';
import { Modal } from '../components/Modal.jsx';
export function Categories({ data, mutate }) {
  const [edit, setEdit] = useState(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const f = new FormData(e.currentTarget);
      await mutate(
        'categories',
        edit.id ? 'PATCH' : 'POST',
        { name: String(f.get('name')).trim(), color: String(f.get('color')) },
        edit.id,
      );
      setEdit(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Organized, your way.</h1>
          <p>Give your everyday spending a place that feels right.</p>
        </div>
        <button className="button" onClick={() => setEdit({})}>
          <Plus size={15} />
          New category
        </button>
      </div>
      <section className="card">
        <div className="card-heading">
          <h2>Your categories</h2>
          <Shapes size={18} />
        </div>
        {data.categories.map((c) => (
          <div className="list-row" key={c.id}>
            <span className={'inline ' + c.color}>
              <i className="dot" />
              {c.name}
            </span>
            <button
              className="icon-button"
              aria-label={'Edit category ' + c.name}
              onClick={() => setEdit(c)}
            >
              <Pencil size={15} />
            </button>
          </div>
        ))}
      </section>
      {edit && (
        <Modal title="Make it your own" onClose={() => setEdit(null)}>
          <form className="form" onSubmit={save}>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <label>
              Name
              <input name="name" defaultValue={edit.name} required maxLength={40} />
            </label>
            <label>
              Color
              <select name="color" defaultValue={edit.color || 'green'}>
                {['green', 'amber', 'blue', 'rose', 'violet', 'slate'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button className="button secondary" type="button" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button className="button" disabled={busy}>
                Save category
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
