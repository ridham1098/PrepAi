import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const HISTORY_KEY   = 'prepai_history';
const BOOKMARKS_KEY = 'prepai_bookmarks';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [apiKey, setApiKey]     = useState('');
  const [provider, setProvider] = useState('demo');
  const [demoMode, setDemoMode] = useState(true);

  // Question selected from Resume/Bookmarks to practice in Interview page
  const [practiceQuestion, setPracticeQuestion] = useState(null);

  // ── Interview History & Progress Tracker ─────────────────────────────
  const [history, setHistory] = useState(() => loadJSON(HISTORY_KEY, []));

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addHistorySession = (session) => {
    setHistory((prev) => [
      { id: Date.now().toString(), date: new Date().toISOString(), ...session },
      ...prev,
    ]);
  };

  const removeHistorySession = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearHistory = () => setHistory([]);

  // ── Bookmarked Questions ──────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState(() => loadJSON(BOOKMARKS_KEY, []));

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = (question) => bookmarks.some((b) => b.question === question);

  const addBookmark = (q) => {
    if (isBookmarked(q.question)) return;
    setBookmarks((prev) => [
      { id: Date.now().toString(), date: new Date().toISOString(), ...q },
      ...prev,
    ]);
  };

  const removeBookmark = (idOrQuestion) => {
    setBookmarks((prev) =>
      prev.filter((b) => b.id !== idOrQuestion && b.question !== idOrQuestion)
    );
  };

  const toggleBookmark = (q) => {
    if (isBookmarked(q.question)) removeBookmark(q.question);
    else addBookmark(q);
  };

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey,
      provider, setProvider,
      demoMode, setDemoMode,
      practiceQuestion, setPracticeQuestion,
      history, addHistorySession, removeHistorySession, clearHistory,
      bookmarks, isBookmarked, addBookmark, removeBookmark, toggleBookmark,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
