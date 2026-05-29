import React, { useState } from 'react';
import './styles/global.css';
import Sidebar from './components/Sidebar.jsx';
import DirectedMode from './components/DirectedMode.jsx';
import LiveMode from './components/LiveMode.jsx';
import { getReasoningMode, setReasoningMode as setStorageReasoningMode } from './utils/storage.js';

export default function App() {
  const [mode, setMode] = useState('live');
  const [activeScenario, setActiveScenario] = useState(0);
  const [reasoningMode, setReasoningMode] = useState(() => getReasoningMode());

  const handleRMToggle = (newVal) => {
    setReasoningMode(newVal);
    setStorageReasoningMode(newVal);
  };

  return (
    <div className="app-container">
      <Sidebar
        mode={mode}
        setMode={setMode}
        reasoningMode={reasoningMode}
        setReasoningMode={handleRMToggle}
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
      />
      <main className="main-content-layout">
        {/* Top Centered Mode Toggle Bar */}
        <div className="top-mode-toggle-bar">
          <div className="mode-toggle-inner">
            <button
              className={`mode-toggle-btn ${mode === 'directed' ? 'active' : ''}`}
              onClick={() => setMode('directed')}
            >
              Directed
            </button>
            <button
              className={`mode-toggle-btn ${mode === 'live' ? 'active' : ''}`}
              onClick={() => setMode('live')}
            >
              Live
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="main-pane-content">
          {mode === 'directed' && (
            <DirectedMode
              activeScenario={activeScenario}
              setActiveScenario={setActiveScenario}
              reasoningMode={reasoningMode}
            />
          )}
          {mode === 'live' && (
            <LiveMode reasoningMode={reasoningMode} />
          )}
        </div>
      </main>
    </div>
  );
}
