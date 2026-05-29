import React, { useState, useEffect } from 'react';

const SCENARIO_NAMES = [
  'All four elements',
  'Dependency heavy',
  'Inference only',
  'Multi-signal inference',
  'Clean response'
];

const STEP_COUNTS = [5, 3, 2, 2, 1];

export default function DirectedMode({ activeScenario }) {
  const [activeStep, setActiveStep] = useState(0);

  // Reset step to 0 whenever the active scenario changes
  useEffect(() => {
    setActiveStep(0);
  }, [activeScenario]);

  const stepCount = STEP_COUNTS[activeScenario] || 0;
  const scenarioName = SCENARIO_NAMES[activeScenario] || '';

  return (
    <div className="dm-container">
      <h2 className="dm-header">{scenarioName}</h2>
      
      <div className="dm-step-bar">
        {Array.from({ length: stepCount }).map((_, idx) => (
          <button
            key={idx}
            className={`dm-step-btn ${activeStep === idx ? 'active' : ''}`}
            onClick={() => setActiveStep(idx)}
          >
            Step {idx}
          </button>
        ))}
      </div>

      <div className="dm-pane">
        Scenario {activeScenario} · Step {activeStep} — content loads in Phase 4
      </div>
    </div>
  );
}
