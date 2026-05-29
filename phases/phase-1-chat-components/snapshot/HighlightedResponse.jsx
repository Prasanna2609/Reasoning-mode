import React from 'react';

const DEFAULT_DEMO_HTML = `Based on your startup query, we recommend hiring a senior engineer. We make the <span class="rl-assumption">assumption that the bottleneck is a pure skill-gap</span>. However, please note that <span class="rl-inference">senior engineers typically take 3 to 6 months to fully onboard</span>. This hiring course of action only resolves sprint delay <span class="rl-dependency">if the sprint planning processes are solid AND current team capacity is not overloaded</span>.`;

export default function HighlightedResponse({ html }) {
  const content = html || DEFAULT_DEMO_HTML;
  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}
