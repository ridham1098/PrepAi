import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { DEMO_QUESTIONS } from '../data/demoData.js';
import { generateQuestionsAI } from '../data/aiService.js';
import { exportQuestionsAsPDF } from '../utils/pdfExport.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth/mammoth.browser';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

// Master list of skills jo detect karni hain — apni marzi se expand kar sakta hai
const SKILL_KEYWORDS = [
  'React.js', 'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python',
  'Java', 'C++', 'MongoDB', 'MySQL', 'PostgreSQL', 'Firebase',
  'REST APIs', 'GraphQL', 'Git', 'Docker', 'AWS', 'HTML', 'CSS',
  'Tailwind', 'Redux', 'Express.js', 'Next.js', 'Vue.js', 'Angular'
];

// Actual text se skills detect karne wala function
function detectSkillsFromText(text) {
  const lowerText = text.toLowerCase();

  const found = SKILL_KEYWORDS.filter((skill) => {
    // Escape special regex chars (jaise C++ mein ++ hai)
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Word boundary use karo taaki "java" "javascript" ke andar match na ho
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(lowerText);
  });

  return [...new Set(found)];
}

// PDF se text extract karna
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return fullText;
}

// DOCX se text extract karna
async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

const TYPE_CLASS = { Technical: 'qt-tech', HR: 'qt-hr', 'System Design': 'qt-sd' };
const TYPE_FILTERS = ['All', 'Technical', 'HR', 'System Design'];

function QuestionCard({ q, index, onPractice }) {
  const { isBookmarked, toggleBookmark } = useApp();
  const bookmarked = isBookmarked(q.question);

  return (
    <div className="q-card">
      <div className="q-card__top">
        <div className="q-card__text">{index + 1}. {q.question}</div>
        <div className="q-card__top-actions">
          <button
            className={`bookmark-btn ${bookmarked ? 'bookmark-btn--active' : ''}`}
            onClick={() => toggleBookmark(q)}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
          >
            {bookmarked ? '★' : '☆'}
          </button>
          <span className={`q-tag ${TYPE_CLASS[q.type] || 'qt-tech'}`}>{q.type}</span>
        </div>
      </div>
      <button className="q-card__practice-btn" onClick={() => onPractice(q)}>
        Practice this →
      </button>
    </div>
  );
}

export default function Resume() {
  const navigate = useNavigate();
  const { apiKey, provider, demoMode, setPracticeQuestion } = useApp();

  const [fileName, setFileName] = useState('');
  const [skills, setSkills] = useState([]);
  const [profile, setProfile] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [resumeLoaded, setResumeLoaded] = useState(false); // ✅ ab component ke andar hai

  // ── Search / Filter state ──
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const handlePractice = (q) => {
    setPracticeQuestion(q);
    navigate('/interview');
  };

  const processFile = async (file) => {
    setFileName(file.name);
    setSkills([]);
    setProfile('');
    setResumeLoaded(false);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        extractedText = await extractTextFromDocx(file);
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        alert('Sirf PDF, DOCX ya TXT files supported hain!');
        return;
      }

      const detectedSkills = detectSkillsFromText(extractedText);
      setSkills(detectedSkills.length > 0 ? detectedSkills : ['No matching skills detected']);
      setResumeLoaded(true);
    } catch (err) {
      console.error('File parsing error:', err);
      alert('Resume parse karne mein error aayi. Dobara try karo.');
    }
  };

  const handleFile = async (e) => { if (e.target.files[0]) await processFile(e.target.files[0]); };
  const handleDrop = async (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) await processFile(e.dataTransfer.files[0]); };

  const generate = async () => {
    if (!profile.trim()) { alert('Please describe your background first!'); return; }
    setLoading(true);
    try {
      if (demoMode || !apiKey) {
        await new Promise((r) => setTimeout(r, 1500));
        setQuestions(DEMO_QUESTIONS);
      } else {
        const qs = await generateQuestionsAI(provider, apiKey, profile);
        setQuestions(qs);
      }
    } catch { setQuestions(DEMO_QUESTIONS); }
    setLoading(false);
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesType = typeFilter === 'All' || q.type === typeFilter;
      const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [questions, search, typeFilter]);

  const handleExportPDF = () => {
    exportQuestionsAsPDF({
      title: 'AI-Generated Interview Questions',
      subtitle: profile ? profile.substring(0, 140) : '',
      questions: filteredQuestions,
    });
  };

  return (
    <div className="resume fade-in">
      <div className="resume__grid">
        {/* Left column */}
        <div>
          <div
            className={`upload-zone ${dragOver ? 'upload-zone--drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <div className="upload-zone__icon">📄</div>
            <div className="upload-zone__title">
              {fileName ? `✅ ${fileName}` : 'Drop your resume here'}
            </div>
            <div className="upload-zone__sub">PDF, DOCX or TXT supported</div>
            <button className="upload-zone__btn" onClick={(e) => e.stopPropagation()}>Browse File</button>
            <input type="file" id="file-input" style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt" onChange={handleFile} />
          </div>

          {skills.length > 0 && (
            <div className="resume__skills-card">
              <div className="resume__skills-title">Detected Skills</div>
              <div className="resume__skills">
                {skills.map((s) => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          )}

          <div className="resume__desc-card">
            <div className="resume__desc-title">Or describe your background</div>
            <textarea
              className="resume__desc-input"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="e.g. CSE final year, React & Node.js, internship at TechCorp, built real-time chat app using WebSockets..."
            />
            <button className="resume__gen-btn" onClick={generate} disabled={loading}>
              {loading ? <><span className="spinner" />Generating...</> : '✨ Generate AI Questions'}
            </button>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="resume__results-header">
            <div className="section-title" style={{ marginBottom: 0 }}>AI-Generated Questions</div>
            {questions.length > 0 && (
              <button className="export-pdf-btn" onClick={handleExportPDF} disabled={filteredQuestions.length === 0}>
                📄 Export as PDF
              </button>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="resume__empty">
              Describe your background or upload your resume to get personalized interview questions 🎯
            </div>
          ) : (
            <>
              <div className="filter-bar">
                <input
                  className="filter-bar__search"
                  type="text"
                  placeholder="🔍 Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="filter-bar__select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {TYPE_FILTERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {filteredQuestions.length === 0 ? (
                <div className="filter-empty">No questions match your search/filter 🔎</div>
              ) : (
                <div className="q-list">
                  {filteredQuestions.map((q, i) => (
                    <QuestionCard key={i} q={q} index={i} onPractice={handlePractice} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}