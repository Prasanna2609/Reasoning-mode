export function isCorrectionIntent(message, hasActiveLayer) {
  if (!hasActiveLayer) return false;
  
  const lower = message.toLowerCase().trim();
  const text = message.trim();
  
  // Step 1 — Clear question signals: not a correction
  if (text.endsWith('?')) return false;
  const questionStarters = [
    'what ', 'why ', 'how ', 'can you', 'could you',
    'tell me', 'explain', 'clarify', 'help me', 'do you',
    'is there', 'are there', 'would you', 'what if'
  ];
  if (questionStarters.some(s => lower.startsWith(s))) {
    return false;
  }
  
  // Step 2 — Explicit correction signals: is a correction
  const correctionSignals = [
    'actually', "that's wrong", "not right", 'incorrect',
    "that's not", "it's not", 'the real ', 'in reality',
    'to correct', 'i should clarify', 'let me clarify',
    'to be clear', 'i meant', 'what i meant',
    'that assumption is', 'that inference is',
    'the number is', 'the figure is', 'the actual',
    'in fact', 'to be more specific', 'more specifically',
    'to clarify', 'i should add', 'i forgot to mention',
    'i should mention', 'one thing i missed',
    'the bottleneck is', 'the issue is actually',
    'the problem is actually', 'we actually',
    'i actually', 'our actual'
  ];
  if (correctionSignals.some(s => lower.includes(s))) {
    return true;
  }
  
  // Step 3 — User supplies a specific number or fact 
  // with context suggesting it contradicts prior response
  const hasNumber = /\d+/.test(text);
  const hasContrastWord = ['but', 'however', 'though',
    'although', 'except', 'rather', 'instead', 'not',
    'never', 'no '].some(w => lower.includes(w));
  if (hasNumber && hasContrastWord && text.length > 20) {
    return true;
  }
  
  // Step 4 — Default: not a correction
  return false;
}
