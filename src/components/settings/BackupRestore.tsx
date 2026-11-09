"use client";

import { useState } from "react";
import { Flash } from "@/components/vouchers/Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";

export function BackupRestore() {
  const { t } = usePrefs();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onBackup() {
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await fetch("/api/backup", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Backup failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hisab-kitab-backup.json";
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Backup downloaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backup failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("Restore will replace the current database. Continue?")) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/restore", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");
      setMsg("Database restored. Reloading…");
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="card-panel space-y-4">
      <h2 className="font-display text-lg font-semibold">Database (ڈیٹا بیس)</h2>
      <Flash error={error} success={msg} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onBackup()}
          className="inline-flex items-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
        >
          {busy ? "…" : <Tx k="backup" />}
        </button>
        <label className="inline-flex cursor-pointer items-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-2)]">
          {busy ? "…" : t("restore")}
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={onRestore}
          />
        </label>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Download a JSON backup of all accounts, parties, stock, and vouchers — or
        upload a previous export to restore. Admin only.
      </p>
    </div>
  );
}
