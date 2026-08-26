# Perennial

A simple, equipment-aware strength and movement plan — built for being fit
at 40, 60, and beyond.

- **Three days a week**: two ~30-minute full-body strength days, one easy
  Move day (zone-2 walk + gentle mobility).
- **Equipment-aware**: a first-run question asks what you own; every slot
  resolves to the best variant your gear allows. Bodyweight is a
  first-class version of the plan, not a fallback. Tick a new box in
  Settings the day something arrives and the slots upgrade themselves.
- **Local-first**: all data lives on your device. No account, no backend,
  no tracking. Settings → Export produces a single JSON backup.
- **Gentle by design**: prescriptions leave reps in the tank, and the
  mobility work is written around real shoulders and lower backs.

## Stack

React 19 · Vite · TanStack Query (over on-device storage) · Zustand ·
vite-plugin-pwa. Deployed as a PWA via GitHub Pages; installs from the
browser on Android (menu → *Add to Home screen*) and iOS (Share → *Add to
Home Screen*).

## Develop

```bash
npm install
npm run dev
```

## Deploy

Push to `main` — GitHub Actions builds and publishes to Pages
automatically. No secrets required.
