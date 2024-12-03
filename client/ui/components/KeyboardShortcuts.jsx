import { useEffect } from 'react';
export function KeyboardShortcuts({ onAdd, navigate }) {
  useEffect(() => {
    function key(e) {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.target.closest('input,textarea,select,[contenteditable]') ||
        document.querySelector('dialog[open]')
      )
        return;
      if (e.key === 'n') {
        e.preventDefault();
        onAdd();
      }
      if (e.key === 'g') {
        e.preventDefault();
        navigate('overview');
      }
    }
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [onAdd, navigate]);
  return null;
}
