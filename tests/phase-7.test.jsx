import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { isCorrectionIntent } from '../src/utils/correctionDetect.js';
import {
  generateConversationId,
  saveConversation,
  getConversations,
  getConversationById,
} from '../src/utils/storage.js';
import ChangeReceipt from '../src/components/ChangeReceipt.jsx';

// ── localStorage reset between tests ─────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
});

// ── Phase 7 — Integration Tests ───────────────────────────────────────────────
describe('Phase 7 - Integration Tests', () => {

  // ── isCorrectionIntent ─────────────────────────────────────────────────────

  it('isCorrectionIntent returns false when hasActiveLayer is false', () => {
    expect(isCorrectionIntent('actually the number is 50', false)).toBe(false);
  });

  it('isCorrectionIntent returns true for message containing "actually"', () => {
    expect(isCorrectionIntent('actually that is not right', true)).toBe(true);
  });

  it('isCorrectionIntent returns true for message containing "to clarify"', () => {
    expect(isCorrectionIntent('to clarify, the budget is fixed', true)).toBe(true);
  });

  it('isCorrectionIntent returns false for message ending with ?', () => {
    expect(isCorrectionIntent('actually is this right?', true)).toBe(false);
  });

  it('isCorrectionIntent returns true for message with number + contrast word over 20 chars', () => {
    // "but" (contrast) + "3" (number) + length > 20
    expect(isCorrectionIntent('we have 3 engineers but no budget for more', true)).toBe(true);
  });

  // ── generateConversationId ─────────────────────────────────────────────────

  it('generateConversationId returns a string starting with "conv_"', () => {
    const id = generateConversationId();
    expect(typeof id).toBe('string');
    expect(id.startsWith('conv_')).toBe(true);
  });

  // ── saveConversation / getConversations ────────────────────────────────────

  it('saveConversation saves to localStorage and getConversations returns it', () => {
    const conv = { id: 'conv_test_001', title: 'Test chat', messages: [], updatedAt: Date.now() };
    saveConversation(conv);
    const all = getConversations();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('conv_test_001');
    expect(all[0].title).toBe('Test chat');
  });

  it('getConversations returns empty array when localStorage is empty', () => {
    const all = getConversations();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBe(0);
  });

  it('saveConversation caps history at 20 items', () => {
    // Save 25 unique conversations
    for (let i = 0; i < 25; i++) {
      saveConversation({
        id: `conv_${i}`,
        title: `Chat ${i}`,
        messages: [],
        updatedAt: Date.now() + i,
      });
    }
    const all = getConversations();
    expect(all.length).toBe(20);
  });

  // ── getConversationById ────────────────────────────────────────────────────

  it('getConversationById returns correct conversation by id', () => {
    const convA = { id: 'conv_aaa', title: 'Alpha', messages: [], updatedAt: 1 };
    const convB = { id: 'conv_bbb', title: 'Beta',  messages: [], updatedAt: 2 };
    saveConversation(convA);
    saveConversation(convB);
    const found = getConversationById('conv_aaa');
    expect(found).not.toBeNull();
    expect(found.title).toBe('Alpha');
  });

  // ── ChangeReceipt component ───────────────────────────────────────────────

  it('ChangeReceipt renders changed items when passed a changed array', () => {
    render(
      <ChangeReceipt
        changed={['Recommendation updated to reflect 4-week sprint']}
        unchanged={[]}
        stillOpen={[]}
      />
    );
    expect(
      screen.getByText('Recommendation updated to reflect 4-week sprint')
    ).toBeInTheDocument();
  });

  it('ChangeReceipt renders stillOpen items when passed a stillOpen array', () => {
    render(
      <ChangeReceipt
        changed={[]}
        unchanged={[]}
        stillOpen={['Team capacity has not been confirmed']}
      />
    );
    expect(
      screen.getByText('Team capacity has not been confirmed')
    ).toBeInTheDocument();
  });

});
