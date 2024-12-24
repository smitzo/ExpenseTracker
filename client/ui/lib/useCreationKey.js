import { useRef } from 'react';
export function useCreationKey() {
  const intent = useRef(null);
  return {
    keyFor(body) {
      const fingerprint = JSON.stringify(body);
      if (intent.current?.fingerprint !== fingerprint)
        intent.current = { fingerprint, key: crypto.randomUUID() };
      return intent.current.key;
    },
    complete() {
      intent.current = null;
    },
  };
}
