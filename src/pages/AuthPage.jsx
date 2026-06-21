// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { login, signup, loginWithGoogle } = useAuth();

  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const clearError = () => setError('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (mode === 'signup') {
      if (!name.trim())          { setError('Please enter your name.'); return; }
      if (password.length < 6)   { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirm)  { setError('Passwords do not match!'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'signup') await signup(name, email, password);
      else                   await login(email, password);
    } catch (err) {
      const msgs = {
        'auth/user-not-found':      'No account found with this email.',
        'auth/wrong-password':      'Incorrect password. Please try again.',
        'auth/email-already-in-use':'This email is already registered. Please login.',
        'auth/invalid-email':       'Please enter a valid email address.',
        'auth/weak-password':       'Password should be at least 6 characters.',
        'auth/too-many-requests':   'Too many attempts. Please try again later.',
        'auth/invalid-credential':  'Invalid email or password.',
      };
      setError(msgs[err.code] || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Left panel — branding */}
      <div className="auth-page__left">
        <div className="auth-page__brand">
          <div className="auth-page__brand-icon">🎯</div>
          <div className="auth-page__brand-name">Prep<span>AI</span></div>
        </div>
        <h1 className="auth-page__tagline">
          Ace your interviews<br />with the power of AI
        </h1>
        <p className="auth-page__sub">
          Practice DSA, HR & System Design with real-time AI feedback, resume analysis, and performance tracking.
        </p>
        <div className="auth-page__features">
          {['🤖 AI Mock Interviewer', '📊 Live Feedback Scores', '📄 Resume Analyzer', '🔒 Anti-Cheat System'].map((f) => (
            <div className="auth-page__feature" key={f}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-page__right">
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-card__tabs">
            <button
              className={`auth-card__tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); clearError(); }}
            >
              Login
            </button>
            <button
              className={`auth-card__tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); clearError(); }}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-card__body">
            <h2 className="auth-card__title">
              {mode === 'login' ? 'Welcome back 👋' : 'Create your account 🚀'}
            </h2>
            <p className="auth-card__subtitle">
              {mode === 'login'
                ? 'Login to continue your interview prep'
                : 'Join thousands of students preparing with AI'}
            </p>

            {/* Google button */}
            <button className="google-btn" onClick={handleGoogle} disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.4 6.5 28.9 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5c11 0 20.5-8 20.5-20.5 0-1.4-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.4 6.5 28.9 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
                <path fill="#4CAF50" d="M24 45.5c4.8 0 9.2-1.8 12.5-4.7l-5.8-4.9C28.9 37.5 26.6 38.5 24 38.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.6 41.1 16.3 45.5 24 45.5z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l5.8 4.9C40.5 34.8 44 30.3 44 24.5c0-1.4-.1-2.7-.4-4z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider"><span>or</span></div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'signup' && (
                <div className="auth-form__group">
                  <label className="auth-form__label">Full Name</label>
                  <input
                    className="auth-form__input"
                    type="text"
                    placeholder="Rahul Singh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="auth-form__group">
                <label className="auth-form__label">Email Address</label>
                <input
                  className="auth-form__input"
                  type="email"
                  placeholder="rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-form__group">
                <label className="auth-form__label">Password</label>
                <div className="auth-form__pass-wrap">
                  <input
                    className="auth-form__input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="auth-form__eye" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="auth-form__group">
                  <label className="auth-form__label">Confirm Password</label>
                  <input
                    className="auth-form__input"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="auth-form__forgot">
                  <button type="button" className="auth-form__forgot-btn">Forgot password?</button>
                </div>
              )}

              {error && <div className="auth-form__error">⚠️ {error}</div>}

              <button className="auth-form__submit" type="submit" disabled={loading}>
                {loading
                  ? <><span className="spinner" />{mode === 'login' ? 'Logging in...' : 'Creating account...'}</>
                  : mode === 'login' ? 'Login to PrepAI →' : 'Create Account →'}
              </button>
            </form>

            <p className="auth-card__switch">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                className="auth-card__switch-btn"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearError(); }}
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
