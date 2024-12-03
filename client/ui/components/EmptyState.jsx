import { Sprout } from 'lucide-react';
export function EmptyState({
  title = 'A little room to begin.',
  description = 'Add your first entry to bring your workspace to life.',
  action,
  onAction,
}) {
  return (
    <div className="empty">
      <Sprout size={28} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button secondary" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
