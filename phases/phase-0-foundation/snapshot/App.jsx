import React from 'react';
import './styles/global.css';
import Sidebar from './components/Sidebar.jsx';

export default function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="placeholder-icon">✳</div>
        <h1 className="placeholder-title">Reasoning Layer</h1>
      </main>
    </div>
  );
}
