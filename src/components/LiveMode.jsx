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

const LiveMode = forwardRef(function LiveMode({
  reasoningMode: propReasoningMode,
  setReasoningMode: propSetReasoningMode,
}, ref) {
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

  // Fallback state if props are not provided (e.g. in tests)
  const [localReasoningMode, setLocalReasoningMode] = useState(() => getReasoningMode());
  
  const isReasoningModeOn = propReasoningMode !== undefined ? propReasoningMode : localReasoningMode;

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
    if (propSetReasoningMode) {
      propSetReasoningMode(nextVal);
    } else {
      setLocalReasoningMode(nextVal);
      setReasoningModeStorage(nextVal);
    }
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
    if (propSetReasoningMode) {
      propSetReasoningMode(true);
    } else {
      setLocalReasoningMode(true);
      setReasoningModeStorage(true);
    }
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
        <button
          className={`live-mode-toggle ${isReasoningModeOn ? 'active' : ''}`}
          onClick={toggleReasoningMode}
          id="reasoning-mode-toggle"
          aria-label={isReasoningModeOn ? 'Reasoning Mode ON' : 'Reasoning Mode OFF'}
        >
          {isReasoningModeOn ? 'Reasoning Mode ON' : 'Reasoning Mode OFF'}
        </button>

        <textarea
          id="live-chat-input"
          ref={textareaRef}
          className="live-input"
          placeholder="Ask anything… (Shift+Enter for newline)"
          value={inputValue}
          rows={1}
          onChange={e => {
            setInputValue(e.target.value);
            autoResize(e.target);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Chat input"
        />

        <button
          id="live-send-btn"
          className="live-send-btn"
          onClick={handleSend}
          disabled={isGenerating || !inputValue.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
});
export default LiveMode;
