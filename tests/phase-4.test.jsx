import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import scenarios from '../src/data/scenarios';
import DirectedMode from '../src/components/DirectedMode';

describe('Phase 4 - Scenario Data and DirectedMode Rendering', () => {
  // ── Data integrity ──────────────────────────────────────────────────
  it('scenarios.js exports an array of length 5', () => {
    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios.length).toBe(5);
  });

  it('scenarios[0] has 4 steps', () => {
    expect(scenarios[0].steps.length).toBe(4);
  });

  it('scenarios[1] has 1 step', () => {
    expect(scenarios[1].steps.length).toBe(1);
  });

  it('scenarios[2] has 1 step', () => {
    expect(scenarios[2].steps.length).toBe(1);
  });

  it('scenarios[3] has 3 steps', () => {
    expect(scenarios[3].steps.length).toBe(3);
  });

  it('scenarios[4] has 1 step', () => {
    expect(scenarios[4].steps.length).toBe(1);
  });

  it('scenarios[0].steps[1].showLayer is true', () => {
    expect(scenarios[0].steps[1].showLayer).toBe(true);
  });

  it('scenarios[0].steps[0].showNudge is true', () => {
    expect(scenarios[0].steps[0].showNudge).toBe(true);
  });

  it('scenarios[0].steps[3].showReceipt is true', () => {
    expect(scenarios[0].steps[3].showReceipt).toBe(true);
  });

  it('scenarios[0].steps[1].reasoningItems has length 4', () => {
    expect(scenarios[0].steps[1].reasoningItems.length).toBe(4);
  });

  // ── Rendering ────────────────────────────────────────────────────────
  it('DirectedMode renders NudgeCard when current step has showNudge true', () => {
    const originalNudge = scenarios[0].steps[1].showNudge;
    scenarios[0].steps[1].showNudge = true;
    
    const { container } = render(<DirectedMode activeScenario={0} />);
    const card = screen.getByText('All four elements').closest('.scenario-card');
    fireEvent.click(card);
    
    // Initial Send
    fireEvent.click(screen.getByRole('button', { name: 'Send query' }));
    
    // Nudge is shown on step 0
    // Click activate to go to step 1
    fireEvent.click(screen.getByText('Activate Reasoning Mode'));
    
    expect(container.querySelector('.nudge-card')).toBeInTheDocument();
    
    scenarios[0].steps[1].showNudge = originalNudge;
  });

  it('DirectedMode renders LegendBar when current step has showLayer true', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const card = screen.getByText('All four elements').closest('.scenario-card');
    fireEvent.click(card);
    
    fireEvent.click(screen.getByRole('button', { name: 'Send query' }));
    fireEvent.click(screen.getByText('Activate Reasoning Mode'));
    
    expect(container.querySelector('.legend-bar')).toBeInTheDocument();
  });

  it('DirectedMode renders ChangeReceipt when current step has showReceipt true', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const card = screen.getByText('All four elements').closest('.scenario-card');
    fireEvent.click(card);
    
    fireEvent.click(screen.getByRole('button', { name: 'Send query' }));
    fireEvent.click(screen.getByText('Activate Reasoning Mode'));
    fireEvent.click(screen.getByRole('button', { name: 'Send query' }));
    
    expect(container.querySelector('.change-receipt')).toBeInTheDocument();
  });

  it('DirectedMode renders user message text in a bubble', () => {
    render(<DirectedMode activeScenario={0} />);
    const card = screen.getByText('All four elements').closest('.scenario-card');
    fireEvent.click(card);
    
    fireEvent.click(screen.getByRole('button', { name: 'Send query' }));
    
    // Step 0 user message is rendered in a bubble when chat has started
    expect(screen.getByText(/What should we prioritize/)).toBeInTheDocument();
  });
});
