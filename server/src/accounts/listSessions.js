import { sessions } from '../db/sessions.js';
export async function listSessions(req, res) { const rows = await sessions(req.db).list(req.user._id); res.json({ data: rows.map(s => ({ ...s, current: s.publicId === req.session.publicId })) }); }
