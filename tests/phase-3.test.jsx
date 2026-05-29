import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import Sidebar from '../src/components/Sidebar';
import DirectedMode from '../src/components/DirectedMode';

describe('Phase 3 - Directed Mode Structure Tests', () => {
  it('Sidebar renders the title "Reasoning Layer"', () => {
    render(
      <Sidebar
        mode="directed"
        setMode={() => {}}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    const title = screen.getByRole('heading', { name: 'Reasoning Mode' });
    expect(title).toBeInTheDocument();
  });

  it('Sidebar renders a "Directed" button and a "Live" button', () => {
    render(
      <Sidebar
        mode="directed"
        setMode={() => {}}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Directed' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Live' })).toBeInTheDocument();
  });

  it('Clicking "Live" button triggers setMode with \'live\'', () => {
    const setMode = vi.fn();
    render(
      <Sidebar
        mode="directed"
        setMode={setMode}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Live' }));
    expect(setMode).toHaveBeenCalledWith('live');
  });

  it('Clicking "Directed" button triggers setMode with \'directed\'', () => {
    const setMode = vi.fn();
    render(
      <Sidebar
        mode="live"
        setMode={setMode}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Directed' }));
    expect(setMode).toHaveBeenCalledWith('directed');
  });

  it('Sidebar renders scenario nav links when mode is \'directed\'', () => {
    render(
      <Sidebar
        mode="directed"
        setMode={() => {}}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    expect(screen.getByText('All four elements')).toBeInTheDocument();
    expect(screen.getByText('Dependency heavy')).toBeInTheDocument();
    expect(screen.getByText('Inference only')).toBeInTheDocument();
    expect(screen.getByText('Multi-signal inference')).toBeInTheDocument();
    expect(screen.getByText('Clean response')).toBeInTheDocument();
  });

  it('Sidebar does NOT render scenario nav links when mode is \'live\'', () => {
    render(
      <Sidebar
        mode="live"
        setMode={() => {}}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    expect(screen.queryByText('All four elements')).toBeNull();
  });

  it('Clicking a scenario nav link triggers setActiveScenario with the correct index', () => {
    const setActiveScenario = vi.fn();
    render(
      <Sidebar
        mode="directed"
        setMode={() => {}}
        activeScenario={0}
        setActiveScenario={setActiveScenario}
      />
    );
    fireEvent.click(screen.getByText('Dependency heavy'));
    expect(setActiveScenario).toHaveBeenCalledWith(1);
  });

  it('The active scenario nav link has active class', () => {
    const { container } = render(
      <Sidebar
        mode="directed"
        setMode={() => {}}
        activeScenario={0}
        setActiveScenario={() => {}}
      />
    );
    const activeLink = container.querySelector('.sb-nav-link.active');
    expect(activeLink).toBeInTheDocument();
    expect(activeLink.textContent).toContain('All four elements');
  });

  it('DirectedMode renders NudgeCard when current step has showNudge true', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const step1Btn = screen.getByRole('button', { name: 'Step 1' });
    fireEvent.click(step1Btn);
    expect(container.querySelector('.nudge-card')).toBeInTheDocument();
  });

  it('DirectedMode renders LegendBar when current step has showLayer true', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const step2Btn = screen.getByRole('button', { name: 'Step 2' });
    fireEvent.click(step2Btn);
    expect(container.querySelector('.legend-bar')).toBeInTheDocument();
  });

  it('DirectedMode renders ChangeReceipt when current step has showReceipt true', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const step4Btn = screen.getByRole('button', { name: 'Step 4' });
    fireEvent.click(step4Btn);
    expect(container.querySelector('.change-receipt')).toBeInTheDocument();
  });

  it('DirectedMode renders step buttons matching the step count for activeScenario 0 (should render 5 buttons)', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const buttons = container.querySelectorAll('.dm-step-btn');
    expect(buttons.length).toBe(5);
    expect(buttons[0].textContent).toBe('Step 0');
    expect(buttons[4].textContent).toBe('Step 4');
  });

  it('DirectedMode renders step buttons matching the step count for activeScenario 1 (should render 3 buttons)', () => {
    const { container } = render(<DirectedMode activeScenario={1} />);
    const buttons = container.querySelectorAll('.dm-step-btn');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent).toBe('Step 0');
    expect(buttons[2].textContent).toBe('Step 2');
  });

  it('Clicking a step button changes the active step', () => {
    const { container } = render(<DirectedMode activeScenario={0} />);
    const step1Btn = screen.getByRole('button', { name: 'Step 1' });
    fireEvent.click(step1Btn);
    expect(step1Btn).toHaveClass('active');
    expect(container.querySelector('.dm-step-label').textContent).toContain('Nudge fires after response');
  });

  it('DirectedMode resets activeStep to 0 when activeScenario changes', () => {
    const { container, rerender } = render(<DirectedMode activeScenario={0} />);
    const step1Btn = screen.getByRole('button', { name: 'Step 1' });
    fireEvent.click(step1Btn);
    expect(container.querySelector('.dm-step-label').textContent).toContain('Nudge fires');

    rerender(<DirectedMode activeScenario={1} />);
    // Step 0 of scenario 1 is the placeholder step
    expect(container.querySelector('.dm-step-label').textContent).toContain('Placeholder');
  });
});
