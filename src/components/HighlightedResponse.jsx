import React from 'react';

export default function HighlightedResponse({ html }) {
  if (!html) {
    console.warn('HighlightedResponse received empty html');
    return null;
  }
  return (
    <div
      className="highlighted-response"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
