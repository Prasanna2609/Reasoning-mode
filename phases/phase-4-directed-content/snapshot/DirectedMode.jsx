import React, { useState, useEffect } from 'react';
import scenarios from '../data/scenarios.js';
import ChatWindow from './ChatWindow.jsx';
import MessageBubble from './MessageBubble.jsx';
import HighlightedResponse from './HighlightedResponse.jsx';
import LegendBar from './LegendBar.jsx';
import ReasoningPanel from './ReasoningPanel.jsx';
import NudgeCard from './NudgeCard.jsx';
import ChangeReceipt from './ChangeReceipt.jsx';

export default function DirectedMode({ activeScenario }) {
  const [activeStep, setActiveStep] = useState(0);

  // Reset step to 0 whenever the active scenario changes
  useEffect(() => {
    setActiveStep(0);
  }, [activeScenario]);

  const currentScenario = scenarios[activeScenario];
  const currentStep = currentScenario.steps[activeStep];

  return (
    <div className="dm-container">
      <h2 className="dm-header">{currentScenario.name}</h2>

      {/* Step Button Bar */}
      <div className="dm-step-bar">
        {currentScenario.steps.map((_, idx) => (
          <button
            key={idx}
            className={`dm-step-btn ${activeStep === idx ? 'active' : ''}`}
            onClick={() => setActiveStep(idx)}
          >
            Step {idx}
          </button>
        ))}
      </div>

      {/* Step Label */}
      {currentStep.label && (
        <div className="dm-step-label">{currentStep.label}</div>
      )}

      {/* Chat Window */}
      <ChatWindow modeLabel={currentStep.modeLabel}>
        {/* User message */}
        <MessageBubble role="user">{currentStep.userMessage}</MessageBubble>

        {/* Assistant area */}
        {currentStep.showLayer ? (
          <MessageBubble role="assistant">
            <HighlightedResponse html={currentStep.responseHTML} />
            {currentStep.gapText && (
              <div className="gap-section">
                <div className="gap-label">NOT COVERED</div>
                <div>{currentStep.gapText}</div>
              </div>
            )}
          </MessageBubble>
        ) : (
          <MessageBubble role="assistant">
            {currentStep.responseText}
          </MessageBubble>
        )}

        {/* Legend and Reasoning Panel when layer is active */}
        {currentStep.showLayer && (
          <>
            <LegendBar />
            <ReasoningPanel items={currentStep.reasoningItems} />
          </>
        )}

        {/* Nudge card */}
        {currentStep.showNudge && (
          <NudgeCard onActivate={() => {}} onDismiss={() => {}} />
        )}

        {/* Correction exchange */}
        {currentStep.showCorrection && (
          <>
            <MessageBubble role="user">
              {currentStep.correctionMessage}
            </MessageBubble>
            <MessageBubble role="assistant">
              <HighlightedResponse html={currentStep.correctedResponseHTML} />
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
    </div>
  );
}
