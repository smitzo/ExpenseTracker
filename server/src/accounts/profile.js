import { users, safeUser } from '../db/users.js';
import { profileSchema } from '../domain/preferences.js';
export const getProfile = (req, res) => res.json({ user: safeUser(req.user), csrf: req.csrf });
export const updateProfile = async (req, res) => { const user = await users(req.db).update(req.user._id, profileSchema.parse(req.body)); res.json({ user: safeUser(user) }); };
