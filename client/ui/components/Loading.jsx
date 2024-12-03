export function Loading({ label = 'Bringing your workspace into focus…' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-mark" aria-hidden="true">
        p
      </span>
      <p>{label}</p>
    </div>
  );
}
