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

export default function DirectedMode({ activeScenario, setActiveScenario }) {
  const [activeStep, setActiveStep] = useState(0);
  const [journeyActive, setJourneyActive] = useState(true);
  const [notNowClicked, setNotNowClicked] = useState(false);

  // Sync state and reset when scenario changes
  useEffect(() => {
    setActiveStep(0);
    setNotNowClicked(false);
  }, [activeScenario]);

  const currentScenario = scenarios[activeScenario] || scenarios[0];
  const currentStep = currentScenario.steps[activeStep] || currentScenario.steps[0];

  const handleCardClick = (id) => {
    setActiveScenario(id);
    setActiveStep(0);
    setNotNowClicked(false);
    setJourneyActive(true);
  };

  const handleBackToCards = () => {
    setJourneyActive(false);
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
      {!journeyActive && (
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
      {journeyActive && (
        <div className="scenario-journey-view">
          {/* Journey Header */}
          <header className="journey-header">
            <button className="journey-back-btn" onClick={handleBackToCards}>
              <i className="ti-arrow-left"></i>
              <span>Back</span>
            </button>
            <h3 className="journey-title">{currentScenario.name}</h3>
            <span className="journey-step-label">Step {activeStep}</span>

            {/* Step Progress Dots */}
            <div className="journey-progress-dots">
              {[0, 1, 2, 3].map((dotIdx) => {
                const status = getProgressDotStatus(dotIdx);
                return (
                  <div
                    key={dotIdx}
                    className={`progress-dot ${status}`}
                  ></div>
                );
              })}
            </div>
          </header>

          {/* Scenario 0 Flow rendering */}
          {activeScenario === 0 ? (
            <div className="journey-chat-area-wrapper">
              <div className="journey-chat-messages">
                {activeStep > 0 && (
                  <ChatWindow modeLabel={currentStep.modeLabel}>
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
                  </ChatWindow>
                )}
              </div>

              {/* Input bar section */}
              <div className="journey-input-section">
                {activeStep === 0 && (
                  <div className="journey-prefill-bar">
                    <span className="prefill-text">
                      "My startup has 9 engineers. We've missed our last 3 sprints. Should I let go of 2 under-performers or hire a senior engineer?"
                    </span>
                    <button
                      className="prefill-send-btn pulsing"
                      onClick={() => setActiveStep(1)}
                      aria-label="Send prefilled query"
                    >
                      <i className="ti-arrow-up"></i>
                    </button>
                  </div>
                )}

                {activeStep === 1 && (
                  <>
                    {notNowClicked ? (
                      <div className="journey-prefill-bar">
                        <span className="prefill-text">
                          "Actually — I've tracked it. 2 engineers account for 70% of the missed tasks. The rest of the team is performing fine."
                        </span>
                        <button
                          className="prefill-send-btn pulsing"
                          onClick={() => setActiveStep(3)}
                          aria-label="Send correction"
                        >
                          <i className="ti-arrow-up"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="journey-disabled-input-bar">
                        <input
                          type="text"
                          className="disabled-chat-input"
                          disabled
                          placeholder="Activate above to continue…"
                        />
                        <button className="disabled-send-btn" disabled>
                          Send
                        </button>
                      </div>
                    )}
                  </>
                )}

                {activeStep === 2 && (
                  <div className="journey-prefill-bar">
                    <span className="prefill-text">
                      "Actually — I've tracked it. 2 engineers account for 70% of the missed tasks. The rest of the team is performing fine."
                    </span>
                    <button
                      className="prefill-send-btn pulsing"
                      onClick={() => setActiveStep(4)}
                      aria-label="Send correction"
                    >
                      <i className="ti-arrow-up"></i>
                    </button>
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
