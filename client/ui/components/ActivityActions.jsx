import { Pencil, Archive } from 'lucide-react';
export function ActivityActions({ transaction, onEdit, onArchive }) {
  return (
    <div className="inline" style={{ gap: 2, justifyContent: 'flex-end' }}>
      <button
        className="icon-button"
        aria-label={'Edit ' + transaction.description}
        onClick={() => onEdit(transaction)}
      >
        <Pencil size={13} />
      </button>
      <button
        className="icon-button"
        aria-label={'Archive ' + transaction.description}
        onClick={() => onArchive(transaction)}
      >
        <Archive size={13} />
      </button>
    </div>
  );
}
