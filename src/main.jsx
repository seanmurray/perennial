import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { recoverIfNeeded, backupSoon } from './lib/localdb.js'
import { useSettingsStore } from './stores/settingsStore'
import { useSlotStore } from './stores/slotStore'

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

const PREF_STORES = [useSettingsStore, useSlotStore];

// If localStorage lost the primary keys but a backup copy survived (the
// IndexedDB mirror or the last-known-good snapshot), restore before the first
// render — otherwise the app paints an empty history and the next save writes
// that emptiness back over the top. The preference stores loaded from
// localStorage when their modules were imported, i.e. BEFORE this ran, so
// after a restore they must re-read it. Otherwise they'd keep empty defaults,
// show onboarding, and finishing it would write those defaults over the
// restored settings.
recoverIfNeeded()
  .then(async (r) => {
    if (!r) return;
    console.warn(`[perennial] Restored ${r.restored} session(s) from ${r.from}.`);
    await Promise.all(PREF_STORES.map((s) => s.persist.rehydrate()));
  })
  .catch(() => { /* recovery is best-effort; never block boot */ })
  .finally(() => {
    // Settings and standing swaps change outside localdb's writes, so each
    // change schedules a backup of everything.
    PREF_STORES.forEach((s) => s.subscribe(() => backupSoon()));
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
