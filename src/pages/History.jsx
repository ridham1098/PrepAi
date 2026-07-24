import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const TYPE_ICON = { dsa: '💻', hr: '🤝', system: '🏗️' };

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function scoreColor(score) {
  if (score >= 80) return 'var(--green)';
  if (score >= 60) return 'var(--orange)';
  return 'var(--red)';
}

function TranscriptModal({ session, onClose }) {
  if (!session) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal__title">{session.title}</div>
        <div className="modal__sub">{formatDate(session.date)} · Score: {session.score}%</div>

        <div className="history-modal__body">
          {(session.messages || []).map((m, i) => (
            <div key={i} className={`history-modal__msg ${m.role === 'user' ? 'history-modal__msg--user' : ''}`}>
              <div className="history-modal__msg-role">{m.role === 'ai' ? 'AI Interviewer' : 'You'}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="modal__btns">
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const { history, removeHistorySession, clearHistory } = useApp();
  const [viewing, setViewing] = useState(null);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const avgScore = Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length);
    const totalQuestions = history.reduce((s, h) => s + (h.questionCount || 0), 0);
    const totalViolations = history.reduce((s, h) => s + (h.violations || 0), 0);
    return { sessions: history.length, avgScore, totalQuestions, totalViolations };
  }, [history]);

  return (
    <div className="history fade-in">
      <div className="history__header">
        <div className="section-title" style={{ marginBottom: 0 }}>Interview History & Progress</div>
        {history.length > 0 && (
          <button className="history__clear-btn" onClick={() => window.confirm('Clear all interview history?') && clearHistory()}>
            🗑️ Clear All
          </button>
        )}
      </div>

      {stats && (
        <div className="history__stats">
          <div className="stat-card s1">
            <div className="stat-card__val">{stats.sessions}</div>
            <div className="stat-card__label">Sessions Saved</div>
          </div>
          <div className="stat-card s2">
            <div className="stat-card__val">{stats.avgScore}%</div>
            <div className="stat-card__label">Avg Score</div>
          </div>
          <div className="stat-card s3">
            <div className="stat-card__val">{stats.totalQuestions}</div>
            <div className="stat-card__label">Questions Solved</div>
          </div>
          <div className="stat-card s4">
            <div className="stat-card__val">{stats.totalViolations}</div>
            <div className="stat-card__label">Total Violations</div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="history__empty">
          <div className="history__empty-icon">📭</div>
          No interview session has been saved yet..<br />
After completing the mock interview, press "End Session & Save" — your progress will be tracked here.          <div style={{ marginTop: 16 }}>
            <button className="end-session-btn" onClick={() => navigate('/interview')}>
              Start an Interview →
            </button>
          </div>
        </div>
      ) : (
        <div className="history__list">
          {history.map((h) => (
            <div className="history-card" key={h.id}>
              <div className="history-card__left">
                <div className="history-card__icon">{TYPE_ICON[h.type] || '🎯'}</div>
                <div>
                  <div className="history-card__name">{h.title}</div>
                  <div className="history-card__meta">
                    {formatDate(h.date)} · {h.questionCount} questions
                    {h.violations > 0 && ` · ⚠️ ${h.violations} violations`}
                  </div>
                </div>
              </div>
              <div className="history-card__right">
                <span className="score-pill" style={{ background: `${scoreColor(h.score)}22`, color: scoreColor(h.score) }}>
                  {h.score}%
                </span>
                <button className="history-card__view-btn" onClick={() => setViewing(h)}>View</button>
                <button
                  className="history-card__del-btn"
                  onClick={() => window.confirm('Delete this session?') && removeHistorySession(h.id)}
                  title="Delete session"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TranscriptModal session={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
