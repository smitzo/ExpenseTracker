import { exportAccount, deleteAccount } from './accounts/privacy.js';
import express from 'express';
import { securityHeaders, privateCache } from './security/headers.js';
import { requestLog } from './security/requestLog.js';
import { originPolicy } from './security/origin.js';
import { errorHandler } from './security/errorHandler.js';
import { authenticate } from './security/authenticate.js';
import { csrf } from './security/csrf.js';
import { guardWrites } from './security/loginThrottle.js';
import { auditMutations, listAudit } from './insights/audit.js';
import { register } from './accounts/register.js';
import { login } from './accounts/login.js';
import { logout } from './accounts/logout.js';
import { getProfile, updateProfile } from './accounts/profile.js';
import { updatePreferences } from './accounts/preferences.js';
import { changePassword } from './accounts/changePassword.js';
import { listSessions } from './accounts/listSessions.js';
import { revokeSession } from './accounts/revokeSession.js';
import { listCategories } from './accounts/listCategories.js';
import { createCategory, updateCategory, archiveCategory } from './accounts/writeCategories.js';
import { listTransactions } from './ledger/list.js';
import { createTransaction } from './ledger/create.js';
import { updateTransaction } from './ledger/update.js';
import { archiveTransaction } from './ledger/archive.js';
import { exportTransactions } from './ledger/export.js';
import { previewImport } from './ledger/importPreview.js';
import { commitImport } from './ledger/importCommit.js';
import { getDuplicates } from './ledger/search.js';
import { listBudgets, saveBudget, removeBudget } from './planning/budgets.js';
import {
  listRecurring,
  createRecurring,
  updateRecurring,
  removeRecurring,
} from './planning/recurring.js';
import { digest, suggestion } from './insights/digest.js';
import { health } from './insights/health.js';
import { readiness } from './insights/readiness.js';
export function createApp({ config, getDb }) {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.VERCEL) app.set('trust proxy', 1);
  app.use(requestLog, securityHeaders(), privateCache);
  app.get('/api/health', health);
  app.use(
    '/api',
    originPolicy(config),
    express.json({ limit: '300kb' }),
    async (req, _res, next) => {
      req.db = await getDb();
      next();
    },
  );
  app.get('/api/ready', readiness);
  app.post('/api/auth/register', register(config));
  app.post('/api/auth/login', login(config));
  const router = express.Router();
  router.use(authenticate(config), csrf, guardWrites(config), auditMutations);
  router.get('/account/export', exportAccount);
  router.delete('/account', deleteAccount(config));
  router.get('/auth/session', getProfile);
  router.post('/auth/logout', logout(config));
  router.patch('/profile', updateProfile);
  router.put('/preferences', updatePreferences);
  router.put('/password', changePassword(config));
  router.get('/sessions', listSessions);
  router.delete('/sessions/:id', revokeSession);
  router.get('/categories', listCategories);
  router.post('/categories', createCategory);
  router.patch('/categories/:id', updateCategory);
  router.delete('/categories/:id', archiveCategory);
  router.get('/transactions/export', exportTransactions);
  router.get('/transactions/duplicates', getDuplicates);
  router.get('/transactions', listTransactions);
  router.post('/transactions', createTransaction);
  router.patch('/transactions/:id', updateTransaction);
  router.delete('/transactions/:id', archiveTransaction);
  router.post('/imports/preview', previewImport);
  router.post('/imports/commit', commitImport);
  router.get('/budgets', listBudgets);
  router.put('/budgets', saveBudget);
  router.delete('/budgets/:id', removeBudget);
  router.get('/recurring', listRecurring);
  router.post('/recurring', createRecurring);
  router.put('/recurring/:id', updateRecurring);
  router.delete('/recurring/:id', removeRecurring);
  router.get('/digest', digest);
  router.get('/suggestion', suggestion);
  router.get('/audit', listAudit);
  app.use('/api', router);
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } }),
  );
  app.use(errorHandler);
  return app;
}
