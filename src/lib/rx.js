// Prescription helpers — Perennial keeps this deliberately simple.
//
// No percentages, no periodization math. Loads are seeded from your own last
// session (see SetTable + setAdjust); rest is a friendly default you can
// always skip or extend.

const REST_DEFAULTS = {
  strength: 90,
  core: 60,
  move: 60,
};

export function getRestTime(context) {
  return REST_DEFAULTS[context] ?? 90;
}

// Longer rest after harder sets, shorter after easy ones. Target effort in
// Perennial is ~7 ("2-3 reps left in the tank").
export function rpeRestAdjust(rpe) {
  if (rpe == null) return 0;
  if (rpe <= 6)   return -15;
  if (rpe <= 7.5) return 0;
  if (rpe <= 8.5) return 15;
  return 30;
}

// SetTable compat: Perennial has no %1RM math — recommendations come purely
// from your own logged history (seedBaseRec handles that). Returning 0 here
// means "no calculated load", which the seeding path treats as absent.
export function calcLoad() {
  return 0;
}

// Session rows carry a phase field in the original schema; Perennial has a
// single steady phase.
export function getPhase() {
  return 'steady';
}
