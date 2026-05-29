import React, { useState } from 'react';
import './styles/global.css';
import Sidebar from './components/Sidebar.jsx';
import DirectedMode from './components/DirectedMode.jsx';
import LiveMode from './components/LiveMode.jsx';

export default function App() {
  const [mode, setMode] = useState('directed');
  const [activeScenario, setActiveScenario] = useState(0);

  return (
    <div className="app-container">
      <Sidebar
        mode={mode}
        setMode={setMode}
        activeScenario={activeScenario}
        setActiveScenario={setActiveScenario}
      />
      <main className="main-content">
        {mode === 'directed' && (
          <DirectedMode activeScenario={activeScenario} />
        )}
        {mode === 'live' && (
          <LiveMode />
        )}
      </main>
    </div>
  );
}
