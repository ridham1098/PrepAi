import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { RECENT_SESSIONS } from '../data/demoData.js';

const DEMO_STATS = [
  { val: '24',  label: 'Interviews Done',   trend: '↑ +3 this week',   cls: 's1' },
  { val: '78%', label: 'Avg Score',         trend: '↑ +5% vs last week', cls: 's2' },
  { val: '142', label: 'Questions Solved',  trend: '↑ +18 this week',  cls: 's3' },
  { val: '7',   label: 'Day Streak',        trend: '🔥 Keep it up!',   cls: 's4' },
];

const CATEGORIES = [
  { id: 'dsa',    icon: '💻', name: 'DSA / Coding',   desc: 'Arrays, trees, DP, graphs', progress: 65, color: 'var(--accent)' },
  { id: 'hr',     icon: '🤝', name: 'HR Round',       desc: 'Behavioral & soft skills',  progress: 80, color: 'var(--green)' },
  { id: 'system', icon: '🏗️', name: 'System Design',  desc: 'Scale, architecture',       progress: 40, color: 'var(--orange)' },
];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { history, bookmarks } = useApp();

  // Use real history if the user has saved sessions, otherwise show demo data
  const hasRealHistory = history.length > 0;

  const avgScore = hasRealHistory
    ? Math.round(history.reduce((sum, h) => sum + (h.score || 0), 0) / history.length)
    : 78;

  const totalQuestions = hasRealHistory
    ? history.reduce((sum, h) => sum + (h.questionCount || 0), 0)
    : 142;

  const stats = hasRealHistory
    ? [
        { val: String(history.length), label: 'Interviews Done',  trend: `${bookmarks.length} bookmarked`, cls: 's1' },
        { val: `${avgScore}%`,         label: 'Avg Score',        trend: 'From your sessions',             cls: 's2' },
        { val: String(totalQuestions), label: 'Questions Solved', trend: 'Across all sessions',            cls: 's3' },
        { val: String(history.length), label: 'Sessions Saved',   trend: 'Keep practicing! 🔥',            cls: 's4' },
      ]
    : DEMO_STATS;

  const recentSessions = hasRealHistory
    ? history.slice(0, 4).map((h) => ({
        name: h.title || `${h.typeLabel || h.type} Session`,
        time: timeAgo(h.date),
        score: h.score ?? 0,
        color: 'var(--accent)',
        scoreBg: 'rgba(99,102,241,0.15)',
        scoreColor: 'var(--accent2)',
      }))
    : RECENT_SESSIONS;

  return (
    <div className="dashboard fade-in">
      {/* Stats */}
      <div className="dashboard__stats">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-card__val">{s.val}</div>
            <div className="stat-card__label">{s.label}</div>
            <div className="stat-card__trend">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="dashboard__grid">
        {/* Categories */}
        <div>
          <div className="section-title">Practice by Category</div>
          <div className="dashboard__categories">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="category-card"
                onClick={() => navigate('/interview')}
              >
                <div className="category-card__icon" style={{ background: `${cat.color}22` }}>
                  {cat.icon}
                </div>
                <div className="category-card__name">{cat.name}</div>
                <div className="category-card__desc">{cat.desc}</div>
                <div className="pbar">
                  <div className="pbar__fill" style={{ width: `${cat.progress}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <div className="section-title">Recent Sessions</div>
          <div className="dashboard__recent">
            {recentSessions.length === 0 ? (
              <div className="resume__empty">No sessions yet — start a mock interview! 🎯</div>
            ) : (
              recentSessions.map((s, i) => (
                <div key={i} className="recent-item" onClick={() => navigate('/history')}>
                  <div className="recent-item__left">
                    <div className="recent-item__dot" style={{ background: s.color }} />
                    <div>
                      <div className="recent-item__name">{s.name}</div>
                      <div className="recent-item__time">{s.time}</div>
                    </div>
                  </div>
                  <span className="score-pill" style={{ background: s.scoreBg, color: s.scoreColor }}>
                    {s.score}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
