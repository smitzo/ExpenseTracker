import { useEffect, useState } from 'react';
export const pages = ['overview', 'transactions', 'budgets', 'recurring', 'insights', 'import', 'categories', 'settings'];
export function useNavigation() { const [page, setPage] = useState(() => pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview'); useEffect(() => { const sync = () => setPage(pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview'); addEventListener('hashchange', sync); return () => removeEventListener('hashchange', sync); }, []); return [page, value => { location.hash = value; }]; }
