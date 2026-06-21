export const DEMO_RESPONSES = {
  dsa: [
    "Let's start! 🚀 Given an unsorted array of integers, find two numbers that add up to a target sum. What approach would you use and what's the time complexity?",
    "Nice answer! Now — if the array is already sorted, what's the most optimal approach and why? Think about space complexity too.",
    "Excellent! Here's a tree problem: Given a binary tree, how would you check if it is a valid BST? Walk me through your approach step by step.",
    "Great! Implement an LRU Cache with O(1) get and put operations. What data structures would you combine and why?",
    "Outstanding performance! 🎉 Final question: Explain the difference between BFS and DFS. When would you use each one? Give a real-world example.",
  ],
  hr: [
    "Hello! 👋 Let's begin your HR round. Start with the classic: Tell me about yourself — your background, projects, and why you're passionate about software engineering.",
    "Great introduction! Now — describe a situation where you faced a significant technical challenge. How did you approach it, and what did you learn?",
    "Excellent! Where do you see yourself in 5 years? How does this role align with your long-term career goals?",
    "Good! Describe a time you had a conflict with a teammate. How did you handle it, and what was the outcome?",
    "Well done! 🎉 Final question: Why should we hire you over other candidates? What's your unique value proposition?",
  ],
  system: [
    "Welcome to System Design! 🏗️ Let's design Twitter. Start by clarifying requirements — what features would you prioritize for the MVP?",
    "Good requirements gathering! Twitter handles 500M tweets/day. How would you design the database schema? SQL vs NoSQL — which and why?",
    "Excellent! How would you handle feed generation? Compare fan-out on write vs fan-out on read approaches and their trade-offs.",
    "Great analysis! How would you design the real-time notification system for millions of concurrent users?",
    "Very impressive! 🎉 Final: How would you handle celebrity accounts with 100M+ followers differently in your system design?",
  ],
};

export const DEMO_FEEDBACK = [
  { correctness: 85, clarity: 78, depth: 72, tip: "Mention time & space complexity upfront before diving into your solution." },
  { correctness: 90, clarity: 85, depth: 80, tip: "Great! Consider edge cases like empty arrays or duplicate values." },
  { correctness: 75, clarity: 88, depth: 65, tip: "Good communication! Add more depth — cite specific algorithms by name." },
  { correctness: 92, clarity: 90, depth: 88, tip: "Outstanding! Discuss trade-offs between approaches to show senior thinking." },
];

export const DEMO_QUESTIONS = [
  { question: "You mentioned a real-time app. How did you handle WebSocket disconnections and message delivery guarantees?", type: "Technical" },
  { question: "Describe a challenging bug you encountered in your projects. How did you debug and resolve it?", type: "HR" },
  { question: "Explain the virtual DOM in React and how reconciliation works under the hood.", type: "Technical" },
  { question: "How would you scale your application to handle 1 million concurrent users?", type: "System Design" },
  { question: "Tell me about a time you had to learn a new technology quickly. How did you approach it?", type: "HR" },
];

export const RECENT_SESSIONS = [
  { name: "DSA — Arrays & Strings", time: "Today, 10:30 AM", score: 82, color: "var(--accent)", scoreBg: "rgba(99,102,241,0.15)", scoreColor: "var(--accent2)" },
  { name: "HR — Tell me about yourself", time: "Yesterday, 4:15 PM", score: 91, color: "var(--green)", scoreBg: "rgba(16,185,129,0.15)", scoreColor: "var(--green)" },
  { name: "System Design — Twitter", time: "2 days ago", score: 65, color: "var(--orange)", scoreBg: "rgba(245,158,11,0.15)", scoreColor: "var(--orange)" },
];

export const SKILL_SCORES = [
  { name: "Arrays & Strings",    score: 92, color: "var(--green)" },
  { name: "Trees & Graphs",      score: 74, color: "var(--accent2)" },
  { name: "Dynamic Programming", score: 58, color: "var(--orange)" },
  { name: "Sorting & Searching", score: 88, color: "var(--green)" },
  { name: "Recursion",           score: 70, color: "var(--accent2)" },
  { name: "System Design",       score: 62, color: "var(--orange)" },
];

export const WEEKLY_DATA = [3, 5, 2, 6, 4, 1, 2];
export const HEATMAP_DATA = [0,1,1,2,3,2,1,0,1,2,3,3,2,1,0,1,2,1,3,2,1,0,1,3,2,1,0,1,2,1,0,1,2,1,3];
