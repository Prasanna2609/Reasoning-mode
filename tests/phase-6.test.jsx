import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { buildHighlightedHTML } from '../src/utils/quoteMatch';
import { isCorrectionIntent } from '../src/utils/correctionDetect';
import {
  getDismissalCount,
  incrementDismissalCount,
  getReasoningMode,
  setReasoningMode,
} from '../src/utils/storage';
import LiveMode from '../src/components/LiveMode';

// ── Mock localStorage ─────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();

beforeEach(() => {
  localStorageMock.clear();
  vi.stubGlobal('localStorage', localStorageMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── buildHighlightedHTML tests ────────────────────────────────────────────────
describe('Phase 6 - quoteMatch utility', () => {
  it('wraps exact match in span with rl-inference class', () => {
    const response = 'You should hire a senior engineer immediately.';
    const { html } = buildHighlightedHTML(response, {
      inference_flags: [{ quote: 'hire a senior engineer', type: 'inference' }],
      assumptions: [],
      dependencies: [],
    });
    expect(html).toContain('<span class="rl-inference">hire a senior engineer</span>');
  });

  it('wraps exact match in span with rl-assumption class', () => {
    const response = 'This is a systems problem not a people problem.';
    const { html } = buildHighlightedHTML(response, {
      inference_flags: [],
      assumptions: [{ quote: 'systems problem not a people problem', type: 'assumption' }],
      dependencies: [],
    });
    expect(html).toContain('<span class="rl-assumption">systems problem not a people problem</span>');
  });

  it('wraps exact match in span with rl-dependency class', () => {
    const response = 'Budget availability determines the outcome.';
    const { html } = buildHighlightedHTML(response, {
      inference_flags: [],
      assumptions: [],
      dependencies: [{ quote: 'Budget availability determines the outcome', type: 'dependency' }],
    });
    expect(html).toContain('<span class="rl-dependency">Budget availability determines the outcome</span>');
  });

  it('returns unmatched array for non-matching quote', () => {
    const response = 'The sky is blue.';
    const { unmatched } = buildHighlightedHTML(response, {
      inference_flags: [{ quote: 'completely nonexistent phrase xyz', type: 'inference' }],
      assumptions: [],
      dependencies: [],
    });
    expect(unmatched.length).toBe(1);
  });

  it('handles empty reasoningData without throwing', () => {
    expect(() => buildHighlightedHTML('Some text.', {})).not.toThrow();
    expect(() => buildHighlightedHTML('Some text.')).not.toThrow();
  });
});

// ── isCorrectionIntent tests ──────────────────────────────────────────────────
describe('Phase 6 - correctionDetect utility', () => {
  it('returns false when hasActiveLayer is false', () => {
    expect(isCorrectionIntent('actually that is wrong', false)).toBe(false);
  });

  it('returns false for message ending with ?', () => {
    expect(isCorrectionIntent('Is that actually true?', true)).toBe(false);
  });

  it('returns false for message starting with "what "', () => {
    expect(isCorrectionIntent('what do you mean by that', true)).toBe(false);
  });

  it('returns true for message containing "actually"', () => {
    expect(isCorrectionIntent('Actually that is not right', true)).toBe(true);
  });

  it('returns true for message containing "not right"', () => {
    expect(isCorrectionIntent('That estimate is not right', true)).toBe(true);
  });

  it('returns false for ambiguous message with no signals', () => {
    expect(isCorrectionIntent('I think we should reconsider', true)).toBe(false);
  });
});

// ── storage utility tests ─────────────────────────────────────────────────────
describe('Phase 6 - storage utility', () => {
  it('getDismissalCount returns 0 when localStorage empty', () => {
    expect(getDismissalCount()).toBe(0);
  });

  it('incrementDismissalCount increments and returns new value', () => {
    const v1 = incrementDismissalCount();
    const v2 = incrementDismissalCount();
    expect(v1).toBe(1);
    expect(v2).toBe(2);
  });

  it('getReasoningMode returns false when not set', () => {
    expect(getReasoningMode()).toBe(false);
  });

  it('setReasoningMode persists value retrievable by getReasoningMode', () => {
    setReasoningMode(true);
    expect(getReasoningMode()).toBe(true);
    setReasoningMode(false);
    expect(getReasoningMode()).toBe(false);
  });
});

// ── LiveMode component tests ──────────────────────────────────────────────────
describe('Phase 6 - LiveMode component', () => {
  it('renders a text input', () => {
    render(<LiveMode />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a send button', () => {
    render(<LiveMode />);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('renders a Reasoning Mode toggle button', () => {
    render(<LiveMode />);
    expect(screen.getByRole('button', { name: /reasoning mode/i })).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    render(<LiveMode />);
    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();
  });

  it('Reasoning Mode toggle shows correct label when OFF', () => {
    render(<LiveMode />);
    const toggle = screen.getByLabelText('Reasoning Mode OFF');
    expect(toggle).toBeInTheDocument();
    expect(toggle.textContent).toBe('Reasoning Mode OFF');
  });
});
