"use client";

import { PageHeader } from "@/components/PageHeader";
import { BackupRestore } from "@/components/settings/BackupRestore";
import { SettingsPreferences } from "@/components/prefs/PreferenceControls";
import { Tx } from "@/components/i18n/Tx";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title={<Tx k="settings" />} subtitle={<Tx k="preferences" />} />
      <SettingsPreferences />
      <BackupRestore />
    </div>
  );
}
