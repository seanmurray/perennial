# Evergreen — Fit for Life

A simple, equipment-aware strength and movement plan. Built for Ankit:
three short sessions a week (two full-body strength days + one easy
Move day), gentle by design, with athletic movement DNA (hip coil, carries,
hinging) at a calm intensity.

## Principles

- **Equipment-aware.** First run asks what you have on hand; every workout
  slot resolves to the best variant your equipment allows, with bodyweight
  as a first-class fallback — never an apology. Change equipment any time
  in Settings and the plan re-adapts instantly.
- **Local-first.** All data lives on your phone. No account, no cloud, no
  tracking. Settings → Export produces a single JSON backup you can stash
  anywhere; Import restores it.
- **Leave reps in the tank.** No percentages, no maxes. Load suggestions
  seed from your own last session; target effort is ~7/10.

## Stack

React 19 + Vite + TanStack Query + Zustand. PWA (installable from the
browser via "Add to Home Screen" on Android). Forked from the
soccer-performance-coach codebase, stripped of its backend and
athlete-specific programming.

## Dev

```bash
npm install
npm run dev
```

## Program

| Day | Focus |
|---|---|
| Foundations A | Squat · Push · Pull · Carry · Balance |
| Foundations B | Hinge · Single leg · Press · Upper back · Rotation |
| Move & Breathe | 30–45 min easy cardio + 5 min mobility |

Program data lives in `src/data/program.js` (days, slots, equipment
catalog, warm-up) and `src/data/exercises.js` (variants + cues).
