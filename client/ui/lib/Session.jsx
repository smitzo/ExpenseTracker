import { createContext, useContext, useEffect, useState } from 'react';
import { request, setCsrf } from './api.js';
import { fixtures } from './fixtures.js';
const Context = createContext(null);
export const useSession = () => useContext(Context);
export function SessionProvider({ children }) {
  const [demo] = useState(() => new URLSearchParams(location.search).has('demo'));
  const [sample, setSample] = useState(() => (demo ? fixtures() : null));
  const [user, setUser] = useState(() => (demo ? sample.user : null));
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState('');
  const accept = (data) => {
    setCsrf(data.csrf);
    setUser(data.user);
  };
  async function refresh() {
    setLoading(true);
    setError('');
    try {
      accept(await request('/auth/session'));
    } catch (e) {
      if (e.status !== 401) setError(e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!demo) refresh();
    const expire = () => {
      if (!demo) {
        setCsrf('');
        setUser(null);
      }
    };
    addEventListener('penny:session-expired', expire);
    return () => removeEventListener('penny:session-expired', expire);
  }, [demo]);
  async function signOut() {
    if (demo) {
      location.assign('/');
      return;
    }
    await request('/auth/logout', { method: 'POST', body: {} });
    setCsrf('');
    setUser(null);
  }
  return (
    <Context.Provider
      value={{ user, setUser, demo, sample, setSample, loading, error, refresh, accept, signOut }}
    >
      {children}
    </Context.Provider>
  );
}
