// The Evergreen program — three days a week, fit for life.
//
// Two short full-body strength days (A and B) and one Move day (easy cardio +
// mobility). Strength twice a week plus regular zone-2 movement is the
// best-evidenced minimum for healthspan: muscle, bone, balance, and the
// engine — without living in a gym.
//
// EQUIPMENT-AWARE SLOTS: each strength slot lists variants in preference
// order; the app picks the first one whose `needs` are covered by what the
// user said they own (Settings → Equipment, set during onboarding). The last
// variant in every chain needs nothing, so the program always resolves — a
// fully bodyweight run is a first-class version of the plan, not a fallback
// apology.

import { EX } from './exercises';

// Onboarding / Settings equipment catalog.
export const EQUIPMENT = [
  { id: 'dumbbells',  label: 'Dumbbells',            hint: 'Any pair, adjustable or fixed' },
  { id: 'kettlebell', label: 'Kettlebell',           hint: 'One is plenty' },
  { id: 'bands',      label: 'Resistance bands',     hint: 'Loop or handle style' },
  { id: 'pullup_bar', label: 'Pull-up bar',          hint: 'Doorway bar counts' },
  { id: 'bench',      label: 'Bench / sturdy step',  hint: 'A solid bottom stair works' },
];

// Warm-up — same short list both strength days. ~4 minutes, no equipment.
export const WARMUP = [
  'March in place — 60 sec, arms swinging',
  'Arm circles — 10 forward, 10 back',
  'Cat-cow — 8 slow rounds',
  'Standing hip circles — 5 each way',
  'Bodyweight good morning — 10, hands on hips',
  'Half-kneeling hip flexor stretch — 30 sec each side',
];

// ── Strength day slots ──────────────────────────────────────────────────────
// slot: { role, label, variants: [exKey, ...] } — variants in preference
// order; resolution picks the first whose needs ⊆ owned equipment.

export const DAYS = {
  a: {
    id: 'a',
    name: 'Foundations A',
    blurb: 'Squat, push, pull, carry. About 30 minutes.',
    kind: 'strength',
    slots: [
      { role: 'squat',   label: 'Squat',          variants: ['goblet_squat_db', 'goblet_squat_kb', 'chair_squat'] },
      { role: 'push',    label: 'Push',           variants: ['db_floor_press', 'band_chest_press', 'incline_pushup'] },
      { role: 'pull',    label: 'Pull',           variants: ['db_row', 'band_row', 'backpack_row'] },
      { role: 'carry',   label: 'Carry',          variants: ['suitcase_carry_db', 'suitcase_carry_kb', 'backpack_carry'] },
      { role: 'balance', label: 'Balance & core', variants: ['sl_balance_reach'] },
    ],
  },
  b: {
    id: 'b',
    name: 'Foundations B',
    blurb: 'Hinge, single leg, press, rotation. About 30 minutes.',
    kind: 'strength',
    slots: [
      { role: 'hinge',      label: 'Hinge',        variants: ['kb_deadlift', 'db_rdl', 'glute_bridge'] },
      { role: 'single_leg', label: 'Single leg',   variants: ['split_squat_db', 'step_up', 'split_squat_bw'] },
      { role: 'press',      label: 'Press',        variants: ['db_press', 'band_press', 'wall_pushup_plus'] },
      { role: 'upper_back', label: 'Upper back',   variants: ['dead_hang', 'band_pulldown', 'prone_swimmers'] },
      { role: 'rotation',   label: 'Rotation',     variants: ['kb_coil_walk', 'band_rotation', 'hip_coil_walk'] },
    ],
  },
  move: {
    id: 'move',
    name: 'Move & Breathe',
    blurb: 'An easy 30–45 minute walk (or ride) plus five minutes of mobility.',
    kind: 'move',
    cardio: {
      key: 'zone2_walk',
      name: 'Easy walk / ride / anything',
      cue: 'Comfortable pace — you should be able to talk in full sentences the whole time. Outside beats treadmill for the soul, but both count. Log the minutes.',
      targetMin: '30–45 min',
    },
    mobility: [
      'Deep bodyweight squat hold, hands on a support — 3×20 sec',
      'Standing calf + wall lean stretch — 30 sec each side',
      'Doorway chest stretch — 30 sec each side',
      'Slow neck half-circles — 5 each way',
      'One-minute single-leg balance — eyes forward, switch halfway',
    ],
  },
};

export const DAY_ORDER = ['a', 'b', 'move'];

// Weekly rhythm suggestion shown on Today (no enforcement — life happens).
export const WEEK_SHAPE = 'A · Move · B — with easy days between. Any order that fits your week is right.';

// ── Equipment resolution ────────────────────────────────────────────────────
export function resolveVariant(variants, owned) {
  const have = new Set(owned ?? []);
  for (const key of variants) {
    const needs = EX[key]?.needs ?? [];
    if (needs.every((n) => have.has(n))) return key;
  }
  return variants[variants.length - 1]; // last is always bodyweight
}

// All variants the user could run right now (for the swap picker): the ones
// their equipment allows, with the rest shown disabled by the UI if desired.
export function availableVariants(variants, owned) {
  const have = new Set(owned ?? []);
  return variants.filter((key) => (EX[key]?.needs ?? []).every((n) => have.has(n)));
}
