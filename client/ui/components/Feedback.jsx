import { createContext, useContext, useState } from 'react';
const Context = createContext(() => {});
export const useFeedback = () => useContext(Context);
export function FeedbackProvider({ children }) { const [message, setMessage] = useState(''); return <Context.Provider value={setMessage}>{children}<div className="toast" role="status" aria-live="polite">{message && <><span>{message}</span><button aria-label="Dismiss notification" onClick={() => setMessage('')}>×</button></>}</div></Context.Provider>; }
