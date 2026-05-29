import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import ChatWindow from '../src/components/ChatWindow';
import MessageBubble from '../src/components/MessageBubble';
import HighlightedResponse from '../src/components/HighlightedResponse';
import LegendBar from '../src/components/LegendBar';

describe('Phase 1 - Chat Components Visual Tests', () => {
  it('ChatWindow renders children inside the chat body', () => {
    render(
      <ChatWindow modeLabel="Test Mode">
        <div data-testid="child">Hello World</div>
      </ChatWindow>
    );
    const child = screen.getByTestId('child');
    expect(child).toBeInTheDocument();
    expect(child.parentElement).toHaveClass('chat-body');
  });

  it('ChatWindow renders the modeLabel text in its header', () => {
    render(<ChatWindow modeLabel="Test Mode Label" />);
    expect(screen.getByText('Test Mode Label')).toBeInTheDocument();
    expect(screen.getByText('Test Mode Label')).toHaveClass('chat-header-label');
  });

  it('ChatWindow header contains three dot elements', () => {
    const { container } = render(<ChatWindow modeLabel="Test Mode" />);
    const dots = container.querySelectorAll('.chat-dot');
    expect(dots.length).toBe(3);
    expect(dots[0]).toHaveClass('red');
    expect(dots[1]).toHaveClass('yellow');
    expect(dots[2]).toHaveClass('green');
  });

  it('MessageBubble with role="user" renders with class or style that right-aligns it', () => {
    const { container } = render(
      <MessageBubble role="user">User content</MessageBubble>
    );
    const userContainer = container.querySelector('.msg-container-user');
    expect(userContainer).toBeInTheDocument();
    expect(userContainer).toHaveClass('msg-container-user');
  });

  it('MessageBubble with role="assistant" renders a label containing "Claude"', () => {
    render(
      <MessageBubble role="assistant">Assistant content</MessageBubble>
    );
    expect(screen.getByText('Claude')).toBeInTheDocument();
  });

  it('HighlightedResponse renders a span with class rl-inference', () => {
    const customHtml = 'Testing <span class="rl-inference">inference quote</span> here';
    const { container } = render(<HighlightedResponse html={customHtml} />);
    const highlight = container.querySelector('.rl-inference');
    expect(highlight).toBeInTheDocument();
    expect(highlight.textContent).toBe('inference quote');
  });

  it('HighlightedResponse renders a span with class rl-assumption', () => {
    const customHtml = 'Testing <span class="rl-assumption">assumption quote</span> here';
    const { container } = render(<HighlightedResponse html={customHtml} />);
    const highlight = container.querySelector('.rl-assumption');
    expect(highlight).toBeInTheDocument();
    expect(highlight.textContent).toBe('assumption quote');
  });

  it('HighlightedResponse renders a span with class rl-dependency', () => {
    const customHtml = 'Testing <span class="rl-dependency">dependency quote</span> here';
    const { container } = render(<HighlightedResponse html={customHtml} />);
    const highlight = container.querySelector('.rl-dependency');
    expect(highlight).toBeInTheDocument();
    expect(highlight.textContent).toBe('dependency quote');
  });

  it('LegendBar renders the text "Assumption"', () => {
    render(<LegendBar />);
    expect(screen.getByText('Assumption')).toBeInTheDocument();
  });

  it('LegendBar renders the text "Inference"', () => {
    render(<LegendBar />);
    expect(screen.getByText('Inference')).toBeInTheDocument();
  });

  it('LegendBar renders the text "Dependency"', () => {
    render(<LegendBar />);
    expect(screen.getByText('Dependency')).toBeInTheDocument();
  });
});
