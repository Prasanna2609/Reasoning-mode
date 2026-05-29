import React from 'react';

export default function ChatWindow({ modeLabel, children }) {
  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-dots">
          <div className="chat-dot red"></div>
          <div className="chat-dot yellow"></div>
          <div className="chat-dot green"></div>
        </div>
        {modeLabel && <span className="chat-header-label">{modeLabel}</span>}
      </div>
      <div className="chat-body">
        {children}
      </div>
    </div>
  );
}
