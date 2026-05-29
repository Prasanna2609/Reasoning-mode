const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const MODEL = import.meta.env.VITE_API_MODEL;

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function callAPI(systemPrompt, messages) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Exported API functions ───────────────────────────────────────────────────

export async function generateResponse(messages) {
  const systemPrompt =
    'You are a helpful assistant. When your response contains a recommendation, ' +
    'a number used as evidence, a percentage, a benchmark, or a course of action ' +
    '— your response is evaluative. Always return ONLY valid JSON with no markdown, ' +
    'no preamble:\n' +
    '{"evaluative": true, "response": "your full response text"}\n' +
    'For non-evaluative responses return:\n' +
    '{"evaluative": false, "response": "your response text"}';

  const raw = await callAPI(systemPrompt, messages);
  const parsed = safeParseJSON(raw);

  if (!parsed) {
    return { evaluative: false, response: raw };
  }
  if (parsed.response === undefined || parsed.response === null) {
    return { evaluative: false, response: '' };
  }
  return { evaluative: parsed.evaluative ?? false, response: parsed.response };
}

export async function analyseResponse(userMessage, responseText) {
  const systemPrompt =
    'You receive a user message and an AI response. Return ONLY valid JSON, ' +
    'no markdown, no preamble:\n' +
    '{"inference_flags":[{"quote":"","basis":"","missing":""}],' +
    '"assumptions":[{"quote":"","fills":"","if_wrong":""}],' +
    '"dependencies":[{"quote":"","conditions":[]}],"gaps":[]}\n' +
    'RULES: INFERENCE — any number, benchmark, percentage or rate the user did not ' +
    'provide. ASSUMPTION — any characterisation of the user\'s situation beyond what ' +
    'they stated. DEPENDENCY — only if removing one condition reverses the recommendation ' +
    'entirely. GAPS — top 3 missing inputs that would most change the recommendation. ' +
    'All arrays default to [] if nothing qualifies. Gaps maximum 3 items.';

  const raw = await callAPI(systemPrompt, [
    { role: 'user', content: `User message: ${userMessage}\n\nAI response: ${responseText}` },
  ]);

  const parsed = safeParseJSON(raw);

  if (!parsed) {
    return { inference_flags: [], assumptions: [], dependencies: [], gaps: [] };
  }

  return {
    inference_flags: Array.isArray(parsed.inference_flags) ? parsed.inference_flags : [],
    assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
    dependencies: Array.isArray(parsed.dependencies) ? parsed.dependencies : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps : [],
  };
}

export async function correctResponse(originalResponse, correction) {
  const systemPrompt =
    'The user is correcting a recommendation. Update it based on their correction. ' +
    'Return ONLY valid JSON, no markdown:\n' +
    '{"response":"updated recommendation","change_receipt":' +
    '{"changed":[],"unchanged":[],"still_open":[]}}';

  const raw = await callAPI(systemPrompt, [
    {
      role: 'user',
      content: `Original response: ${originalResponse}\n\nUser correction: ${correction}`,
    },
  ]);

  const parsed = safeParseJSON(raw);

  if (!parsed) {
    return { response: '', change_receipt: { changed: [], unchanged: [], still_open: [] } };
  }

  const receipt = parsed.change_receipt || {};
  return {
    response: parsed.response ?? '',
    change_receipt: {
      changed: Array.isArray(receipt.changed) ? receipt.changed : [],
      unchanged: Array.isArray(receipt.unchanged) ? receipt.unchanged : [],
      still_open: Array.isArray(receipt.still_open) ? receipt.still_open : [],
    },
  };
}
