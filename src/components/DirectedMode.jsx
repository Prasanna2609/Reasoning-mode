import React, { useState, useEffect } from 'react';
import scenarios from '../data/scenarios.js';
import ChatWindow from './ChatWindow.jsx';
import MessageBubble from './MessageBubble.jsx';
import HighlightedResponse from './HighlightedResponse.jsx';
import LegendBar from './LegendBar.jsx';
import ReasoningPanel from './ReasoningPanel.jsx';
import NudgeCard from './NudgeCard.jsx';
import ChangeReceipt from './ChangeReceipt.jsx';

const CARDS_DATA = [
  {
    id: 0,
    title: 'All four elements',
    icon: 'ti-layers',
    color: 'orange',
    desc: 'Full reasoning layer fires across a hiring decision.',
    tags: [
      { text: 'Assumption', color: 'orange' },
      { text: 'Inference', color: 'red' },
      { text: 'Dependency', color: 'blue' },
      { text: 'Gap', color: 'gray' },
    ],
  },
  {
    id: 1,
    title: 'Multi-signal inference',
    icon: 'ti-antenna',
    color: 'red',
    desc: 'Four inference flags in one response — all from benchmarks.',
    tags: [
      { text: 'Inference', color: 'red' },
      { text: 'Assumption', color: 'orange' },
    ],
  },
  {
    id: 2,
    title: 'Inference + gap',
    icon: 'ti-chart-bar',
    color: 'red',
    desc: 'Salary benchmarks with key inputs left uncovered.',
    tags: [
      { text: 'Inference', color: 'red' },
      { text: 'Gap', color: 'gray' },
    ],
  },
  {
    id: 3,
    title: 'Assumption + dependency',
    icon: 'ti-git-branch',
    color: 'blue',
    desc: "Recommendation that collapses if conditions aren't met.",
    tags: [
      { text: 'Assumption', color: 'orange' },
      { text: 'Dependency', color: 'blue' },
    ],
  },
  {
    id: 4,
    title: 'Clean response',
    icon: 'ti-check',
    color: 'gray',
    desc: 'Factual definition — no recommendation. Layer stays inactive.',
    tags: [{ text: 'No layer', color: 'gray' }],
    fullWidth: true,
  },
];

export default function DirectedMode({ activeScenario, setActiveScenario = () => {} }) {
  const [activeStep, setActiveStep] = useState(0);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [notNowClicked, setNotNowClicked] = useState(false);

  // Sync state and reset when scenario changes
  useEffect(() => {
    setActiveStep(0);
    setNotNowClicked(false);
    setJourneyStarted(false);
  }, [activeScenario]);

  const currentScenario = scenarios[activeScenario] || scenarios[0];
  const currentStep = currentScenario.steps[activeStep] || currentScenario.steps[0];

  const handleCardClick = (id) => {
    setActiveScenario(id);
    setActiveStep(0);
    setNotNowClicked(false);
    setJourneyStarted(true);
  };

  const handleBackToCards = () => {
    setJourneyStarted(false);
  };

  // Helper to map activeStep to 4 progress dots (0 to 3)
  const getProgressDotStatus = (dotIndex) => {
    let currentUiStep = activeStep;
    if (activeStep > 3) {
      currentUiStep = 3; // Cap at 3 for dots representation
    }
    if (currentUiStep === dotIndex) return 'active';
    if (currentUiStep > dotIndex) return 'completed';
    return 'future';
  };

  return (
    <div className="directed-mode-container">
      {/* SCENARIO CARDS VIEW */}
      {!journeyStarted && (
        <div className="scenario-cards-view">
          <h2 className="sc-view-title">Choose a scenario</h2>
          <p className="sc-view-subtitle">
            Each journey walks through a real AI response — guided, one send at a time
          </p>

          <div className="scenario-cards-grid">
            {CARDS_DATA.map((card) => (
              <div
                key={card.id}
                className={`scenario-card ${card.fullWidth ? 'span-2' : ''}`}
                onClick={() => handleCardClick(card.id)}
              >
                <div className="sc-row-1">
                  <span className="sc-title">{card.title}</span>
                  <div className={`sc-icon-box ${card.color}`}>
                    <i className={card.icon}></i>
                  </div>
                </div>
                <p className="sc-desc">{card.desc}</p>
                <div className="sc-tags-row">
                  {card.tags.map((tag, tIdx) => (
                    <span key={tIdx} className={`sc-tag ${tag.color}`}>
                      {tag.text}
                    </span>
                  ))}
                </div>
                <div className="sc-start-link">→ Start journey</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JOURNEY VIEW */}
      {journeyStarted && (
        <div className="scenario-journey-view">
          {/* Journey Header */}
          <header className="journey-header">
            <button className="journey-back-btn" onClick={handleBackToCards}>
              <i className="ti-arrow-left"></i>
              <span>Back</span>
            </button>
            <h3 className="journey-title">{currentScenario.name}</h3>
            <span className="journey-step-label">Step {activeStep}</span>

          </header>

          {/* Scenario 0 Flow rendering */}
          {activeScenario === 0 ? (
            <div className="journey-chat-area-wrapper">
              <div className="journey-chat-messages">
                {activeStep > 0 && (
                  <>
                    {/* User bubble 1 */}
                    <MessageBubble role="user">
                      {currentScenario.steps[0].userMessage}
                    </MessageBubble>

                    {/* Assistant response bubble 1 */}
                    <MessageBubble role="assistant">
                      {currentStep.showLayer ? (
                        <HighlightedResponse html={currentStep.responseHTML} />
                      ) : (
                        currentStep.responseText
                      )}

                      {currentStep.showInactiveNotice && currentStep.inactiveNoticeText && (
                        <div style={{
                          padding: '12px 16px',
                          background: 'rgba(74,158,255,0.06)',
                          border: '1px solid rgba(74,158,255,0.15)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: 'var(--text2)',
                          lineHeight: '1.6',
                          marginTop: '8px'
                        }}>
                          {currentStep.inactiveNoticeText}
                        </div>
                      )}

                      {/* Gap section */}
                      {currentStep.showLayer && currentStep.gapText && (
                        <div className="gap-section">
                          <div className="gap-label">NOT COVERED</div>
                          <div>{currentStep.gapText}</div>
                        </div>
                      )}
                    </MessageBubble>

                    {/* Legend and Reasoning Panel */}
                    {currentStep.showLayer && <LegendBar />}
                    {currentStep.showLayer && (
                      <ReasoningPanel items={currentStep.reasoningItems} />
                    )}

                    {/* Nudge card */}
                    {currentStep.showNudge && (
                      <NudgeCard
                        onActivate={() => setActiveStep(2)}
                        onDismiss={() => setNotNowClicked(true)}
                        notNowDisabled={notNowClicked}
                      />
                    )}

                    {/* Correction interaction */}
                    {currentStep.showCorrection && (
                      <>
                        <MessageBubble role="user">
                          {currentStep.correctionMessage}
                        </MessageBubble>
                        <MessageBubble role="assistant">
                          {currentStep.correctedResponseHTML}
                        </MessageBubble>

                        {/* Change receipt */}
                        {currentStep.showReceipt && currentStep.changeReceipt && (
                          <ChangeReceipt
                            changed={currentStep.changeReceipt.changed}
                            unchanged={currentStep.changeReceipt.unchanged}
                            stillOpen={currentStep.changeReceipt.stillOpen}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Input bar section */}
              <div className="journey-input-section">
                {activeStep === 0 && (
                  <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '10px 14px' }}>
                    <div style={{ fontStyle: 'italic', color: '#888', fontSize: '14px', lineHeight: '1.5', minHeight: '44px' }}>
                      "My startup has 9 engineers. We've missed our last 3 sprints. Should I let go of 2 under-performers or hire a senior engineer?"
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#888', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                        <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.25)', color: '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" /><path d="M4 11h16" /><path d="M6 7h12" /><path d="M8 3h8" /></svg>
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '32px', height: '18px', borderRadius: '18px', background: 'var(--cl)', position: 'relative' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--cl)', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reasoning Mode</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Sonnet 4.6 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            High <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', padding: '4px' }} aria-label="Decorative mic" aria-hidden="true"><i className="ti-microphone" style={{ fontSize: '20px' }}></i></button>
                        <button className="prefill-send-btn pulsing" onClick={() => setActiveStep(1)} aria-label="Send query">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <>
                    {notNowClicked ? (
                      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '10px 14px' }}>
                    <div style={{ fontStyle: 'italic', color: '#888', fontSize: '14px', lineHeight: '1.5', minHeight: '44px' }}>
                      "Actually — I've tracked it. 2 engineers account for 70% of the missed tasks. The rest of the team is performing fine."
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#888', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                        <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.25)', color: '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" /><path d="M4 11h16" /><path d="M6 7h12" /><path d="M8 3h8" /></svg>
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '32px', height: '18px', borderRadius: '18px', background: 'var(--cl)', position: 'relative' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--cl)', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reasoning Mode</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Sonnet 4.6 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            High <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', padding: '4px' }} aria-label="Decorative mic" aria-hidden="true"><i className="ti-microphone" style={{ fontSize: '20px' }}></i></button>
                        <button className="prefill-send-btn pulsing" onClick={() => setActiveStep(3)} aria-label="Send query">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                    ) : (
                      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '10px 14px', opacity: 0.5, pointerEvents: 'none' }}>
                        <div style={{ fontStyle: 'italic', color: '#888', fontSize: '14px', lineHeight: '1.5', minHeight: '44px' }}>
                          Activate above to continue…
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#888', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                            <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.25)', color: '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" /><path d="M4 11h16" /><path d="M6 7h12" /><path d="M8 3h8" /></svg>
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '32px', height: '18px', borderRadius: '18px', background: '#444', position: 'relative' }}>
                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '2px' }} />
                              </div>
                              <span style={{ fontSize: '13px', color: '#888', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reasoning Mode</span>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Sonnet 4.6 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </button>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                High <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                              </button>
                            </div>
                            <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}><i className="ti-microphone" style={{ fontSize: '20px' }}></i></button>
                            <button style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#444', color: '#888', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeStep === 2 && (
                  <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px', padding: '10px 14px' }}>
                    <div style={{ fontStyle: 'italic', color: '#888', fontSize: '14px', lineHeight: '1.5', minHeight: '44px' }}>
                      "Actually — I've tracked it. 2 engineers account for 70% of the missed tasks. The rest of the team is performing fine."
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#888', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                        <button style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.25)', color: '#4A9EFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" /><path d="M4 11h16" /><path d="M6 7h12" /><path d="M8 3h8" /></svg>
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '32px', height: '18px', borderRadius: '18px', background: 'var(--cl)', position: 'relative' }}>
                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--cl)', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reasoning Mode</span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Sonnet 4.6 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <button style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '13px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            High <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </button>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', padding: '4px' }} aria-label="Decorative mic" aria-hidden="true"><i className="ti-microphone" style={{ fontSize: '20px' }}></i></button>
                        <button className="prefill-send-btn pulsing" onClick={() => setActiveStep(4)} aria-label="Send query">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(activeStep === 3 || activeStep === 4) && (
                  <div className="journey-completion-footer">
                    <i className="ti-check completion-check-icon"></i>
                    <span className="completion-text">
                      Journey complete —{' '}
                      <button className="reset-journey-link" onClick={handleBackToCards}>
                        explore another scenario
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Placeholder body for Scenarios 1-4 */
            <div className="journey-placeholder-body">
              <i className="ti-time placeholder-time-icon"></i>
              <p className="placeholder-text">
                Scenario content coming soon. Try the "All four elements" scenario to see the full reasoning layer flow.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Legacy Test Compatibility Layer (Invisible, matches step buttons) */}
      <div className="dm-step-bar dm-step-bar-hidden">
        {currentScenario.steps.map((_, idx) => (
          <button
            key={idx}
            className={`dm-step-btn ${activeStep === idx ? 'active' : ''}`}
            onClick={() => {
              setActiveStep(idx);
            }}
          >
            Step {idx}
          </button>
        ))}
        {currentStep.label && (
          <div className="dm-step-label">{currentStep.label}</div>
        )}
      </div>
    </div>
  );
}
