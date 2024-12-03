import { useState } from 'react';
import { useSession } from './lib/Session.jsx';
import { useNavigation } from './lib/navigation.js';
import { useWorkspace } from './lib/useWorkspace.js';
import { currentMonth } from './lib/format.js';
import { Layout } from './components/Layout.jsx';
import { TransactionEditor } from './components/TransactionEditor.jsx';
import { QuickAdd } from './components/QuickAdd.jsx';
import { Modal } from './components/Modal.jsx';
import { Loading } from './components/Loading.jsx';
import { Recovery } from './components/Recovery.jsx';
import { KeyboardShortcuts } from './components/KeyboardShortcuts.jsx';
import { Overview } from './pages/Overview.jsx';
import { Transactions } from './pages/Transactions.jsx';
import { Budgets } from './pages/Budgets.jsx';
import { Recurring } from './pages/Recurring.jsx';
import { Insights } from './pages/Insights.jsx';
import { Import } from './pages/Import.jsx';
import { Categories } from './pages/Categories.jsx';
import { Settings } from './pages/Settings.jsx';
import { Auth } from './pages/Auth.jsx';
export function App() {
  const { user, loading } = useSession();
  if (loading) return <Loading label="Opening your workspace…" />;
  return user ? <Workspace /> : <Auth />;
}
function Workspace() {
  const [page, navigate] = useNavigation(),
    [month, setMonth] = useState(currentMonth),
    [edit, setEdit] = useState(null),
    [archive, setArchive] = useState(null),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState('');
  const workspace = useWorkspace(month);
  const { data, loading, error, reload, mutate } = workspace;
  const props = {
    data,
    month,
    setMonth,
    navigate,
    mutate,
    onEdit: setEdit,
    onArchive: (t) => {
      setArchive(t);
      setActionError('');
    },
  };
  const screens = {
    overview: Overview,
    transactions: Transactions,
    budgets: Budgets,
    recurring: Recurring,
    insights: Insights,
    import: Import,
    categories: Categories,
    settings: Settings,
  };
  const Screen = screens[page];
  return (
    <Layout page={page} navigate={navigate} onAdd={() => setEdit({})}>
      <KeyboardShortcuts onAdd={() => setEdit({})} navigate={navigate} />
      {error ? (
        <Recovery message={error} retry={reload} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <Screen {...props} reload={reload} revision={data} />
          {page === 'overview' && <QuickAdd mutate={mutate} categories={data.categories} />}
        </>
      )}
      {loading && data && (
        <p className="refresh-status" role="status">
          Updating your workspace…
        </p>
      )}
      {edit && data && (
        <TransactionEditor
          transaction={edit.id ? edit : null}
          categories={data.categories}
          mutate={mutate}
          onClose={() => setEdit(null)}
        />
      )}{' '}
      {archive && (
        <Modal title="Archive this entry?" onClose={() => setArchive(null)}>
          <p className="section-intro">
            {archive.description} will be excluded from your active ledger and summaries. The record
            stays in your account history.
          </p>
          {actionError && <p className="error">{actionError}</p>}
          <div className="form-actions">
            <button className="button secondary" onClick={() => setArchive(null)}>
              Keep entry
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await mutate('transactions', 'DELETE', undefined, archive.id);
                  setArchive(null);
                } catch (e) {
                  setActionError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Archive entry
            </button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
