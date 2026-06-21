import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const TYPE_CLASS = { Technical: 'qt-tech', HR: 'qt-hr', 'System Design': 'qt-sd', 'DSA': 'qt-tech', 'HR Round': 'qt-hr', 'System Design Round': 'qt-sd' };
const TYPE_FILTERS = ['All', 'Technical', 'HR', 'System Design', 'DSA', 'HR Round'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Bookmarks() {
  const navigate = useNavigate();
  const { bookmarks, removeBookmark, setPracticeQuestion } = useApp();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const availableTypes = useMemo(() => {
    const types = new Set(bookmarks.map((b) => b.type));
    return ['All', ...Array.from(types)];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesType = typeFilter === 'All' || b.type === typeFilter;
      const matchesSearch = b.question.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [bookmarks, search, typeFilter]);

  const handlePractice = (q) => {
    setPracticeQuestion(q);
    navigate('/interview');
  };

  return (
    <div className="bookmarks fade-in">
      <div className="section-title">Bookmarked Questions</div>

      {bookmarks.length === 0 ? (
        <div className="history__empty">
          <div className="history__empty-icon">⭐</div>
          Abhi koi question bookmark nahi kiya.<br />
          Resume page ya Mock Interview ke dauraan ☆ icon dabake questions save karo.
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <input
              className="filter-bar__search"
              type="text"
              placeholder="🔍 Search bookmarked questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="filter-bar__select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {availableTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="filter-empty">No bookmarks match your search/filter 🔎</div>
          ) : (
            <div className="bookmarks__list">
              {filtered.map((b) => (
                <div className="bookmark-card" key={b.id}>
                  <div style={{ flex: 1 }}>
                    <div className="bookmark-card__text">{b.question}</div>
                    <div className="bookmark-card__meta">
                      <span className={`q-tag ${TYPE_CLASS[b.type] || 'qt-tech'}`}>{b.type}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>Saved {formatDate(b.date)}</span>
                    </div>
                  </div>
                  <div className="bookmark-card__actions">
                    <button className="bookmark-card__practice-btn" onClick={() => handlePractice(b)}>
                      Practice this →
                    </button>
                    <button
                      className="bookmark-card__remove-btn"
                      onClick={() => removeBookmark(b.id)}
                      title="Remove bookmark"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
