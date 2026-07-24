import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_RESPONSES } from '../data/demoData.js';
import { sendChat, getFeedback } from '../data/aiService.js';
import { evaluateAnswer } from '../utils/answerEvaluator.js';

const TYPES = [
  { id: 'dsa',    label: '💻 DSA / Coding' },
  { id: 'hr',     label: '🤝 HR Behavioral' },
  { id: 'system', label: '🏗️ System Design' },
];
const TYPE_LABELS = { dsa: 'DSA', hr: 'HR Round', system: 'System Design' };

// ── Anti-Cheat Warning Popup ──────────────────────────────────────────────
function AntiCheatWarning({ warning, onDismiss }) {
  if (!warning) return null;
  const isTabSwitch = warning.type === 'tab';
  const isCopy      = warning.type === 'copy';

  const icon    = isTabSwitch ? '🚨' : isCopy ? '📋' : '⌨️';
  const title   = isTabSwitch
    ? 'Tab Switch Detected!'
    : isCopy
    ? 'Copy Attempt Detected!'
    : 'Suspicious Key Detected!';

  return (
    <div className="anticheat-overlay" onClick={onDismiss}>
      <div className="anticheat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="anticheat-icon">{icon}</div>
        <div className="anticheat-title">{title}</div>
        <div className="anticheat-msg">
          ⚠️ <strong>Inappropriate behaviour detected!</strong><br />
          {warning.message}
        </div>
        <div className="anticheat-count">
          Violation #{warning.count} recorded
        </div>
        <button className="anticheat-btn" onClick={onDismiss}>
          I Understand — Continue Interview
        </button>
      </div>
    </div>
  );
}

// ── Anti-Cheat Banner (always visible during interview) ───────────────────
function AntiCheatBanner({ violations }) {
  return (
    <div className={`anticheat-banner ${violations > 0 ? 'anticheat-banner--warn' : ''}`}>
      <span className="anticheat-banner__dot" />
      {violations === 0
        ? '🔒 Anti-Cheat Active — Tab switches & copy actions are monitored'
        : `⚠️ ${violations} violation${violations > 1 ? 's' : ''} recorded — Your behaviour is being monitored`}
    </div>
  );
}

function Message({ role, text, onBookmark, bookmarked }) {
  return (
    <div className={`msg ${role === 'user' ? 'msg--user' : ''}`}>
      <div className={`msg__av ${role === 'ai' ? 'msg__av--ai' : 'msg__av--user'}`}>
        {role === 'ai' ? 'AI' : 'Me'}
      </div>
      <div>
        <div
          className={`msg__bubble ${role === 'ai' ? 'msg__bubble--ai' : 'msg__bubble--user'}`}
          dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br/>') }}
        />
        {role === 'ai' && onBookmark && (
          <div className="msg__actions">
            <button
              className={`bookmark-btn ${bookmarked ? 'bookmark-btn--active' : ''}`}
              onClick={onBookmark}
              title={bookmarked ? 'Bookmarked' : 'Bookmark this question'}
            >
              {bookmarked ? '★ Saved' : '☆ Save question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg">
      <div className="msg__av msg__av--ai">AI</div>
      <div className="msg__bubble msg__bubble--ai">
        <div className="typing"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function FeedbackPanel({ feedback }) {
  if (!feedback) return (
    <div className="feedback-empty">Answer a question to see your live feedback here</div>
  );
  return (
    <div className="feedback-metrics">
      {[
        { key: 'correctness', label: 'Correctness', color: 'var(--accent)' },
        { key: 'clarity',     label: 'Clarity',     color: 'var(--green)' },
        { key: 'depth',       label: 'Depth',        color: 'var(--orange)' },
      ].map(({ key, label, color }) => (
        <div className="metric" key={key}>
          <div className="metric__top">
            <span className="metric__name">{label}</span>
            <span className="metric__score" style={{ color }}>{feedback[key]}%</span>
          </div>
          <div className="metric__bar">
            <div className="metric__fill" style={{ width: `${feedback[key]}%`, background: color }} />
          </div>
        </div>
      ))}
      {feedback.tip && (
        <div className="ai-tip">
          <div className="ai-tip__label">💡 AI Tip</div>
          <div className="ai-tip__text">{feedback.tip}</div>
        </div>
      )}
    </div>
  );
}

export default function Interview() {
  const navigate = useNavigate();
  const {
    apiKey, provider, demoMode,
    practiceQuestion, setPracticeQuestion,
    addHistorySession, toggleBookmark, isBookmarked,
  } = useApp();

  const [interviewType, setInterviewType] = useState('dsa');
  const [messages, setMessages]           = useState([]);
  const [history, setHistory]             = useState([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [feedback, setFeedback]           = useState(null);
  const [feedbackLog, setFeedbackLog]     = useState([]); // for end-of-session scoring
  const [saved, setSaved]                 = useState(false);

  // ── Code Editor (for DSA / coding questions) ──
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode]           = useState('// Apna JavaScript solution yahan likho\n');
  const [runOutput, setRunOutput] = useState(null); // { type: 'success' | 'error', text }
  const [codeTested, setCodeTested] = useState(false);

  // ── Anti-Cheat State ──
  const [warning, setWarning]         = useState(null);
  const [violations, setViolations]   = useState(0);
  const violationRef                  = useRef(0);

  const msgsRef    = useRef(null);
  const inputRef   = useRef(null);
  const demoIdxRef = useRef(0);

  const scrollBottom = () => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  };
  useEffect(() => { scrollBottom(); }, [messages, loading]);

  // ── Anti-Cheat: Tab Switch Detection ─────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        violationRef.current += 1;
        setViolations(violationRef.current);
        setWarning({
          type: 'tab',
          count: violationRef.current,
          message: 'You tried to switch tabs or minimize the window during the interview. This behaviour has been recorded and will affect your evaluation.',
        });
      }
    };

    const handleBlur = () => {
      violationRef.current += 1;
      setViolations(violationRef.current);
      setWarning({
        type: 'tab',
        count: violationRef.current,
        message: 'You switched away from the interview window. Leaving the interview screen is not allowed and has been flagged.',
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // ── Anti-Cheat: Copy / Paste / Right-Click Detection ─────────────────────
  useEffect(() => {
    const handleCopy = (e) => {
      e.preventDefault();
      violationRef.current += 1;
      setViolations(violationRef.current);
      setWarning({
        type: 'copy',
        count: violationRef.current,
        message: 'Copying content during an interview is not allowed. This action has been recorded.',
      });
    };

    const handlePaste = (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      violationRef.current += 1;
      setViolations(violationRef.current);
      setWarning({
        type: 'copy',
        count: violationRef.current,
        message: 'Pasting external content is not allowed during the interview.',
      });
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      violationRef.current += 1;
      setViolations(violationRef.current);
      setWarning({
        type: 'copy',
        count: violationRef.current,
        message: 'Right-clicking during the interview is not permitted. This has been flagged.',
      });
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // ── Anti-Cheat: Suspicious Key Combinations ───────────────────────────────
  useEffect(() => {
    const BLOCKED_KEYS = [
      { combo: (e) => e.ctrlKey && e.key === 'c',   label: 'Ctrl+C (Copy)' },
      { combo: (e) => e.ctrlKey && e.key === 'v',   label: 'Ctrl+V (Paste)' },
      { combo: (e) => e.altKey  && e.key === 'Tab', label: 'Alt+Tab (Switch Window)' },
      { combo: (e) => e.key === 'F12',              label: 'F12 (DevTools)' },
      { combo: (e) => e.ctrlKey && e.shiftKey && e.key === 'I', label: 'DevTools Shortcut' },
      { combo: (e) => e.ctrlKey && e.key === 'u',   label: 'Ctrl+U (View Source)' },
    ];

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' && !e.altKey && e.key !== 'F12') return;

      const blocked = BLOCKED_KEYS.find((k) => k.combo(e));
      if (blocked) {
        e.preventDefault();
        violationRef.current += 1;
        setViolations(violationRef.current);
        setWarning({
          type: 'key',
          count: violationRef.current,
          message: `You pressed "${blocked.label}" which is not allowed during the interview. This action has been flagged as inappropriate behaviour.`,
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Interview Logic ───────────────────────────────────────────────────────
  const addAiMessage = (text) => {
    setMessages((prev) => [...prev, { role: 'ai', text }]);
    setQuestionCount((c) => c + 1);
  };

  const startSession = useCallback(async () => {
    setMessages([]); setHistory([]); setFeedback(null);
    setQuestionCount(0); demoIdxRef.current = 0;
    setFeedbackLog([]); setSaved(false);
    setShowCodeEditor(false); setRunOutput(null); setCodeTested(false);
    setCode('// Apna JavaScript solution yahan likho\n');
    setLoading(true);

    // If user arrived here via "Practice this" from Resume/Bookmarks page,
    // open the session with that exact question.
    if (practiceQuestion) {
      const q = practiceQuestion.question;
      setTimeout(() => {
        addAiMessage(q);
        setHistory([{ role: 'assistant', content: q }]);
        setPracticeQuestion(null);
        setLoading(false);
      }, 400);
      return;
    }

    if (demoMode) {
      setTimeout(() => {
        const first = DEMO_RESPONSES[interviewType][0];
        addAiMessage(first);
        setHistory([{ role: 'assistant', content: first }]);
        demoIdxRef.current = 1;
        setLoading(false);
      }, 800);
    } else {
      try {
        const text = await sendChat(provider, apiKey, interviewType, []);
        addAiMessage(text);
        setHistory([{ role: 'assistant', content: text }]);
      } catch (e) {
        addAiMessage(`⚠️ Error: ${e.message}\n\nCheck your API key in Settings → AI Provider.`);
      }
      setLoading(false);
    }
  }, [interviewType, demoMode, provider, apiKey]); // eslint-disable-line

  useEffect(() => { startSession(); }, [interviewType]); // eslint-disable-line

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;
    if (!overrideText) setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    const newHistory = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setLoading(true);

    if (demoMode) {
      // Pehle yeh random feedback deta tha — galat answer pe bhi high score dikhta tha.
      // Ab answer ki length/keywords/quality dekh kar realistic score deta hai.
      const fb = evaluateAnswer(text, interviewType);
      setFeedback(fb);
      setFeedbackLog((prev) => [...prev, fb]);
    } else {
      getFeedback(provider, apiKey, text, interviewType)
        .then((fb) => { setFeedback(fb); setFeedbackLog((prev) => [...prev, fb]); })
        .catch(() => {});
    }

    if (demoMode) {
      setTimeout(() => {
        const idx  = Math.min(demoIdxRef.current, DEMO_RESPONSES[interviewType].length - 1);
        const resp = DEMO_RESPONSES[interviewType][idx];
        addAiMessage(resp);
        setHistory((h) => [...h, { role: 'assistant', content: resp }]);
        demoIdxRef.current += 1;
        setLoading(false);
      }, 1000);
    } else {
      try {
        const resp = await sendChat(provider, apiKey, interviewType, newHistory);
        addAiMessage(resp);
        setHistory((h) => [...h, { role: 'assistant', content: resp }]);
      } catch (e) {
        addAiMessage(`⚠️ Error: ${e.message}`);
      }
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Code Editor: Run / Test the code in-browser ────────────────────────────
  const runCode = () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      fn();
      setRunOutput({
        type: 'success',
        text: logs.length ? logs.join('\n') : '✅ Code ran successfully with no errors (no console output).',
      });
      setCodeTested(true);
    } catch (e) {
      setRunOutput({ type: 'error', text: `❌ Error: ${e.message}` });
      setCodeTested(false);
    } finally {
      console.log = originalLog;
    }
  };

  // ── Code Editor: Submit tested code as the chat answer ──────────────────────
  const submitCode = () => {
    if (!codeTested || loading) return;
    const codeBlock = `\`\`\`js\n${code}\n\`\`\`\n\n✅ Code tested successfully — submitting this as my answer.`;
    handleSend(codeBlock);
    setCode('// Apna JavaScript solution yahan likho\n');
    setRunOutput(null);
    setCodeTested(false);
    setShowCodeEditor(false);
  };

  // ── Save session to History & Progress Tracker ────────────────────────────
  const handleEndSession = () => {
    if (messages.length === 0) return;
    const avg = (key) =>
      feedbackLog.length === 0
        ? 0
        : Math.round(feedbackLog.reduce((s, f) => s + (f[key] || 0), 0) / feedbackLog.length);

    const avgCorrectness = avg('correctness');
    const avgClarity     = avg('clarity');
    const avgDepth       = avg('depth');
    const score = feedbackLog.length === 0
      ? 0
      : Math.round((avgCorrectness + avgClarity + avgDepth) / 3);

    addHistorySession({
      type: interviewType,
      typeLabel: TYPE_LABELS[interviewType],
      title: `${TYPE_LABELS[interviewType]} Interview`,
      score,
      avgCorrectness,
      avgClarity,
      avgDepth,
      questionCount,
      violations,
      messages,
    });
    setSaved(true);
  };

  return (
    <div className="interview fade-in">
      {/* Anti-Cheat Banner */}
      <AntiCheatBanner violations={violations} />

      <div className="interview__wrap">
        {/* Chat panel */}
        <div className="chat-panel">
          <div className="chat-panel__header">
            <div className="chat-panel__header-left">
              <div className="ai-indicator">
                <span className="ai-indicator__dot" />
                AI Interviewer
              </div>
              <span className="badge badge--accent">{TYPE_LABELS[interviewType]}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {violations > 0 && (
                <span className="violation-badge">⚠️ {violations} Violation{violations > 1 ? 's' : ''}</span>
              )}
              <span className="chat-panel__progress">Question {questionCount}</span>
              <button
                className="end-session-btn"
                onClick={handleEndSession}
                disabled={messages.length === 0 || saved}
              >
                {saved ? '✓ Saved to History' : '🏁 End Session & Save'}
              </button>
            </div>
          </div>

          <div className="chat-panel__msgs" ref={msgsRef}>
            {messages.map((m, i) => (
              <Message
                key={i}
                role={m.role}
                text={m.text}
                onBookmark={m.role === 'ai' ? () => toggleBookmark({ question: m.text, type: TYPE_LABELS[interviewType] }) : null}
                bookmarked={m.role === 'ai' ? isBookmarked(m.text) : false}
              />
            ))}
            {loading && <TypingIndicator />}
          </div>

          {interviewType === 'dsa' && (
            <div className="code-editor-toggle-row">
              <button
                className="code-editor-toggle-btn"
                onClick={() => setShowCodeEditor((v) => !v)}
              >
                {showCodeEditor ? '✕ Close Code Editor' : '💻 Open Code Editor'}
              </button>
            </div>
          )}

          {showCodeEditor && (
            <div className="code-editor-panel">
              <div className="code-editor-panel__label">JavaScript Code Editor — code likho, Run karke test karo</div>
              <textarea
                className="code-editor-textarea"
                value={code}
                onChange={(e) => { setCode(e.target.value); setCodeTested(false); setRunOutput(null); }}
                spellCheck={false}
                rows={8}
              />
              <div className="code-editor-actions">
                <button className="code-run-btn" onClick={runCode} disabled={loading}>
                  ▶ Run & Test
                </button>
                <button className="code-submit-btn" onClick={submitCode} disabled={!codeTested || loading}>
                  ✅ Submit Code
                </button>
              </div>
              {runOutput && (
                <div className={`code-output code-output--${runOutput.type}`}>
                  {runOutput.text}
                </div>
              )}
              {!codeTested && runOutput?.type !== 'error' && !runOutput && (
                <div className="code-editor-hint">Run the code first—if an error occurs, fix it and test again; only then will the submit option be enabled..</div>
              )}
            </div>
          )}

          <div className="chat-panel__input-row">
            <textarea
              ref={inputRef}
              className="chat-panel__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
              rows={1}
            />
            <button
              className="chat-panel__send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="interview__right">
          <div className="panel-card">
            <div className="panel-card__title">Interview Type</div>
            <div className="type-selector">
              {TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`type-btn ${interviewType === t.id ? 'type-btn--sel' : ''}`}
                  onClick={() => setInterviewType(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-card__title">Live Feedback</div>
            <FeedbackPanel feedback={feedback} />
          </div>

          {/* Violation Log */}
          {violations > 0 && (
            <div className="panel-card violation-log">
              <div className="panel-card__title" style={{ color: 'var(--red)' }}>
                🚨 Violation Log
              </div>
              <div className="violation-log__count">
                {violations} suspicious action{violations > 1 ? 's' : ''} detected
              </div>
              <div className="violation-log__note">
                This report will be included in your interview summary.
              </div>
            </div>
          )}

          {saved && (
            <div className="panel-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <div className="panel-card__title" style={{ color: 'var(--green)' }}>✅ Session Saved</div>
              <button className="q-card__practice-btn" onClick={() => navigate('/history')}>
                View in History →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Anti-Cheat Warning Popup */}
      <AntiCheatWarning warning={warning} onDismiss={() => setWarning(null)} />
    </div>
  );
}
