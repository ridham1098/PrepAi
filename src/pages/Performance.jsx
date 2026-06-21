import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { SKILL_SCORES, WEEKLY_DATA, HEATMAP_DATA } from '../data/demoData.js';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HEATMAP_COLORS = ['var(--bg3)', 'rgba(99,102,241,0.3)', 'rgba(99,102,241,0.6)', 'var(--accent)'];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function Performance() {
  const { history } = useApp();
  const hasHistory = history.length > 0;

  // ── Score by Category — real avg score per interview type from saved sessions ──
  const categoryScores = useMemo(() => {
    if (!hasHistory) {
      return [
        { label: 'DSA',        val: 78, color: 'var(--accent)' },
        { label: 'HR',         val: 91, color: 'var(--green)' },
        { label: 'Sys Design', val: 62, color: 'var(--orange)' },
        { label: 'Overall',    val: 77, color: 'var(--pink)' },
      ];
    }
    const byType = { dsa: [], hr: [], system: [] };
    history.forEach((h) => { if (byType[h.type]) byType[h.type].push(h.score || 0); });
    const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    const overall = avg(history.map((h) => h.score || 0));
    return [
      { label: 'DSA',        val: avg(byType.dsa),    color: 'var(--accent)' },
      { label: 'HR',         val: avg(byType.hr),     color: 'var(--green)' },
      { label: 'Sys Design', val: avg(byType.system), color: 'var(--orange)' },
      { label: 'Overall',    val: overall,            color: 'var(--pink)' },
    ];
  }, [history, hasHistory]);

  // ── Feedback Breakdown — real avg correctness/clarity/depth across sessions ──
  const feedbackBreakdown = useMemo(() => {
    if (!hasHistory) return SKILL_SCORES;
    const withFeedback = history.filter((h) => h.avgCorrectness !== undefined && h.questionCount > 0);
    if (withFeedback.length === 0) return SKILL_SCORES;
    const avg = (key) => Math.round(withFeedback.reduce((s, h) => s + (h[key] || 0), 0) / withFeedback.length);
    return [
      { name: 'Correctness', score: avg('avgCorrectness'), color: 'var(--green)' },
      { name: 'Clarity',     score: avg('avgClarity'),     color: 'var(--accent2)' },
      { name: 'Depth',       score: avg('avgDepth'),       color: 'var(--orange)' },
    ];
  }, [history, hasHistory]);

  // ── Weekly Sessions — real session count per weekday, last 7 days ──
  const weeklyData = useMemo(() => {
    if (!hasHistory) return WEEKLY_DATA;
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon..Sun
    const today = startOfDay(new Date());
    history.forEach((h) => {
      const d = startOfDay(new Date(h.date));
      const diffDays = Math.round((today - d) / 86400000);
      if (diffDays >= 0 && diffDays < 7) {
        const jsDay = d.getDay(); // 0=Sun..6=Sat
        const idx = jsDay === 0 ? 6 : jsDay - 1; // Mon=0..Sun=6
        counts[idx] += 1;
      }
    });
    return counts;
  }, [history, hasHistory]);

  // ── Activity Heatmap — real session density, last 35 days ──
  const heatmapData = useMemo(() => {
    if (!hasHistory) return HEATMAP_DATA;
    const days = 35;
    const today = startOfDay(new Date());
    const counts = new Array(days).fill(0);
    history.forEach((h) => {
      const d = startOfDay(new Date(h.date));
      const diffDays = Math.round((today - d) / 86400000);
      if (diffDays >= 0 && diffDays < days) {
        counts[days - 1 - diffDays] += 1;
      }
    });
    return counts.map((c) => (c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : 3));
  }, [history, hasHistory]);

  const maxWeekly = Math.max(1, ...weeklyData);

  return (
    <div className="performance fade-in">
      {!hasHistory && (
        <div className="filter-empty">
          📊 Yeh demo data hai — koi real interview history nahi mili abhi. Mock Interview complete karke
          "🏁 End Session &amp; Save" dabao — phir yeh charts tumhare real performance se update ho jaayenge.
        </div>
      )}

      <div className="perf-grid">
        {/* Score by Category */}
        <div className="perf-card">
          <div className="perf-card__title">Score by Category</div>
          {categoryScores.map((s) => (
            <div className="perf-bar-row" key={s.label}>
              <div className="perf-bar-label">{s.label}</div>
              <div className="perf-bar-track">
                <div className="perf-bar-fill" style={{ width: `${s.val}%`, background: s.color }} />
              </div>
              <div className="perf-bar-val">{s.val}%</div>
            </div>
          ))}
        </div>

        {/* Feedback Breakdown */}
        <div className="perf-card">
          <div className="perf-card__title">{hasHistory ? 'Feedback Breakdown' : 'DSA Skill Breakdown'}</div>
          {feedbackBreakdown.map((s) => (
            <div className="skill-row" key={s.name}>
              <span className="skill-row__name">{s.name}</span>
              <span className="skill-row__score" style={{ color: s.color }}>{s.score}%</span>
            </div>
          ))}
        </div>

        {/* Weekly Sessions */}
        <div className="perf-card">
          <div className="perf-card__title">Weekly Sessions</div>
          <div className="week-chart">
            {weeklyData.map((v, i) => (
              <div className="week-bar-wrap" key={i}>
                <div
                  className="week-bar"
                  style={{
                    height: `${(v / maxWeekly) * 70}px`,
                    background: i < 5 ? 'var(--accent)' : 'rgba(99,102,241,0.3)',
                  }}
                />
                <div className="week-day">{DAYS[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="perf-card" style={{ marginTop: 0 }}>
        <div className="perf-card__title">Activity Heatmap (Last 5 Weeks)</div>
        <div className="heatmap">
          {heatmapData.map((v, i) => (
            <div key={i} className="heatmap__cell" style={{ background: HEATMAP_COLORS[v] }} />
          ))}
        </div>
        <div className="heatmap__legend">
          <span className="heatmap__legend-label">Less</span>
          {HEATMAP_COLORS.map((c, i) => (
            <div key={i} className="heatmap__legend-dot" style={{ background: c }} />
          ))}
          <span className="heatmap__legend-label">More</span>
        </div>
      </div>
    </div>
  );
}
