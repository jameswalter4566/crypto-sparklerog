import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Debug logging
console.log('Initializing application...');

// Polyfill Buffer and global for the browser
window.Buffer = Buffer;
window.global = window;

// Debug check for polyfills
console.log('Buffer polyfill status:', {
  hasBuffer: typeof window.Buffer !== 'undefined',
  hasGlobal: typeof window.global !== 'undefined'
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);