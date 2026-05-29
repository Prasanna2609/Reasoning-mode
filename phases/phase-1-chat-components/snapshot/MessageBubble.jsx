import React from 'react';

export default function MessageBubble({ role, children }) {
  if (role === 'user') {
    return (
      <div className="msg-container-user">
        <div className="msg-bubble-user">
          {children}
        </div>
      </div>
    );
  }

  // default to assistant
  return (
    <div className="msg-container-assistant">
      <div className="msg-label-assistant">Claude</div>
      <div className="msg-bubble-assistant">
        {children}
      </div>
    </div>
  );
}
