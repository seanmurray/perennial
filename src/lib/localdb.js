// Local-first storage — ALL of Ankit's data lives on their device.
//
// No backend, no account, nothing leaves the phone. Three collections in
// localStorage (sessions / sets / perf) plus a notes map, mirroring the row
// shapes the UI components were originally built around, so SetTable's
// last-session seeding and the inline history keep working unchanged.
//
// Backup story: Settings → Export copies a single JSON blob (share it
// anywhere); Import restores it. That's deliberate — simple and legible
// beats sync infrastructure for a personal training log.

const KEYS = {
  sessions: 'evergreen-sessions',
  sets: 'evergreen-sets',
  perf: 'evergreen-perf',
  notes: 'evergreen-notes',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

const uuid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

// ── Sessions ────────────────────────────────────────────────────────────────
export function getSessions() {
  return read(KEYS.sessions, []).sort((a, b) => (b.performed_at ?? '').localeCompare(a.performed_at ?? ''));
}

// payload: { dayId, dayLabel, sessionRpe, energy, setsBuffer, perfBuffer,
//            warmupChecked, warmupTotal, sessionStartedAt, sessionEndedAt }
export function saveSession(payload) {
  const id = uuid();
  const now = new Date().toISOString();

  const session = {
    id,
    performed_at: now,
    day_id: payload.dayId ?? null,
    day_label: payload.dayLabel ?? 'Workout',
    session_rpe: payload.sessionRpe ?? null,
    energy: payload.energy ?? null,
    sets_logged: payload.setsBuffer?.length ?? 0,
    exercises_logged: new Set((payload.setsBuffer ?? []).map((s) => s.exercise_key)).size,
    perf_logged: payload.perfBuffer?.length ?? 0,
    warmup_done: (payload.warmupChecked?.length ?? 0) >= (payload.warmupTotal ?? Infinity),
    started_at: payload.sessionStartedAt ?? null,
    ended_at: payload.sessionEndedAt ?? null,
    created_at: now,
  };

  const sets = (payload.setsBuffer ?? []).map((s) => ({ id: uuid(), session_id: id, ...s }));
  const perf = (payload.perfBuffer ?? []).map((p) => ({ id: uuid(), session_id: id, ...p }));

  const ok =
    write(KEYS.sessions, [...read(KEYS.sessions, []), session]) &&
    write(KEYS.sets, [...read(KEYS.sets, []), ...sets]) &&
    write(KEYS.perf, [...read(KEYS.perf, []), ...perf]);

  return ok ? { ok: true, id } : { ok: false, error: new Error('Device storage is full — export a backup, then clear old data.') };
}

export function deleteSession(sessionId) {
  write(KEYS.sessions, read(KEYS.sessions, []).filter((s) => s.id !== sessionId));
  write(KEYS.sets, read(KEYS.sets, []).filter((s) => s.session_id !== sessionId));
  write(KEYS.perf, read(KEYS.perf, []).filter((p) => p.session_id !== sessionId));
  return { ok: true };
}

// ── Per-exercise history (shaped like the original hooks expect) ────────────
export function getSetHistory(exerciseKey, limit = 3) {
  const rows = read(KEYS.sets, [])
    .filter((r) => r.exercise_key === exerciseKey)
    .sort((a, b) => (b.performed_at ?? '').localeCompare(a.performed_at ?? ''));
  const grouped = new Map();
  for (const row of rows) {
    let bucket = grouped.get(row.session_id);
    if (!bucket) {
      if (grouped.size >= limit) continue;
      bucket = { sessionId: row.session_id, performedAt: row.performed_at, sets: [] };
      grouped.set(row.session_id, bucket);
    }
    bucket.sets.push({ set_num: row.set_num, actual_reps: row.actual_reps, actual_weight: row.actual_weight, rpe: row.rpe });
  }
  const out = Array.from(grouped.values());
  out.forEach((b) => b.sets.sort((a, c) => (a.set_num ?? 0) - (c.set_num ?? 0)));
  return out;
}

export function getPerfHistory(exerciseKey, limit = 3) {
  const seen = new Set();
  const out = [];
  const rows = read(KEYS.perf, [])
    .filter((r) => r.exercise_key === exerciseKey)
    .sort((a, b) => (b.performed_at ?? '').localeCompare(a.performed_at ?? ''));
  for (const row of rows) {
    if (seen.has(row.session_id)) continue;
    seen.add(row.session_id);
    out.push({
      sessionId: row.session_id,
      performedAt: row.performed_at,
      exerciseName: row.exercise_name,
      effortRpe: row.effort_rpe ?? null,
      notes: row.notes ?? '',
    });
    if (out.length >= limit) break;
  }
  return out;
}

// ── Form-cue notes ──────────────────────────────────────────────────────────
export function getNotes() {
  return read(KEYS.notes, {});
}
export function setNote(exerciseKey, exerciseName, note) {
  const map = read(KEYS.notes, {});
  map[exerciseKey] = { exercise_key: exerciseKey, exercise_name: exerciseName, note, updated_at: new Date().toISOString() };
  write(KEYS.notes, map);
}

// ── Backup ──────────────────────────────────────────────────────────────────
export function exportAll() {
  return JSON.stringify(
    {
      app: 'evergreen',
      version: 1,
      exported_at: new Date().toISOString(),
      sessions: read(KEYS.sessions, []),
      sets: read(KEYS.sets, []),
      perf: read(KEYS.perf, []),
      notes: read(KEYS.notes, {}),
    },
    null,
    2
  );
}

export function importAll(json) {
  let data;
  try { data = JSON.parse(json); } catch { return { ok: false, error: 'That file is not valid JSON.' }; }
  if (data?.app !== 'evergreen' || !Array.isArray(data.sessions)) {
    return { ok: false, error: 'That does not look like an Evergreen backup.' };
  }
  write(KEYS.sessions, data.sessions);
  write(KEYS.sets, data.sets ?? []);
  write(KEYS.perf, data.perf ?? []);
  write(KEYS.notes, data.notes ?? {});
  return { ok: true, sessions: data.sessions.length };
}
