import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import Sidebar      from './components/Sidebar.jsx';
import Topbar        from './components/Topbar.jsx';
import ApiModal      from './components/ApiModal.jsx';

import AuthPage      from './pages/AuthPage.jsx';
import Dashboard      from './pages/Dashboard.jsx';
import Interview      from './pages/Interview.jsx';
import Resume         from './pages/Resume.jsx';
import Performance    from './pages/Performance.jsx';
import History        from './pages/History.jsx';
import Bookmarks      from './pages/Bookmarks.jsx';

function AppShell() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(true);

  if (!user) return <AuthPage />;

  return (
    <div className="app-shell">
      <Sidebar onOpenSettings={() => setShowModal(true)} />
      <div className="app-shell__main">
        <Topbar />
        <div className="app-shell__content">
          <Routes>
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/interview"   element={<Interview />} />
            <Route path="/resume"      element={<Resume />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/history"     element={<History />} />
            <Route path="/bookmarks"   element={<Bookmarks />} />
            <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
      {showModal && <ApiModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
