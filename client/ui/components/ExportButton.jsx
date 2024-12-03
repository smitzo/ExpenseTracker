import { useState } from 'react';
import { Download } from 'lucide-react';
import { useSession } from '../lib/Session.jsx';
function cell(value) {
  let s = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function ExportButton({ transactions, categories }) {
  const { demo } = useSession();
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    setError('');
    try {
      let blob;
      if (demo) {
        const names = new Map(categories.map((c) => [c.id, c.name]));
        const csv = [
          'date,description,amount,kind,category,note',
          ...transactions.map((t) =>
            [
              t.date,
              t.description,
              (t.amount / 100).toFixed(2),
              t.kind,
              names.get(t.categoryId) || '',
              t.note,
            ]
              .map(cell)
              .join(','),
          ),
        ].join('\r\n');
        blob = new Blob([csv], { type: 'text/csv' });
      } else {
        const response = await fetch('/api/transactions/export', { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Export failed. Please retry.');
        blob = await response.blob();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'penny-transactions.csv';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button className="button secondary" disabled={busy} onClick={download}>
        <Download size={14} />
        {busy ? 'Preparing…' : 'Export CSV'}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
