import React, { useState } from 'react';

const DEFAULT_ITEMS = [
  {
    type: 'assumption',
    label: 'Assumption',
    text: 'Claude assumes the startup bottleneck is pure skill-gap and that current team capacity is not overloaded.',
  },
  {
    type: 'inference',
    label: 'Inference',
    text: 'Claude infers that senior engineers typically take 3 to 6 months to fully onboard based on general training data.',
    badge: 'GENERAL BENCHMARK',
  },
  {
    type: 'dependency',
    label: 'Dependency',
    text: 'The recommendation to hire depends on sprint planning processes being solid and current team capacity not being overloaded.',
  }
];

export default function ReasoningPanel({ items = DEFAULT_ITEMS }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const totalItems = (items?.length || 0);

  return (
    <div className="rp-container">
      <div className="rp-header" onClick={toggleOpen} role="button" aria-expanded={isOpen}>
        <span className="rp-chevron">{isOpen ? '▾' : '▸'}</span>
        <span className="rp-header-text">Reasoning breakdown — tap to expand</span>
        <span style={{
          background: 'rgba(222,115,86,0.15)',
          border: '1px solid rgba(222,115,86,0.3)',
          color: 'var(--cl)',
          borderRadius: '10px',
          padding: '1px 7px',
          fontSize: '10px',
          fontFamily: 'IBM Plex Mono, monospace',
          marginLeft: 'auto'
        }}>{totalItems}</span>
      </div>
      {isOpen && (
        <div className="rp-body">
          {items.map((item, idx) => (
            <div key={idx} className="rp-row">
              <div className={`rp-icon-box ${item.type}`}>
                {item.type === 'inference' && 'ⓘ'}
                {item.type === 'assumption' && '▲'}
                {item.type === 'dependency' && '🔗'}
              </div>
              <div className="rp-content">
                <div className={`rp-label ${item.type}`}>{item.label}</div>
                <div className="rp-desc">{item.text}</div>
                {item.type === 'inference' && item.badge && (
                  <div className="rp-badge">{item.badge}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
