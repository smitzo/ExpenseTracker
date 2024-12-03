import { PrivacyControls } from '../components/PrivacyControls.jsx';
import { useEffect, useState } from 'react';
import { Shield, LogOut } from 'lucide-react';
import { useSession } from '../lib/Session.jsx';
import { request } from '../lib/api.js';
import { minorInput } from '../lib/format.js';
export function Settings() {
  const { user, setUser, demo, setSample, signOut } = useSession();
  const [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [sessions, setSessions] = useState([]);
  useEffect(() => {
    if (!demo)
      request('/sessions')
        .then((r) => setSessions(r.data))
        .catch((e) => setError(e.message));
  }, [demo]);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const f = new FormData(e.currentTarget);
      const preferences = {
        currency: String(f.get('currency')),
        monthlyTarget: f.get('target') === '0' ? 0 : minorInput(f.get('target')),
        weekStartsOn: 'monday',
      };
      const name = String(f.get('name')).trim();
      if (demo) {
        setUser((u) => ({ ...u, name, preferences }));
        setSample((s) => ({ ...s, user: { ...s.user, name, preferences } }));
      } else {
        const result = await request('/preferences', { method: 'PUT', body: preferences });
        const profile = await request('/profile', { method: 'PATCH', body: { name } });
        setUser({ ...result.user, name: profile.user.name });
      }
      setMessage('Your preferences have been saved.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function password(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const f = new FormData(e.currentTarget);
      await request('/password', {
        method: 'PUT',
        body: {
          currentPassword: String(f.get('currentPassword')),
          password: String(f.get('password')),
        },
      });
      setUser(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>A workspace that feels like you.</h1>
          <p>Your preferences, your account, your peace of mind.</p>
        </div>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="positive" role="status">
          {message}
        </p>
      )}
      <div className="grid-2">
        <section className="card">
          <h2>Personal preferences</h2>
          <form className="form" onSubmit={save}>
            <label>
              Name
              <input name="name" defaultValue={user.name} required maxLength={80} />
            </label>
            <label>
              Email
              <input value={user.email} readOnly />
            </label>
            <div className="form-row">
              <label>
                Currency
                <select name="currency" defaultValue={user.preferences.currency}>
                  {['INR', 'USD', 'EUR', 'GBP'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Monthly savings intention
                <input
                  name="target"
                  inputMode="decimal"
                  required
                  defaultValue={user.preferences.monthlyTarget / 100}
                />
              </label>
            </div>
            <p className="help-note">
              Currency is fixed after recording transactions to keep historical amounts meaningful.
            </p>
            <button className="button" disabled={busy}>
              Save preferences
            </button>
          </form>
        </section>
        <section className="card">
          <div className="card-heading">
            <h2>Account security</h2>
            <Shield size={19} />
          </div>
          {demo ? (
            <p className="section-intro">
              You’re exploring sample data. Create an account for private, persistent records and
              secure session controls.
            </p>
          ) : (
            <>
              <form className="form" onSubmit={password}>
                <label>
                  Current password
                  <input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </label>
                <button className="button secondary" disabled={busy}>
                  Change password & sign out
                </button>
              </form>
              <h3 className="section-gap">Active sessions</h3>
              {sessions.map((s) => (
                <div className="list-row" key={s.publicId}>
                  <span className="help-note">
                    {s.current ? 'This session' : 'Another session'}
                    <br />
                    Expires {new Date(s.expiresAt).toLocaleDateString()}
                  </span>
                  {!s.current && (
                    <button
                      className="text-button"
                      onClick={async () => {
                        try {
                          await request('/sessions/' + s.publicId, { method: 'DELETE' });
                          setSessions((v) => v.filter((x) => x.publicId !== s.publicId));
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
          <button
            className="button secondary section-gap"
            onClick={() => signOut().catch((e) => setError(e.message))}
          >
            <LogOut size={15} />
            {demo ? 'Create an account' : 'Sign out'}
          </button>
        </section>
      </div>
      <PrivacyControls />
    </>
  );
}
