import { pendingImportKey, completeImportKey } from '../lib/importKeys.js';
import { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { request } from '../lib/api.js';
import { useSession } from '../lib/Session.jsx';
export function Import({ reload }) {
  const { demo, user } = useSession();
  const [csv, setCsv] = useState(''),
    [preview, setPreview] = useState(null),
    [key, setKey] = useState(() => crypto.randomUUID()),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  function update(value) {
    setCsv(value);
    setPreview(null);
    setKey(crypto.randomUUID());
    setMessage('');
  }
  async function file(e) {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 250000) {
      setError('Choose a CSV file under 250 KB.');
      return;
    }
    update(await f.text());
  }
  async function check() {
    setBusy(true);
    setError('');
    try {
      const retryKey = await pendingImportKey(user.id, csv);
      const result = await request('/imports/preview', { method: 'POST', body: { csv } });
      setKey(retryKey);
      setPreview(result.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function commit() {
    setBusy(true);
    setError('');
    try {
      const r = await request('/imports/commit', { method: 'POST', body: { csv, key } });
      completeImportKey(user.id, key);
      setMessage(`${r.imported} entries imported${r.replay ? ' (already completed)' : ''}.`);
      setPreview(null);
      setCsv('');
      await reload();
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
          <h1>Bring your story with you.</h1>
          <p>A careful preview before any entries join your workspace.</p>
        </div>
        <Upload size={24} />
      </div>
      <div className="grid-2">
        <section className="card">
          <h2>Import a CSV</h2>
          {demo && (
            <p className="error">
              Create an account to import private transaction data. This demo uses sample records.
            </p>
          )}
          <p className="section-intro">
            Use up to 500 rows with the columns below. Amounts are in major currency units, such as
            125.50. Category names must match your workspace.
          </p>
          <code className="csv-example">
            date,description,amount,kind,category,note
            <br />
            2026-10-01,Coffee,125.50,expense,Food & dining,Morning
          </code>
          <div className="form section-gap">
            <label>
              Choose CSV file
              <input type="file" accept=".csv,text/csv" disabled={demo || busy} onChange={file} />
            </label>
            <label>
              Or paste CSV
              <textarea
                rows={8}
                value={csv}
                disabled={demo || busy}
                onChange={(e) => update(e.target.value)}
                placeholder="date,description,amount,kind,category,note"
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="positive" role="status">
                <Check size={15} />
                {message}
              </p>
            )}
            <button className="button" disabled={demo || busy || !csv} onClick={check}>
              <FileText size={15} />
              {busy ? 'Checking…' : 'Preview entries'}
            </button>
          </div>
        </section>
        <section className="card">
          <h2>What happens next?</h2>
          <div className="insight">
            <span className="insight-icon">1</span>
            <div>
              <h3>Check every row</h3>
              <p>
                We validate dates, amounts, types and category names. Nothing is written during
                preview.
              </p>
            </div>
          </div>
          <div className="insight">
            <span className="insight-icon">2</span>
            <div>
              <h3>Review the details</h3>
              <p>Fix any highlighted errors. Every row must be valid before importing.</p>
            </div>
          </div>
          <div className="insight">
            <span className="insight-icon">3</span>
            <div>
              <h3>Import with confidence</h3>
              <p>
                Retrying a completed batch with the same key doesn’t create duplicate entries.
                Separately uploaded files are separate imports.
              </p>
            </div>
          </div>
        </section>
      </div>
      {preview && (
        <section className="card section-gap">
          <div className="card-heading">
            <h2>Preview · {preview.length} rows</h2>
            <button
              className="button"
              disabled={busy || !preview.length || preview.some((r) => r.error)}
              onClick={commit}
            >
              Confirm import
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r) => (
                  <tr key={r.row}>
                    <td>{r.row}</td>
                    <td>{r.data?.description || '—'}</td>
                    <td className={r.error ? 'negative' : 'positive'}>{r.error || 'Ready'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
