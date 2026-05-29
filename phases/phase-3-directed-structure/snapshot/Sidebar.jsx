import React from 'react';

const SCENARIO_NAMES = [
  'All four elements',
  'Dependency heavy',
  'Inference only',
  'Multi-signal inference',
  'Clean response'
];

export default function Sidebar({ mode, setMode, activeScenario, setActiveScenario }) {
  return (
    <div className="sidebar">
      <div className="sb-container">
        {/* Header */}
        <div className="sb-header">
          <div className="sb-eyebrow">REASONING LAYER</div>
          <h2 className="sb-title">Reasoning Layer</h2>
          <div className="sb-subtitle">Fellowship Project · June 2026</div>
        </div>

        {/* Mode Toggle */}
        <div className="sb-toggle-section">
          <button
            className={`sb-toggle-btn ${mode === 'directed' ? 'active' : 'inactive'}`}
            onClick={() => setMode('directed')}
          >
            Directed
          </button>
          <button
            className={`sb-toggle-btn ${mode === 'live' ? 'active' : 'inactive'}`}
            onClick={() => setMode('live')}
          >
            Live
          </button>
        </div>

        {/* Scenario Nav (Directed Mode Only) */}
        {mode === 'directed' && (
          <div className="sb-nav-section">
            <div className="sb-nav-label">SCENARIOS</div>
            {SCENARIO_NAMES.map((name, idx) => (
              <div
                key={idx}
                className={`sb-nav-link ${activeScenario === idx ? 'active' : ''}`}
                onClick={() => setActiveScenario(idx)}
                role="button"
              >
                <div className="sb-nav-dot"></div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Legend (Sticks to bottom) */}
        <div className="sb-legend-section">
          <div className="sb-legend-label">ELEMENT TYPES</div>
          <div className="sb-legend-item">
            <div className="sb-legend-swatch amber"></div>
            <span className="sb-legend-text">Assumption</span>
          </div>
          <div className="sb-legend-item">
            <div className="sb-legend-swatch red"></div>
            <span className="sb-legend-text">Inference</span>
          </div>
          <div className="sb-legend-item">
            <div className="sb-legend-swatch blue"></div>
            <span className="sb-legend-text">Dependency</span>
          </div>
          <div className="sb-legend-item">
            <div className="sb-legend-swatch muted"></div>
            <span className="sb-legend-text">Gap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
