import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppFlowProvider } from './context/AppFlowContext';
import App from './App';
import './index.css';

// Suppress ResizeObserver loop errors (harmless browser quirk)
const originalError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop')
  ) {
    return; // Suppress ResizeObserver loop errors
  }
  originalError.apply(console, args);
};

// Also handle uncaught errors
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('ResizeObserver loop') ||
     event.message.includes('ResizeObserver loop completed'))
  ) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppFlowProvider>
          <App />
          <Toaster position="top-right" />
        </AppFlowProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
