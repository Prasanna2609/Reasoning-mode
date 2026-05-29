import React from 'react';

export default function ChangeReceipt({ changed = [], unchanged = [], stillOpen = [] }) {
  return (
    <div className="change-receipt">
      <div className="cr-top-label">CHANGE RECEIPT</div>
      
      {/* Changed section */}
      {changed && changed.length > 0 && (
        <div className="cr-changed-section">
          {changed.map((item, idx) => (
            <div key={idx} className="cr-item">
              <div className="cr-dot green"></div>
              <span className="cr-text">{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Unchanged section */}
      {unchanged && unchanged.length > 0 && (
        <div className="cr-unchanged-card">
          <div className="cr-section-label muted">UNCHANGED</div>
          {unchanged.map((item, idx) => (
            <div key={idx} className="cr-item">
              <div className="cr-dot muted"></div>
              <span className="cr-text">{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Still Open section */}
      {stillOpen && stillOpen.length > 0 && (
        <div className="cr-still-open-section">
          <div className="cr-section-label amber">STILL OPEN</div>
          {stillOpen.map((item, idx) => (
            <div key={idx} className="cr-item">
              <div className="cr-dot amber"></div>
              <span className="cr-text">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
