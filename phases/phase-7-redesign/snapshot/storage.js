export function getDismissalCount() {
  return parseInt(localStorage.getItem('rl_dismissals') || '0', 10);
}

export function incrementDismissalCount() {
  const next = getDismissalCount() + 1;
  localStorage.setItem('rl_dismissals', String(next));
  return next;
}

export function getReasoningMode() {
  return localStorage.getItem('rl_mode') === 'true';
}

export function setReasoningMode(value) {
  localStorage.setItem('rl_mode', String(value));
}

export function generateConversationId() {
  return 'conv_' + Date.now() + '_' + 
    Math.random().toString(36).slice(2,7);
}

export function saveConversation(conversation) {
  try {
    const all = getConversations();
    const index = all.findIndex(c => c.id === conversation.id);
    if (index >= 0) {
      all[index] = conversation;
    } else {
      all.unshift(conversation);
    }
    const trimmed = all.slice(0, 20);
    localStorage.setItem('rl_conversations', 
      JSON.stringify(trimmed));
  } catch(e) {}
}

export function getConversations() {
  try {
    return JSON.parse(
      localStorage.getItem('rl_conversations') || '[]'
    );
  } catch(e) { return []; }
}

export function getCurrentConvId() {
  return localStorage.getItem('rl_current_conv_id') || null;
}

export function setCurrentConvId(id) {
  localStorage.setItem('rl_current_conv_id', id);
}

export function getConversationById(id) {
  return getConversations().find(c => c.id === id) || null;
}
