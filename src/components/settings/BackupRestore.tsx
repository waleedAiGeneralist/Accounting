"use client";

import { useState } from "react";
import { Flash } from "@/components/vouchers/Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { useDemo } from "@/lib/demo/store";

export function BackupRestore() {
  const { t } = usePrefs();
  const { exportJson, importJson, resetDemo } = useDemo();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onBackup() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hisab-kitab-demo-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded (browser storage).");
  }

  async function onRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setMsg(null);
    try {
      const text = await file.text();
      const res = importJson(text);
      if (!res.ok) throw new Error(res.error);
      setMsg("Restored. Reloading…");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="card-panel space-y-4">
      <h2 className="font-display text-lg font-semibold">Demo data</h2>
      <Flash error={error} success={msg} />
      <p className="text-sm text-[var(--muted)]">
        This client preview stores data in your browser only — no server database.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onBackup}
          className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
        >
          <Tx k="backup" />
        </button>
        <label className="inline-flex cursor-pointer items-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]">
          {t("restore")}
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={onRestore}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset to sample demo data?")) {
              resetDemo();
              setMsg("Demo data reset.");
            }
          }}
          className="inline-flex items-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]"
        >
          Reset sample data
        </button>
      </div>
    </div>
  );
}
