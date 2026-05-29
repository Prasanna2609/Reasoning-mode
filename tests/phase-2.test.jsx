import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import ReasoningPanel from '../src/components/ReasoningPanel';
import NudgeCard from '../src/components/NudgeCard';
import ChangeReceipt from '../src/components/ChangeReceipt';

describe('Phase 2 - Overlay Components Tests', () => {
  it('ReasoningPanel renders collapsed by default — panel body not visible', () => {
    const { container } = render(<ReasoningPanel />);
    const body = container.querySelector('.rp-body');
    expect(body).toBeNull();
  });

  it('ReasoningPanel expands when header is clicked', () => {
    const { container } = render(<ReasoningPanel />);
    const header = container.querySelector('.rp-header');
    fireEvent.click(header);
    const body = container.querySelector('.rp-body');
    expect(body).toBeInTheDocument();
  });

  it('ReasoningPanel collapses again when header is clicked a second time', () => {
    const { container } = render(<ReasoningPanel />);
    const header = container.querySelector('.rp-header');
    // First click to expand
    fireEvent.click(header);
    expect(container.querySelector('.rp-body')).toBeInTheDocument();
    // Second click to collapse
    fireEvent.click(header);
    expect(container.querySelector('.rp-body')).toBeNull();
  });

  it('ReasoningPanel renders an inference row with label colored red', () => {
    const { container } = render(<ReasoningPanel />);
    const header = container.querySelector('.rp-header');
    fireEvent.click(header);
    const label = container.querySelector('.rp-label.inference');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('inference');
  });

  it('ReasoningPanel renders an assumption row with label colored amber', () => {
    const { container } = render(<ReasoningPanel />);
    const header = container.querySelector('.rp-header');
    fireEvent.click(header);
    const label = container.querySelector('.rp-label.assumption');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('assumption');
  });

  it('ReasoningPanel renders a dependency row with label colored blue', () => {
    const { container } = render(<ReasoningPanel />);
    const header = container.querySelector('.rp-header');
    fireEvent.click(header);
    const label = container.querySelector('.rp-label.dependency');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('dependency');
  });

  it('ReasoningPanel inference row renders its badge element', () => {
    const { container } = render(<ReasoningPanel />);
    const header = container.querySelector('.rp-header');
    fireEvent.click(header);
    const badge = container.querySelector('.rp-badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('GENERAL BENCHMARK');
  });

  it('NudgeCard renders a button with text "Activate Reasoning Mode"', () => {
    render(<NudgeCard />);
    expect(screen.getByText('Activate Reasoning Mode')).toBeInTheDocument();
  });

  it('NudgeCard renders a button with text "Not now"', () => {
    render(<NudgeCard />);
    expect(screen.getByText('Not now')).toBeInTheDocument();
  });

  it('NudgeCard calls onActivate when primary button is clicked', () => {
    const onActivate = vi.fn();
    render(<NudgeCard onActivate={onActivate} />);
    fireEvent.click(screen.getByText('Activate Reasoning Mode'));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('NudgeCard calls onDismiss when ghost button is clicked', () => {
    const onDismiss = vi.fn();
    render(<NudgeCard onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Not now'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('ChangeReceipt renders the label "CHANGE RECEIPT"', () => {
    render(<ChangeReceipt />);
    expect(screen.getByText('CHANGE RECEIPT')).toBeInTheDocument();
  });

  it('ChangeReceipt renders items passed in the changed array', () => {
    const changed = ['Sprint cycle updated'];
    render(<ChangeReceipt changed={changed} />);
    expect(screen.getByText('Sprint cycle updated')).toBeInTheDocument();
  });

  it('ChangeReceipt renders items passed in the unchanged array', () => {
    const unchanged = ['Budget remains the same'];
    render(<ChangeReceipt unchanged={unchanged} />);
    expect(screen.getByText('Budget remains the same')).toBeInTheDocument();
  });

  it('ChangeReceipt renders items passed in the stillOpen array', () => {
    const stillOpen = ['Sprint length is open'];
    render(<ChangeReceipt stillOpen={stillOpen} />);
    expect(screen.getByText('Sprint length is open')).toBeInTheDocument();
  });
});
