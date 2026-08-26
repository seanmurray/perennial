import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Dev-mode service-worker cleanup. vite-plugin-pwa only generates an SW in
// production builds, but a developer who once ran `npm run build/preview`
// can have a stale SW registered for localhost that then intercepts dev
// fetches. Clear it on dev boot.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    if (regs.length > 0) {
      console.log('[dev] Unregistering', regs.length, 'service worker(s).');
      regs.forEach((r) => r.unregister());
    }
  }).catch(() => { /* ignore */ });
}

// All of the user's data lives in on-device storage. Ask the browser to mark
// it PERSISTENT so Android can't auto-evict it under storage pressure —
// granted near-automatically for installed PWAs; harmless no-op elsewhere.
// (This protects against eviction, not against the user clearing site data —
// Settings → Export backup remains the belt-and-suspenders.)
if (navigator.storage?.persist) {
  navigator.storage.persisted().then((already) => {
    if (!already) navigator.storage.persist().catch(() => {});
  }).catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
