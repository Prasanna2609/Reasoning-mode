const STOP_WORDS = new Set([
  'the','a','an','this','that','these','those','it','its','is','are',
  'was','were','be','been','being','of','in','on','at','to','for',
  'with','by','and','or','not',
]);

function getAnchor(quote) {
  const words = quote.split(/\s+/).filter(w => !STOP_WORDS.has(w.toLowerCase()));
  return words.slice(0, 6).join(' ');
}

function findMatch(responseText, quote) {
  const lowerText = responseText.toLowerCase();
  const lowerQuote = quote.toLowerCase();

  // Tier 1 — exact substring match
  const exactIdx = lowerText.indexOf(lowerQuote);
  if (exactIdx !== -1) {
    return { found: true, start: exactIdx, end: exactIdx + quote.length, tier: 1 };
  }

  // Tier 2 — anchor match (first 6 meaningful words)
  const anchor = getAnchor(quote);
  const anchorWords = anchor.split(/\s+/);
  if (anchorWords.length >= 3) {
    const lowerAnchor = anchor.toLowerCase();
    const anchorIdx = lowerText.indexOf(lowerAnchor);
    if (anchorIdx !== -1) {
      // Find the sentence containing the anchor
      const sentences = responseText.split(/(?<=\.)\s+|(?<=\.)\n/);
      let pos = 0;
      for (const sentence of sentences) {
        const sentenceStart = pos;
        const sentenceEnd = pos + sentence.length;
        if (anchorIdx >= sentenceStart && anchorIdx < sentenceEnd) {
          return { found: true, start: sentenceStart, end: sentenceEnd, tier: 2 };
        }
        pos = sentenceEnd + 1; // account for separator
      }
    }
  }

  // Tier 3 — no match
  return { found: false };
}

export function buildHighlightedHTML(responseText, reasoningData = {}) {
  const { inference_flags = [], assumptions = [], dependencies = [] } = reasoningData;

  console.log(
    'QUOTE MATCH INPUT - responseText length:', responseText?.length,
    'elements count:',
    (reasoningData?.inference_flags?.length || 0) +
    (reasoningData?.assumptions?.length || 0) +
    (reasoningData?.dependencies?.length || 0)
  );

  // Flatten all elements with css class
  const elements = [
    ...inference_flags.map(e => ({ ...e, cssClass: 'rl-inference' })),
    ...assumptions.map(e => ({ ...e, cssClass: 'rl-assumption' })),
    ...dependencies.map(e => ({ ...e, cssClass: 'rl-dependency' })),
  ];

  if (elements.length === 0) {
    return { html: responseText, unmatched: [] };
  }

  // Find matches
  const matched = [];
  const unmatched = [];

  for (const el of elements) {
    console.log('Attempting match for quote:', el.quote?.slice(0, 50));
    const match = findMatch(responseText, el.quote || '');
    console.log('Match result tier:', match?.tier || 'none');
    if (match.found) {
      matched.push({ ...el, start: match.start, end: match.end, tier: match.tier });
    } else {
      unmatched.push(el);
    }
  }

  // Sort by start index ascending
  matched.sort((a, b) => a.start - b.start);

  // Build HTML string, avoiding overlapping ranges
  let html = '';
  let cursor = 0;

  for (const el of matched) {
    if (el.start < cursor) continue; // skip overlapping

    // Plain text before this match — escape < and >
    const plain = responseText.slice(cursor, el.start)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html += plain;

    // Wrapped highlight span
    const inner = responseText.slice(el.start, el.end)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html += `<span class="${el.cssClass}">${inner}</span>`;
    cursor = el.end;
  }

  // Remaining plain text
  const trailing = responseText.slice(cursor)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html += trailing;

  return { html, unmatched };
}
