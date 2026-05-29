import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Import components to verify they load correctly
import Sidebar from '../src/components/Sidebar';
import DirectedMode from '../src/components/DirectedMode';
import LiveMode from '../src/components/LiveMode';
import ChatWindow from '../src/components/ChatWindow';
import MessageBubble from '../src/components/MessageBubble';
import HighlightedResponse from '../src/components/HighlightedResponse';
import NudgeCard from '../src/components/NudgeCard';
import ReasoningPanel from '../src/components/ReasoningPanel';
import ChangeReceipt from '../src/components/ChangeReceipt';
import LegendBar from '../src/components/LegendBar';

// Import utils to verify they load correctly
import { generateResponse as api } from '../src/utils/api';
import { buildHighlightedHTML as quoteMatch } from '../src/utils/quoteMatch';
import { isCorrectionIntent as correctionDetect } from '../src/utils/correctionDetect';
import { getDismissalCount as storage } from '../src/utils/storage';

describe('Phase 0 Baseline Tests', () => {
  it('should verify global.css exists and is non-empty', () => {
    const cssPath = path.resolve(__dirname, '../src/styles/global.css');
    expect(fs.existsSync(cssPath)).toBe(true);
    const content = fs.readFileSync(cssPath, 'utf8');
    expect(content.trim().length).toBeGreaterThan(0);
  });

  it('should verify all components import successfully', () => {
    expect(Sidebar).toBeDefined();
    expect(DirectedMode).toBeDefined();
    expect(LiveMode).toBeDefined();
    expect(ChatWindow).toBeDefined();
    expect(MessageBubble).toBeDefined();
    expect(HighlightedResponse).toBeDefined();
    expect(NudgeCard).toBeDefined();
    expect(ReasoningPanel).toBeDefined();
    expect(ChangeReceipt).toBeDefined();
    expect(LegendBar).toBeDefined();
  });

  it('should verify all utility stubs import successfully', () => {
    expect(api).toBeDefined();
    expect(quoteMatch).toBeDefined();
    expect(correctionDetect).toBeDefined();
    expect(storage).toBeDefined();
  });

  it('should verify App.jsx imports global.css', () => {
    const appPath = path.resolve(__dirname, '../src/App.jsx');
    expect(fs.existsSync(appPath)).toBe(true);
    const appContent = fs.readFileSync(appPath, 'utf8');
    expect(appContent).toContain('global.css');
  });
});
