import React from 'react';

export default function LegendBar() {
  return (
    <div className="legend-bar">
      <div className="legend-item">
        <div className="legend-swatch amber"></div>
        <span className="legend-label">Assumption</span>
      </div>
      <div className="legend-item">
        <div className="legend-swatch red"></div>
        <span className="legend-label">Inference</span>
      </div>
      <div className="legend-item">
        <div className="legend-swatch blue"></div>
        <span className="legend-label">Dependency</span>
      </div>
    </div>
  );
}
