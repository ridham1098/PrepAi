const SYSTEM_PROMPTS = {
  dsa: "You are a senior software engineer conducting a DSA/coding interview. Ask one DSA question at a time (arrays, strings, trees, graphs, DP, sorting). After each answer, give brief feedback then ask the next question. Keep questions progressively harder. Be encouraging but rigorous. After 5 questions, give a final summary score.",
  hr: "You are an experienced HR interviewer. Ask behavioral and situational questions one at a time. After each answer, give brief feedback using the STAR method and ask the next question. Be warm but professional. After 5 questions, give a final assessment.",
  system: "You are a principal engineer conducting a system design interview. Ask one system design question and guide the candidate through requirements, high-level design, database, scaling, and edge cases. Ask follow-up questions based on their answers.",
};

const FEEDBACK_PROMPT = (answer, type) =>
  `Analyze this interview answer and return ONLY valid JSON (no markdown, no backticks):
{"correctness":85,"clarity":78,"depth":72,"tip":"One specific improvement tip in 1-2 sentences"}
Answer: "${answer.substring(0, 300)}"
Interview type: ${type}`;

const QUESTIONS_PROMPT = (profile) =>
  `Based on this candidate profile, generate 5 interview questions. Return ONLY a valid JSON array (no markdown):
[{"question":"...","type":"Technical"},{"question":"...","type":"HR"},{"question":"...","type":"System Design"}]
Types allowed: Technical, HR, System Design
Profile: ${profile.substring(0, 600)}`;

// ── Gemini ──────────────────────────────────────────────────────────────────
async function geminiChat(apiKey, systemPrompt, history) {
  const contents =
    history.length > 0
      ? history.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))
      : [{ role: 'user', parts: [{ text: 'Start the interview. Ask your first question.' }] }];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 400, temperature: 0.8 },
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

async function geminiFeedback(apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.3 },
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
}

// ── OpenAI ──────────────────────────────────────────────────────────────────
async function openaiChat(apiKey, systemPrompt, history) {
  const messages = [{ role: 'system', content: systemPrompt }];
  if (history.length === 0) messages.push({ role: 'user', content: 'Start the interview. Ask your first question.' });
  else messages.push(...history);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 400, temperature: 0.8 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || 'No response';
}

// ── Groq ─────────────────────────────────────────────────────────────────────
async function groqChat(apiKey, systemPrompt, history) {
  const messages = [{ role: 'system', content: systemPrompt }];
  if (history.length === 0) messages.push({ role: 'user', content: 'Start the interview. Ask your first question.' });
  else messages.push(...history);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 400, temperature: 0.8 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.message || 'Groq error');
  return data.choices?.[0]?.message?.content || 'No response';
}

async function opengroqFeedback(apiKey, prompt, isGroq) {
  const url = isGroq
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';
  const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], max_tokens: 150, temperature: 0.3 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error?.message);
  return data.choices?.[0]?.message?.content || '{}';
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function sendChat(provider, apiKey, interviewType, history) {
  const sp = SYSTEM_PROMPTS[interviewType];
  if (provider === 'gemini') return geminiChat(apiKey, sp, history);
  if (provider === 'openai') return openaiChat(apiKey, sp, history);
  if (provider === 'groq')   return groqChat(apiKey, sp, history);
  throw new Error('Unknown provider');
}

export async function getFeedback(provider, apiKey, answer, interviewType) {
  const prompt = FEEDBACK_PROMPT(answer, interviewType);
  let raw = '{}';
  if (provider === 'gemini') raw = await geminiFeedback(apiKey, prompt);
  else raw = await opengroqFeedback(apiKey, prompt, provider === 'groq');
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function generateQuestionsAI(provider, apiKey, profile) {
  const prompt = QUESTIONS_PROMPT(profile);
  let raw = '[]';
  if (provider === 'gemini') raw = await geminiFeedback(apiKey, prompt);
  else raw = await opengroqFeedback(apiKey, prompt, provider === 'groq');
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
