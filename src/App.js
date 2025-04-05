import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [appReady, setAppReady] = useState(false);

  const handlePushIt = () => {
    setLoading(true);
    setAppReady(false);
    // Simulate code generation/deployment delay
    setTimeout(() => {
      setLoading(false);
      setAppReady(true);
    }, 2000);
  };

  return (
    <div className="container">
      <div className="app-box">
        <input
          type="text"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          className="input-field"
        />
        <button
          onClick={handlePushIt}
          disabled={loading || prompt.trim() === ""}
          className="push-button"
        >
          Push It
        </button>
        {loading && <div className="loading">Loading...</div>}
        {appReady && (
          <div className="result">
            <p>Your app is ready!</p>
            <a href="https://push-todo.vercel.app" target="_blank" rel="noopener noreferrer">
              Visit App
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
