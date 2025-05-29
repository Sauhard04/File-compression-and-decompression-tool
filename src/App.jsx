import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FileCompressor from './components/FileCompressor';
import FileDecompressor from './components/FileDecompressor';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [count, setCount] = useState(0)

  const [mode, setMode] = useState('compress');
  const [theme, setTheme] = useState(() =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Set theme on root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="app-bg">
      <button
        className="theme-toggle"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.4s',
          transform: theme === 'dark' ? 'rotate(-30deg)' : 'rotate(0deg)'
        }}>
          {theme === 'dark' ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07-1.41-1.41M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
          )}
        </span>
      </button>
      <div className="container">
        <div className="header">
          <h1 className="main-title">File Compression Tool</h1>
          <div className="subtitle">
            Compress your files using Huffman Coding Algorithm
          </div>
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <button
              className={`btn btn-blue${mode === 'compress' ? ' active' : ''}`}
              style={{ marginRight: 12 }}
              onClick={() => setMode('compress')}
            >
              Compress File
            </button>
            <button
              className={`btn btn-green${mode === 'decompress' ? ' active' : ''}`}
              onClick={() => setMode('decompress')}
            >
              Decompress File
            </button>
          </div>
        </div>
        {mode === 'compress' ? <FileCompressor /> : <FileDecompressor />}
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App
