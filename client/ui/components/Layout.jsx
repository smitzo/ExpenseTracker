import { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Repeat2,
  Sparkles,
  Upload,
  Shapes,
  Settings,
  Plus,
  LogOut,
  ArrowUpRight,
  Leaf,
  Menu,
  X,
} from 'lucide-react';
import { useSession } from '../lib/Session.jsx';
const sections = [
  ['overview', 'Overview', LayoutDashboard],
  ['transactions', 'Transactions', ArrowLeftRight],
  ['budgets', 'Budgets', Wallet],
  ['recurring', 'Recurring', Repeat2],
  ['insights', 'Insights', Sparkles],
];
export function Layout({ page, navigate, onAdd, children }) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const { user, demo, signOut } = useSession();
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-icon">p</span>penny<span className="brand-period">.</span>
        </a>
        <div className="workspace-name">
          <span className="workspace-avatar">{user.name.charAt(0)}</span>
          <div>
            Personal workspace<small>Your everyday, in balance</small>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Workspace">
          {sections.map(([key, label, Icon]) => (
            <a
              key={key}
              href={'#' + key}
              aria-current={page === key ? 'page' : undefined}
              className={page === key ? 'nav-item active' : 'nav-item'}
            >
              <Icon size={17} />
              {label}
              {key === 'insights' && <span className="new-dot" />}
            </a>
          ))}
        </nav>
        <p className="nav-label tools-label">TOOLS</p>
        <nav aria-label="Tools">
          {[
            ['import', 'Import data', Upload],
            ['categories', 'Categories', Shapes],
            ['settings', 'Settings', Settings],
          ].map(([key, label, Icon]) => (
            <a className={'nav-item ' + (page === key ? 'active' : '')} href={'#' + key} key={key}>
              <Icon size={17} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Leaf size={19} />
            <p>
              Small habits.
              <br />A little more freedom.
            </p>
            <span>Make room for what matters.</span>
          </div>
          <button className="profile-button" onClick={() => navigate('settings')}>
            <span className="avatar">
              {user.name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span>
              {user.name}
              <small>{demo ? 'Demo workspace' : 'Personal account'}</small>
            </span>
            <Settings size={15} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page[0].toUpperCase() + page.slice(1)}</strong>
          </div>
          <div className="top-actions">
            <button
              className="icon-button mobile-tools-trigger"
              aria-label="Open workspace tools"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((v) => !v)}
            >
              {toolsOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {demo && <span className="demo-tag">Sample data · changes reset on refresh</span>}
            <button
              className="text-button signout"
              onClick={() => signOut().catch((e) => alert(e.message))}
            >
              {demo ? 'Create an account' : 'Sign out'}
              {demo ? <ArrowUpRight size={13} /> : <LogOut size={13} />}
            </button>
            <button className="button compact" onClick={onAdd}>
              <Plus size={15} />
              Add transaction
            </button>
          </div>
        </header>
        {toolsOpen && (
          <nav className="mobile-tools-menu" aria-label="Mobile tools">
            {[
              ['import', 'Import data'],
              ['categories', 'Categories'],
              ['settings', 'Settings'],
            ].map(([key, label]) => (
              <a key={key} href={'#' + key} onClick={() => setToolsOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="footer">
          <span>Made for a little more peace of mind.</span>
          <span>Penny · Your money, with perspective.</span>
        </footer>
      </div>
    </div>
  );
}
