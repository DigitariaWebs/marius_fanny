import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global fetch interceptor: inject bearer token for cross-domain auth
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : '';
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl && url.startsWith(apiUrl)) {
    const token = localStorage.getItem('bearer_token');
    if (token) {
      const headers = new Headers(init?.headers);
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      init = { ...init, headers };
    }
  }
  return originalFetch.call(this, input, init);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)