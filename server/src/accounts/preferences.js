import { preferencesSchema } from '../domain/preferences.js';
import { users, safeUser } from '../db/users.js';
import { ledger } from '../db/ledger.js';
import { ensure } from '../domain/errors.js';
export const updatePreferences = async (req, res) => {
  const preferences = preferencesSchema.parse(req.body);
  if (preferences.currency !== req.user.preferences.currency) {
    const used = await ledger(req.db).count(req.user._id);
    ensure(!used, 409, 'CURRENCY_LOCKED', 'Currency cannot change after recording transactions.');
  }
  const user = await users(req.db).update(req.user._id, { preferences }); res.json({ user: safeUser(user) });
};
