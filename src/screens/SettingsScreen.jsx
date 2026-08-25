import { useRef, useState } from 'react';
import styles from './SettingsScreen.module.css';
import { EQUIPMENT } from '../data/program';
import { useSettingsStore } from '../stores/settingsStore';
import { TimerSoundRecorder } from '../components/TimerSoundRecorder';
import { exportAll, importAll } from '../lib/localdb';
import { queryClient } from '../lib/queryClient';

function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <label className={styles.toggleRow}>
      <div>
        <div className={styles.rowLabel}>{label}</div>
        {sub && <div className={styles.rowSub}>{sub}</div>}
      </div>
      <input
        type="checkbox"
        className={styles.toggle}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function SettingsScreen() {
  const equipment = useSettingsStore((s) => s.equipment);
  const toggleEquipment = useSettingsStore((s) => s.toggleEquipment);
  const weeklyGoal = useSettingsStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useSettingsStore((s) => s.setWeeklyGoal);
  const timerPrefs = useSettingsStore((s) => s.timerPrefs);
  const setTimerPref = useSettingsStore((s) => s.setTimerPref);

  const [backupMsg, setBackupMsg] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const importRef = useRef(null);

  const doExport = async () => {
    const json = exportAll();
    try {
      if (navigator.share) {
        const file = new File([json], `evergreen-backup-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
        await navigator.share({ files: [file], title: 'Evergreen backup' });
        setBackupMsg('Shared ✓');
        return;
      }
    } catch { /* fall through to clipboard */ }
    try {
      await navigator.clipboard.writeText(json);
      setBackupMsg('Copied to clipboard ✓ — paste it somewhere safe');
    } catch {
      setBackupMsg('Could not export automatically.');
    }
  };

  const doImport = () => {
    const res = importAll(importRef.current?.value ?? '');
    if (res.ok) {
      queryClient.invalidateQueries();
      setBackupMsg(`Restored ${res.sessions} sessions ✓`);
      setImportOpen(false);
    } else {
      setBackupMsg(res.error);
    }
  };

  return (
    <main className="screen">
      <div className="overline">Make it yours</div>
      <div className="title-xl">SETTINGS</div>

      <div className={styles.sectionLabel}>My equipment</div>
      <div className={styles.hint}>The plan re-adapts the moment you change these.</div>
      <div className={styles.group}>
        {EQUIPMENT.map((eq) => (
          <ToggleRow
            key={eq.id}
            label={eq.label}
            sub={eq.hint}
            checked={equipment.includes(eq.id)}
            onChange={() => toggleEquipment(eq.id)}
          />
        ))}
      </div>

      <div className={styles.sectionLabel}>Weekly goal</div>
      <div className={styles.goalRow}>
        <button type="button" className={styles.stepBtn} onClick={() => setWeeklyGoal(weeklyGoal - 1)} aria-label="Lower goal">−</button>
        <div className={styles.goalVal}>{weeklyGoal} days / week</div>
        <button type="button" className={styles.stepBtn} onClick={() => setWeeklyGoal(weeklyGoal + 1)} aria-label="Raise goal">+</button>
      </div>

      <div className={styles.sectionLabel}>Rest timer</div>
      <div className={styles.group}>
        <ToggleRow label="Auto-start timer" sub="Starts when a set is marked done"
          checked={timerPrefs.autoStart} onChange={(v) => setTimerPref('autoStart', v)} />
        <ToggleRow label="Sound" sub="Beeps near the end, tone at zero"
          checked={timerPrefs.audio} onChange={(v) => setTimerPref('audio', v)} />
        <ToggleRow label="Vibrate" sub="Gentle buzz on transitions"
          checked={timerPrefs.vibrate} onChange={(v) => setTimerPref('vibrate', v)} />
        <ToggleRow label="Keep screen on during rest" sub="So the phone doesn't sleep mid-timer"
          checked={timerPrefs.keepAwake !== false} onChange={(v) => setTimerPref('keepAwake', v)} />
        <TimerSoundRecorder />
      </div>

      <div className={styles.sectionLabel}>Your data</div>
      <div className={styles.hint}>
        Everything lives only on this phone — no account, no cloud. Export a
        backup now and then and stash it anywhere you like.
      </div>
      <div className={styles.backupRow}>
        <button type="button" className={styles.backupBtn} onClick={doExport}>Export backup</button>
        <button type="button" className={styles.backupBtnAlt} onClick={() => setImportOpen((o) => !o)}>
          {importOpen ? 'Cancel import' : 'Import backup'}
        </button>
      </div>
      {importOpen && (
        <div className={styles.importBox}>
          <textarea
            ref={importRef}
            className={styles.importArea}
            rows={4}
            placeholder="Paste the backup JSON here…"
          />
          <button type="button" className={styles.backupBtn} onClick={doImport}>Restore</button>
        </div>
      )}
      {backupMsg && <div className={styles.backupMsg}>{backupMsg}</div>}

      <p className={styles.about}>
        Evergreen · a simple plan for being strong at every age.
      </p>
    </main>
  );
}
