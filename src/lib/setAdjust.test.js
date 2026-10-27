import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { seedBaseRec, topSet } from './setAdjust.js';

// SetTable has no calculated max (calcLoad() is 0), so set 1's
// recommendation has to come from what was actually lifted last time.
describe('seedBaseRec without a calculated max', () => {
  const rx = { sets: 3, reps: 8, target_rpe: 7 };
  const last = (weight, reps, rpe) => topSet([{ actual_weight: weight, actual_reps: reps, rpe }]);

  it('starts at last session’s top set when it hit the target', () => {
    assert.equal(seedBaseRec({ calcRec: 0, prescription: rx, lastTop: last(65, 8, 7) }), 65);
  });

  it('nudges up after an easy session and down after a hard one', () => {
    assert.ok(seedBaseRec({ calcRec: 0, prescription: rx, lastTop: last(65, 8, 6) }) > 65);
    assert.ok(seedBaseRec({ calcRec: 0, prescription: rx, lastTop: last(65, 8, 9) }) < 65);
  });

  it('still has nothing to suggest the first time', () => {
    assert.equal(seedBaseRec({ calcRec: 0, prescription: rx, lastTop: null }), 0);
  });

  it('keeps the calculated-max path unchanged', () => {
    assert.equal(seedBaseRec({ calcRec: 100, prescription: rx, lastTop: last(100, 8, 7) }), 100);
  });
});
