import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { generateResponse, analyseResponse, correctResponse } from '../utils/api.js';
import { buildHighlightedHTML } from '../utils/quoteMatch.js';
import { isCorrectionIntent } from '../utils/correctionDetect.js';
import {
  getReasoningMode,
  setReasoningMode as setReasoningModeStorage,
  getDismissalCount,
  incrementDismissalCount,
  generateConversationId,
  saveConversation,
  getConversations,
  getCurrentConvId,
  setCurrentConvId,
  getConversationById,
} from '../utils/storage.js';
import ChatWindow from './ChatWindow.jsx';
import MessageBubble from './MessageBubble.jsx';
import HighlightedResponse from './HighlightedResponse.jsx';
import LegendBar from './LegendBar.jsx';
import ReasoningPanel from './ReasoningPanel.jsx';
import NudgeCard from './NudgeCard.jsx';
import ChangeReceipt from './ChangeReceipt.jsx';

function makeMessage(role, content, extras = {}) {
  return {
    id: Date.now() + Math.random(),
    role,
    content,
    isHighlighted: false,
    html: null,
    reasoningData: null,
    showNudge: false,
    showReceipt: false,
    changeReceipt: null,
    gaps: null,
    ...extras,
  };
}

const LiveMode = forwardRef(function LiveMode(props, ref) {
  const [convId, setConvId] = useState(() => {
    const existing = getCurrentConvId();
    if (existing && getConversationById(existing)) {
      return existing;
    }
    const newId = generateConversationId();
    setCurrentConvId(newId);
    return newId;
  });

  const [messages, setMessages] = useState(() => {
    const existing = getCurrentConvId();
    if (existing) {
      const conv = getConversationById(existing);
      if (conv?.messages?.length > 0) return conv.messages;
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const [isReasoningModeOn, setIsReasoningModeOn] = useState(() => getReasoningMode());
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Sonnet 4.6');
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const [reasoningLevel, setReasoningLevel] = useState('High');
  const [toastMessage, setToastMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const nudgeTimerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isAnalysing]);

  function toggleReasoningMode() {
    const nextVal = !isReasoningModeOn;
    setIsReasoningModeOn(nextVal);
    setReasoningModeStorage(nextVal);
    setToastMessage(`Reasoning mode is ${nextVal ? 'ON' : 'OFF'}`);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function updateMessage(id, updates) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }

  // Find the last assistant message that has reasoningData
  function getLastAssistantWithLayer() {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].reasoningData) {
        return messages[i];
      }
    }
    return null;
  }

  function getLastAssistantMessage() {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i];
      }
    }
    return null;
  }

  async function handleCorrection(correctionText) {
    const correctionMsg = makeMessage('user', correctionText);
    setMessages(prev => [...prev, correctionMsg]);
    setInputValue('');
    setIsGenerating(true);

    const lastAssistant = getLastAssistantMessage();
    const originalResponse = lastAssistant?.content || '';

    try {
      const result = await correctResponse(originalResponse, correctionText);
      setIsGenerating(false);

      const correctedMsg = makeMessage('assistant', result.response, {
        isHighlighted: false,
        html: null,
        reasoningData: null,
        showReceipt: true,
        changeReceipt: {
          changed: result.change_receipt?.changed || [],
          unchanged: result.change_receipt?.unchanged || [],
          stillOpen: result.change_receipt?.still_open || []
        }
      });

      setMessages(prev => [...prev, correctedMsg]);

      if (isReasoningModeOn) {
        setIsAnalysing(true);
        try {
          const analysis = await analyseResponse(correctionText, result.response);
          setIsAnalysing(false);
          const { html } = buildHighlightedHTML(result.response, analysis);
          updateMessage(correctedMsg.id, {
            isHighlighted: true,
            html,
            reasoningData: analysis,
          });
        } catch {
          setIsAnalysing(false);
        }
      }
    } catch {
      setIsGenerating(true);
      try {
        const conversationSoFar = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: correctionText },
        ];
        const genResult = await generateResponse(conversationSoFar);
        setIsGenerating(false);

        if (!genResult.evaluative) {
          setMessages(prev => [...prev, makeMessage('assistant', genResult.response)]);
          return;
        }

        setIsAnalysing(true);
        let analysisResult;
        try {
          analysisResult = await analyseResponse(correctionText, genResult.response);
          setIsAnalysing(false);
        } catch {
          setIsAnalysing(false);
          setMessages(prev => [...prev, makeMessage('assistant', genResult.response)]);
          return;
        }

        const { html } = buildHighlightedHTML(genResult.response, analysisResult);
        const gaps = analysisResult.gaps || [];

        if (isReasoningModeOn) {
          setMessages(prev => [
            ...prev,
            makeMessage('assistant', genResult.response, {
              isHighlighted: true,
              html,
              reasoningData: analysisResult,
              gaps: gaps.length > 0 ? gaps : null,
            }),
          ]);
        } else if (getDismissalCount() < 3) {
          const nudgedMsg = makeMessage('assistant', genResult.response, {
            isHighlighted: false,
            html,
            reasoningData: analysisResult,
            gaps: gaps.length > 0 ? gaps : null,
            showNudge: false,
          });
          setMessages(prev => [...prev, nudgedMsg]);
          nudgeTimerRef.current = setTimeout(() => {
            updateMessage(nudgedMsg.id, { showNudge: true });
          }, 500);
        } else {
          setMessages(prev => [...prev, makeMessage('assistant', genResult.response)]);
        }
      } catch (error) {
        setIsGenerating(false);
        setMessages(prev => [
          ...prev,
          makeMessage('assistant', `API Error: ${error.message}`, { isError: true }),
        ]);
      }
    }
  }

  async function handleSend() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    const text = inputValue.trim();
    if (!text) return;

    // Correction intent check
    const lastLayer = getLastAssistantWithLayer();
    if (isCorrectionIntent(text, !!lastLayer)) {
      await handleCorrection(text);
      return;
    }

    // Add user message
    const userMsg = makeMessage('user', text);
    const conversationSoFar = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: text },
    ];
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);

    let genResult;
    try {
      genResult = await generateResponse(conversationSoFar);
      setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
      setMessages(prev => [
        ...prev,
        makeMessage('assistant', `API Error: ${error.message}`, { isError: true }),
      ]);
      return;
    }

    // Non-evaluative — plain message
    if (!genResult.evaluative) {
      setMessages(prev => [...prev, makeMessage('assistant', genResult.response)]);
      return;
    }

    // Evaluative — run analysis
    setIsAnalysing(true);
    let analysisResult;
    try {
      analysisResult = await analyseResponse(text, genResult.response);
      setIsAnalysing(false);
    } catch {
      setIsAnalysing(false);
      // Graceful degradation — add plain message without layer
      setMessages(prev => [...prev, makeMessage('assistant', genResult.response)]);
      return;
    }

    const { html, unmatched } = buildHighlightedHTML(genResult.response, analysisResult);
    console.log('HTML output length:', html?.length, 'unmatched count:', unmatched?.length);
    const gaps = analysisResult.gaps || [];

    if (isReasoningModeOn) {
      // Layer ON — show highlighted immediately
      setMessages(prev => [
        ...prev,
        makeMessage('assistant', genResult.response, {
          isHighlighted: true,
          html,
          reasoningData: analysisResult,
          gaps: gaps.length > 0 ? gaps : null,
        }),
      ]);
    } else if (getDismissalCount() < 3) {
      // Layer OFF and dismissal budget remains — show nudge
      const nudgedMsg = makeMessage('assistant', genResult.response, {
        isHighlighted: false,
        html,
        reasoningData: analysisResult,
        gaps: gaps.length > 0 ? gaps : null,
        showNudge: false,
      });
      setMessages(prev => [...prev, nudgedMsg]);

      // After 500ms trigger the nudge card
      nudgeTimerRef.current = setTimeout(() => {
        updateMessage(nudgedMsg.id, { showNudge: true });
      }, 500);
    } else {
      // Dismissal budget exhausted — plain message
      setMessages(prev => [...prev, makeMessage('assistant', genResult.response)]);
    }
  }

  function handleNudgeActivate(msgId, msgHtml, msgReasoningData, msgGaps) {
    setIsReasoningModeOn(true);
    setReasoningModeStorage(true);
    updateMessage(msgId, {
      isHighlighted: true,
      html: msgHtml,
      reasoningData: msgReasoningData,
      gaps: msgGaps,
      showNudge: false,
    });
  }

  function handleNudgeDismiss(msgId) {
    incrementDismissalCount();
    updateMessage(msgId, { showNudge: false });
  }

  const textareaRef = useRef(null);

  function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Build reasoning items array for ReasoningPanel from reasoningData
  function buildReasoningItems(reasoningData) {
    if (!reasoningData) return [];
    const items = [];
    (reasoningData.inference_flags || []).forEach(f =>
      items.push({ type: 'inference', label: f.quote?.slice(0, 50) || 'Inference', text: `Basis: ${f.basis || '—'} | Missing: ${f.missing || '—'}` })
    );
    (reasoningData.assumptions || []).forEach(a =>
      items.push({ type: 'assumption', label: a.quote?.slice(0, 50) || 'Assumption', text: `Fills: ${a.fills || '—'} | If wrong: ${a.if_wrong || '—'}` })
    );
    (reasoningData.dependencies || []).forEach(d =>
      items.push({ type: 'dependency', label: d.quote?.slice(0, 50) || 'Dependency', text: `Conditions: ${(d.conditions || []).join(', ') || '—'}` })
    );
    return items;
  }

  useEffect(() => {
    if (messages.length === 0) return;
    const title = messages.find(m => m.role === 'user')
      ?.content?.slice(0, 45) || 'New conversation';
    saveConversation({
      id: convId,
      title,
      messages,
      updatedAt: Date.now()
    });
  }, [messages, convId]);

  function startNewChat() {
    const newId = generateConversationId();
    setCurrentConvId(newId);
    setConvId(newId);
    setMessages([]);
    setInputValue('');
  }

  function loadConversation(id) {
    const conv = getConversationById(id);
    if (!conv) return;
    setCurrentConvId(id);
    setConvId(id);
    setMessages(conv.messages || []);
  }

  useImperativeHandle(ref, () => ({
    startNewChat,
    loadConversation
  }));

  return (
    <div className="live-mode">
      {/* Messages area */}
      <div className="live-messages">
        {messages.length === 0 && (
          <div className="live-empty-state">
            <div className="live-empty-icon">✳</div>
            <h2 className="live-empty-title">How can I help you?</h2>
            <p className="live-empty-subtitle">
              Ask a question to see the reasoning layer evaluate claims and surface assumptions in real time.
            </p>
          </div>
        )}

        {messages.map(msg => {
          const hasReasoningData = msg.isHighlighted && 
            msg.reasoningData && (
              (msg.reasoningData.inference_flags?.length > 0) ||
              (msg.reasoningData.assumptions?.length > 0) ||
              (msg.reasoningData.dependencies?.length > 0)
            );

          return (
            <div key={msg.id}>
              {msg.role === 'user' && (
                <MessageBubble role="user">{msg.content}</MessageBubble>
              )}

              {msg.role === 'assistant' && msg.isHighlighted && (
                <>
                  {console.log('Message html preview:', msg.html?.slice(0, 100))}
                  <MessageBubble role="assistant">
                    <HighlightedResponse html={msg.html} />
                    {hasReasoningData && msg.reasoningData?.gaps?.length > 0 && (
                      <div className="gap-section">
                        <div className="gap-label">NOT COVERED</div>
                        <div>{msg.reasoningData.gaps.join(' · ')}</div>
                      </div>
                    )}
                  </MessageBubble>
                  {hasReasoningData && <LegendBar />}
                  {hasReasoningData && <ReasoningPanel items={buildReasoningItems(msg.reasoningData)} />}
                </>
              )}

              {msg.role === 'assistant' && !msg.isHighlighted && (
                <MessageBubble role="assistant">
                  {msg.isError ? (
                    <span className="live-error-text">{msg.content}</span>
                  ) : (
                    msg.content
                  )}
                </MessageBubble>
              )}

            {msg.showNudge && (
              <NudgeCard
                onActivate={() => handleNudgeActivate(msg.id, msg.html, msg.reasoningData, msg.gaps)}
                onDismiss={() => handleNudgeDismiss(msg.id)}
              />
            )}

            {msg.showReceipt && msg.changeReceipt && (
              <ChangeReceipt
                changed={msg.changeReceipt.changed}
                unchanged={msg.changeReceipt.unchanged}
                stillOpen={msg.changeReceipt.stillOpen}
              />
            )}
          </div>
        );
      })}

        {/* Generating indicator */}
        {isGenerating && (
          <MessageBubble role="assistant">
            <span className="live-generating-dots">Generating<span className="dots">...</span></span>
          </MessageBubble>
        )}

        {/* Analysing indicator */}
        {isAnalysing && (
          <div className="live-analysing-label">Analysing reasoning…</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="live-input-bar">
        <div className="input-container" style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '10px 14px' }}>
          {/* Row 1 */}
          <div>
            <textarea
              id="live-chat-input"
              ref={textareaRef}
              placeholder="Write a message..."
              value={inputValue}
              rows={1}
              onChange={e => {
                setInputValue(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKeyDown}
              aria-label="Chat input"
              style={{
                width: '100%', border: 'none', background: 'transparent',
                color: 'var(--text)', fontSize: '14px', lineHeight: '1.5',
                minHeight: '44px', maxHeight: '160px', resize: 'none', outline: 'none'
              }}
            />
          </div>
          {/* Row 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            {/* LEFT */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{
                width: '28px', height: '28px', borderRadius: '50%', background: '#1e1e1e',
                border: '1px solid #2a2a2a', color: '#888', fontSize: '16px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }} aria-label="Decorative plus" aria-hidden="true">+</button>
              <button style={{
                width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(74,158,255,0.15)',
                border: '1px solid rgba(74,158,255,0.25)', color: '#4A9EFF',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }} aria-label="Decorative stack" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" />
                  <path d="M4 11h16" />
                  <path d="M6 7h12" />
                  <path d="M8 3h8" />
                </svg>
              </button>
            </div>
            {/* RIGHT */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              
              {/* 1. Prominent Toggle */}
              <button 
                onClick={toggleReasoningMode}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0 }}
                aria-label={isReasoningModeOn ? 'Reasoning Mode ON' : 'Reasoning Mode OFF'}
              >
                <div style={{
                  width: '32px', height: '18px', borderRadius: '18px',
                  background: isReasoningModeOn ? 'var(--cl)' : '#444',
                  position: 'relative', transition: 'background 0.2s'
                }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '2px', left: isReasoningModeOn ? '16px' : '2px',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '13px', 
                  color: isReasoningModeOn ? 'var(--cl)' : '#888', 
                  fontWeight: 500,
                  fontFamily: "'Plus Jakarta Sans', sans-serif" 
                }}>
                  Reasoning Mode
                </span>
              </button>

              {/* 2. Model Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setModelMenuOpen(!modelMenuOpen); setLevelMenuOpen(false); }}
                  style={{
                    background: 'transparent', border: 'none', color: '#888',
                    fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {selectedModel} 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {modelMenuOpen && (
                  <div style={{
                    position: 'absolute', bottom: '100%', right: '0', marginBottom: '8px',
                    background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px',
                    padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '100px', zIndex: 10
                  }}>
                    {['Sonnet 4.6', 'Opus 4.6', 'Opus 4.7', 'Haiku 4.5'].map(opt => (
                      <button key={opt}
                        onClick={() => { setSelectedModel(opt); setModelMenuOpen(false); }}
                        style={{
                          background: 'transparent', border: 'none', color: '#ccc', textAlign: 'left',
                          padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                        }}
                        onMouseEnter={e => e.target.style.background = '#2a2a2a'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Reasoning Level Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setLevelMenuOpen(!levelMenuOpen); setModelMenuOpen(false); }}
                  style={{
                    background: 'transparent', border: 'none', color: '#888',
                    fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  {reasoningLevel} 
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                {levelMenuOpen && (
                  <div style={{
                    position: 'absolute', bottom: '100%', right: '0', marginBottom: '8px',
                    background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px',
                    padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '100px', zIndex: 10
                  }}>
                    {['Low', 'Low-Medium', 'High', 'Max'].map(opt => (
                      <button key={opt}
                        onClick={() => { setReasoningLevel(opt); setLevelMenuOpen(false); }}
                        style={{
                          background: 'transparent', border: 'none', color: '#ccc', textAlign: 'left',
                          padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                        }}
                        onMouseEnter={e => e.target.style.background = '#2a2a2a'}
                        onMouseLeave={e => e.target.style.background = 'transparent'}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Mic button */}
              <button style={{
                background: 'transparent', border: 'none', color: '#888', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '4px'
              }} aria-label="Decorative mic" aria-hidden="true">
                <i className="ti-microphone" style={{ fontSize: '20px' }}></i>
              </button>
              
              {/* 5. Send button */}
              <button
                id="live-send-btn"
                onClick={handleSend}
                disabled={isGenerating || !inputValue.trim()}
                style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: inputValue.trim() ? 'var(--cl)' : '#444',
                  color: inputValue.trim() ? 'white' : '#888',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: (isGenerating || !inputValue.trim()) ? 'default' : 'pointer'
                }}
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          background: 'rgba(222, 115, 86, 0.95)', color: 'white',
          padding: '12px 24px', borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 9999,
          fontSize: '14px', fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
});
export default LiveMode;
