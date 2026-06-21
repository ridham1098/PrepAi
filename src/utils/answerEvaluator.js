// src/utils/answerEvaluator.js
// Heuristic answer evaluation for Demo Mode (no AI key needed).
// Pehle yeh random feedback deta tha (galat answer pe bhi 90% dikha deta tha).
// Ab answer ki length, keywords aur "I don't know" type low-effort replies
// dekh kar realistic score deta hai.

const KEYWORDS = {
  dsa: [
    'array', 'string', 'time complexity', 'space complexity', 'o(n', 'o(1)', 'o(log',
    'hash', 'binary search', 'sort', 'tree', 'graph', 'recursion', 'dynamic programming',
    'two pointer', 'sliding window', 'stack', 'queue', 'linked list', 'complexity', 'algorithm',
    'edge case', 'iterate', 'loop',
  ],
  hr: [
    'team', 'challenge', 'learned', 'project', 'experience', 'communication', 'conflict',
    'goal', 'responsibility', 'deadline', 'collaborat', 'feedback', 'mentor', 'leadership',
    'situation', 'result', 'task', 'action',
  ],
  system: [
    'scale', 'database', 'cache', 'load balancer', 'api', 'microservice', 'latency',
    'throughput', 'availability', 'sharding', 'replication', 'queue', 'design', 'sql',
    'nosql', 'consistency', 'trade-off', 'tradeoff', 'bottleneck', 'horizontal', 'vertical',
  ],
};

const LOW_EFFORT_PHRASES = [
  "i don't know", 'i dont know', 'dunno', 'idk', 'no idea', 'not sure', 'pass', 'skip',
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function evaluateAnswer(text, interviewType) {
  const trimmed = (text || '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = trimmed.toLowerCase();

  const isLowEffort =
    wordCount < 4 || LOW_EFFORT_PHRASES.some((p) => lower.includes(p));

  if (isLowEffort) {
    return {
      correctness: randInt(5, 22),
      clarity: randInt(10, 25),
      depth: randInt(0, 15),
      tip: 'Yeh answer evaluate karne ke liye bahut chota hai — apna approach step-by-step explain karo, examples ke saath.',
    };
  }

  // Base score scales with answer length (diminishing, capped at 95)
  const lengthScore = Math.min(95, 28 + wordCount * 1.6);

  // Keyword relevance bonus (shows the answer actually discusses the topic)
  const keywords = KEYWORDS[interviewType] || [];
  const matched = keywords.filter((k) => lower.includes(k));
  const keywordBonus = Math.min(18, matched.length * 4.5);

  let correctness = Math.round(lengthScore * 0.55 + keywordBonus * 1.8 + randInt(-6, 6));
  let clarity      = Math.round(lengthScore * 0.7 + randInt(-7, 7));
  let depth        = Math.round(lengthScore * 0.45 + keywordBonus * 2.2 + randInt(-6, 6));

  correctness = clamp(correctness, 12, 97);
  clarity     = clamp(clarity, 12, 96);
  depth       = clamp(depth, 8, 95);

  const avg = (correctness + clarity + depth) / 3;
  let tip;
  if (avg < 35) {
    tip = 'Apna answer thoda aur detailed banao — step by step approach explain karo.';
  } else if (avg < 60) {
    tip = 'Achi shuruaat! Specific examples ya complexity/trade-offs mention karke answer strong karo.';
  } else if (avg < 80) {
    tip = 'Achha answer! Edge cases ya alternative approaches mention karoge to aur impressive lagega.';
  } else {
    tip = 'Excellent! Tumhara answer detailed aur well-structured hai. Yehi level maintain rakho.';
  }

  return { correctness, clarity, depth, tip };
}
