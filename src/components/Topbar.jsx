import React from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/interview':   'Mock Interview',
  '/resume':      'Resume Analyzer',
  '/performance': 'Performance',
  '/history':     'History & Progress',
  '/bookmarks':   'Bookmarked Questions',
};

export default function Topbar() {
  const location = useLocation();
  const { provider, demoMode, history } = useApp();

  const title = PAGE_TITLES[location.pathname] || 'PrepAI';

  const statusText = demoMode
    ? '🎮 Demo Mode'
    : { gemini: '🤖 Gemini', openai: '🧠 ChatGPT', groq: '⚡ Groq' }[provider] + ' Connected';

  const statusClass = demoMode ? 'badge--orange' : 'badge--green';
  const streak = history.length > 0 ? history.length : 7;

  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__right">
        <span className={`badge ${statusClass}`}>{statusText}</span>
        <span className="badge badge--accent">{streak} Session{streak !== 1 ? 's' : ''} 🔥</span>
      </div>
    </header>
  );
}
