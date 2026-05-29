import React from 'react';

export default function NudgeCard({ onActivate, onDismiss, notNowDisabled }) {
  return (
    <div className="nudge-card">
      <div className="nudge-icon-box">◈</div>
      <div className="nudge-content">
        <h4 className="nudge-title">This response contains a recommendation built on assumptions about your context.</h4>
        <p className="nudge-subtitle">Reasoning Mode shows where Claude filled in gaps and what the recommendation depends on.</p>
        <div className="nudge-actions">
          <button className="nudge-btn-primary" onClick={onActivate}>
            Activate Reasoning Mode
          </button>
          <button className="nudge-btn-ghost" onClick={onDismiss} disabled={notNowDisabled}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
