import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global fetch interceptor to ensure all backend requests send credentials (cookies)
const originalFetch = window.fetch;
window.fetch = function (input, init = {}) {
  const url = typeof input === 'string' ? input : (input && input.url);
  if (typeof url === 'string' && (url.includes('/api') || url.includes('localhost:8000'))) {
    init.credentials = 'include';
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
