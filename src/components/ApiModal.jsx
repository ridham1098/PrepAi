import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const PROVIDERS = [
  { id: 'gemini', icon: '🤖', name: 'Gemini',    desc: 'Google AI Studio',    badge: 'FREE 1500/day', badgeCls: 'pb-free',  keyPrefix: 'AIzaSy...',    link: 'https://aistudio.google.com', linkText: 'aistudio.google.com → Get API Key' },
  { id: 'openai', icon: '🧠', name: 'ChatGPT',   desc: 'OpenAI GPT-4o Mini',  badge: 'PAID ~$5',      badgeCls: 'pb-paid',  keyPrefix: 'sk-proj-...',  link: 'https://platform.openai.com/api-keys', linkText: 'platform.openai.com/api-keys' },
  { id: 'groq',   icon: '⚡', name: 'Groq',      desc: 'Llama 3.3 (Fast)',    badge: 'FREE',          badgeCls: 'pb-free',  keyPrefix: 'gsk_...',      link: 'https://console.groq.com', linkText: 'console.groq.com → API Keys' },
  { id: 'demo',   icon: '🎮', name: 'Demo Mode', desc: 'No API key needed',   badge: 'OFFLINE',       badgeCls: 'pb-demo',  keyPrefix: '',             link: '', linkText: '' },
];

export default function ApiModal({ onClose }) {
  const { setApiKey, setProvider, setDemoMode } = useApp();
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [keyInput, setKeyInput] = useState('');
  const [error, setError]       = useState('');

  const connect = () => {
    setError('');
    if (selectedProvider === 'demo') {
      setDemoMode(true); setApiKey(''); setProvider('demo');
      onClose(); return;
    }
    if (!keyInput.trim()) { setError('Please enter your API key!'); return; }
    setApiKey(keyInput.trim());
    setProvider(selectedProvider);
    setDemoMode(false);
    onClose();
  };

  const selected = PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__title">⚡ Choose Your AI Provider</div>
        <div className="modal__sub">Pick any AI to power your mock interviews. All work without any backend!</div>

        <div className="provider-grid">
          {PROVIDERS.map((p) => (
            <div
              key={p.id}
              className={`provider-card ${selectedProvider === p.id ? 'provider-card--sel' : ''}`}
              onClick={() => { setSelectedProvider(p.id); setKeyInput(''); setError(''); }}
            >
              <div className="provider-card__icon">{p.icon}</div>
              <div className="provider-card__name">{p.name}</div>
              <div className="provider-card__desc">{p.desc}</div>
              <span className={`provider-badge ${p.badgeCls}`}>{p.badge}</span>
            </div>
          ))}
        </div>

        {selectedProvider !== 'demo' && (
          <div className="modal__key-section">
            <div className="modal__key-label">{selected.name} API Key</div>
            <input
              className="modal__key-input"
              type="password"
              placeholder={selected.keyPrefix}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && connect()}
            />
            <div className="modal__key-note">
              Get free key → <a href={selected.link} target="_blank" rel="noreferrer">{selected.linkText}</a>
            </div>
          </div>
        )}

        {selectedProvider === 'demo' && (
          <div className="modal__demo-note">
            🎮 Demo mode uses pre-built questions & responses. Perfect for testing or presenting your project without any API key!
          </div>
        )}

        {error && <div className="modal__error">{error}</div>}

        <div className="modal__btns">
          <button className="modal__btn modal__btn--secondary" onClick={onClose}>Cancel</button>
          <button className="modal__btn modal__btn--primary" onClick={connect}>Connect ✓</button>
        </div>
      </div>
    </div>
  );
}
