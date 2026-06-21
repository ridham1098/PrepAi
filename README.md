# 🎯 PrepAI — AI Interview Preparation Platform

A full React.js page/component-based AI interview prep platform with real interview history tracking, bookmarked questions, PDF export, and search/filter.

## 📁 Folder Structure

```
prepai/
├── public/
│   └── index.html
├── src/
│   ├── pages/                  ← One file per route/page
│   │   ├── AuthPage.jsx        ← Login / Signup
│   │   ├── Dashboard.jsx       ← Stats, category cards, recent sessions
│   │   ├── Interview.jsx       ← AI mock interview chat + anti-cheat
│   │   ├── Resume.jsx          ← Resume analyzer, search/filter, bookmark, PDF export
│   │   ├── Performance.jsx     ← Performance charts
│   │   ├── History.jsx         ← NEW: Interview history & progress tracker
│   │   └── Bookmarks.jsx       ← NEW: Saved/bookmarked questions
│   ├── components/             ← Reusable shared widgets
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── ApiModal.jsx
│   ├── context/
│   │   ├── AppContext.jsx      ← Global state: API key, provider, history, bookmarks
│   │   └── AuthContext.jsx     ← Firebase auth state
│   ├── data/
│   │   ├── aiService.js        ← All AI API calls (Gemini, OpenAI, Groq)
│   │   └── demoData.js         ← Demo responses & mock data
│   ├── firebase/
│   │   └── firebaseConfig.js
│   ├── styles/
│   │   └── main.css            ← Single global stylesheet (all CSS merged)
│   ├── utils/
│   │   └── pdfExport.js        ← NEW: Export questions as PDF
│   ├── App.jsx                 ← Routes (react-router-dom)
│   └── index.jsx                ← React entry point
├── vercel.json                  ← SPA rewrite rules (fixes 404 on deep links)
└── package.json
```

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open browser at http://localhost:3000
```

## 🆕 New Features

- **Proper routing** — react-router-dom with real URLs (`/dashboard`, `/interview`, `/resume`, `/performance`, `/history`, `/bookmarks`). `vercel.json` rewrites included so deep links don't 404 on Vercel.
- **Interview History & Progress Tracker** — every interview session can be saved (`🏁 End Session & Save`), stored in `localStorage`, viewable with full transcript, deletable, with aggregate stats on the Dashboard.
- **Bookmark / Save Questions** — bookmark any AI-generated question from Resume Analyzer or any question asked during a mock interview. Dedicated Bookmarks page with search + filter.
- **Export Resume Questions as PDF** — one-click PDF export of AI-generated interview questions (uses the browser's native print-to-PDF, zero extra dependencies).
- **Search & Filter Questions** — filter generated/bookmarked questions by type (Technical/HR/System Design) and free-text search.
- **Single global stylesheet** — all component CSS merged into `src/styles/main.css`.

## ⚡ AI Providers Supported

| Provider | Cost | Get Key |
| --- | --- | --- |
| 🤖 Gemini 1.5 Flash | FREE 1500/day | aistudio.google.com |
| 🧠 ChatGPT GPT-4o Mini | Paid ~$5 | platform.openai.com |
| ⚡ Groq (Llama 3.3) | FREE | console.groq.com |
| 🎮 Demo Mode | Free, no key | Built-in |

## 🏆 Best for Placements

This project shows:

- ✅ Page/component-based React architecture with React Router
- ✅ React Context API (global state, localStorage persistence)
- ✅ Real AI API integration
- ✅ Clean folder structure (pages vs reusable components)
- ✅ Single, organized global stylesheet
- ✅ Async/await API calls
- ✅ Custom hooks pattern
