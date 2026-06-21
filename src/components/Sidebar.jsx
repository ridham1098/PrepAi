import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard' },
  { to: '/interview',   label: 'Mock Interview' },
  { to: '/resume',      label: 'Resume Analyzer' },
  { to: '/performance', label: 'Performance' },
  { to: '/history',     label: 'History' },
  { to: '/bookmarks',   label: 'Bookmarks' },
];

export default function Sidebar({ onOpenSettings }) {
  const { provider, demoMode, history, bookmarks } = useApp();
  const { user, logout } = useAuth();

  const providerLabel = demoMode ? 'Demo' : { gemini: 'Gemini', openai: 'ChatGPT', groq: 'Groq' }[provider] || '';

  const name     = user?.displayName || user?.email || 'User';
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const countFor = (to) => {
    if (to === '/history') return history.length;
    if (to === '/bookmarks') return bookmarks.length;
    return 0;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">🎯</div>
        <div className="sidebar__logo-text">Prep<span>AI</span></div>
      </div>

      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Main</div>
        {NAV_ITEMS.map((item) => {
          const count = countFor(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar__nav-dot" />
              {item.label}
              {count > 0 && <span className="sidebar__nav-count">{count}</span>}
            </NavLink>
          );
        })}

        <div className="sidebar__nav-label" style={{ marginTop: 12 }}>Settings</div>
        <button className="sidebar__nav-item" onClick={onOpenSettings}>
          <span className="sidebar__nav-dot" />
          AI Provider
          {providerLabel && (
            <span className="sidebar__provider-chip">{providerLabel}</span>
          )}
        </button>
      </nav>

      <div className="sidebar__bottom">
        <div className="sidebar__user">
          <div className="sidebar__user-av">{initials}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{name.split(' ')[0]}</div>
            <div className="sidebar__user-role">{user?.email}</div>
          </div>
        </div>
        <button className="sidebar__logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
