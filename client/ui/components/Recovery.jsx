import { CloudOff } from 'lucide-react';
export function Recovery({message,retry}){return <section className="card empty" role="alert"><CloudOff size={28}/><h2>A moment to reconnect.</h2><p>{message}</p><button className="button" onClick={retry}>Try again</button></section>;}
