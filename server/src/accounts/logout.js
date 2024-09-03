import { sessions } from '../db/sessions.js';
import { clearSession } from '../security/cookies.js';
export const logout = config => async (req, res) => { await sessions(req.db).revoke(req.session._id, req.user._id); clearSession(res, config); res.status(204).end(); };
