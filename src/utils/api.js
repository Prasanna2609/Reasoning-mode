const BASE_URL = import.meta.env.DEV 
  ? '/api-proxy/openai/v1' 
  : 'https://api.groq.com/openai/v1';
const MODEL = 'llama-3.3-70b-versatile';

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function callAPI(systemPrompt, messages) {
  console.log(
    'Key length:', import.meta.env.VITE_API_KEY?.length,
    'Key prefix:', import.meta.env.VITE_API_KEY?.slice(0,7),
    'Key suffix:', import.meta.env.VITE_API_KEY?.slice(-4)
  );
  let response;
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1024
      })
    });
  } catch (networkError) {
    console.error('NETWORK ERROR:', networkError.message);
    throw new Error(`Network error: ${networkError.message}`);
  }

  if (response.ok !== undefined && !response.ok) {
    let errorBody = '';
    try { errorBody = await response.text(); } catch(e) {}
    console.error('API ERROR:', response.status, response.statusText, errorBody);
    throw new Error(`API ${response.status}: ${errorBody || response.statusText}`);
  }

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
    "You are a helpful assistant. When your response " +
    "contains a recommendation, a number used as evidence, " +
    "a percentage, a benchmark, or a course of action — " +
    "set evaluative to true. Format your response in " +
    "short paragraphs of 2-3 sentences each. Never write " +
    "a single wall-of-text paragraph. Use line breaks " +
    "between distinct points. Keep responses concise and " +
    "direct — under 200 words where possible. Always " +
    "return ONLY valid JSON with no markdown, no preamble:\n" +
    "{\"evaluative\": true, \"response\": \"your response\"} \n" +
    "For non-evaluative responses return:\n" +
    "{\"evaluative\": false, \"response\": \"your response\"}";

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
    "You receive a user message and an AI response. " +
    "Return ONLY valid JSON, no markdown, no preamble.\n\n" +
    "RULES FOR QUALITY:\n" +
    "- Every quote must be the EXACT phrase from the " +
    "response text — copy it character for character.\n" +
    "- Every insight must be specific to THIS user's " +
    "situation — not generic advice anyone would know.\n" +
    "- For inference flags: name the specific source type " +
    "and what data is missing from THIS user's context.\n" +
    "Example of BAD: 'General industry data'\n" +
    "Example of GOOD: 'SaaS benchmark from 2022 " +
    "Bessemer report — not calibrated to B2B fintech " +
    "at seed stage'\n" +
    "- For assumptions: name exactly what was filled in " +
    "and what would happen to the recommendation if " +
    "it's wrong.\n" +
    "- For dependencies: only flag if removing one " +
    "condition REVERSES the conclusion entirely.\n" +
    "- Gaps: only the top 3 inputs that would most " +
    "change the recommendation direction. Be specific.\n\n" +
    "Return this JSON:\n" +
    "{\"inference_flags\":[{\"quote\":\"\",\"basis\":\n" +
    "\"specific source and why it may not apply\",\n" +
    "\"missing\":\"exact data point absent from this \n" +
    "conversation\"}],\"assumptions\":[{\"quote\":\"\",\n" +
    "\"fills\":\"what was assumed about this specific \n" +
    "situation\",\"if_wrong\":\"how the recommendation \n" +
    "changes if this is incorrect\"}],\n" +
    "\"dependencies\":[{\"quote\":\"\",\"conditions\":\n" +
    "[\"condition A\",\"condition B\"]}],\n" +
    "\"gaps\":[\"specific missing input 1\",\n" +
    "\"specific missing input 2\",\n" +
    "\"specific missing input 3\"]}\n\n" +
    "All arrays default to [] if nothing qualifies. \n" +
    "Gaps maximum 3 items.";

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
