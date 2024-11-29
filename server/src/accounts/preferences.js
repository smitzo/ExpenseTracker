import { preferencesSchema } from '../domain/preferences.js';
import { users, safeUser } from '../db/users.js';
import { collection } from '../db/connection.js';
import { ensure } from '../domain/errors.js';
export const updatePreferences = async (req, res) => {
  const preferences = preferencesSchema.parse(req.body);
  if (preferences.currency !== req.user.preferences.currency) {
    const counts = await Promise.all(['ledger','budgets','recurring'].map(name => collection(req.db,name).countDocuments({ownerId:req.user._id}, {limit:1})));
    const used = counts.some(Boolean);
    ensure(!used, 409, 'CURRENCY_LOCKED', 'Currency cannot change after recording transactions.');
  }
  const user = await users(req.db).update(req.user._id, { preferences }); res.json({ user: safeUser(user) });
};
