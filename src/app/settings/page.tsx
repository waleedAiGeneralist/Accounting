import { PageHeader } from "@/components/PageHeader";
import { BackupRestore } from "@/components/settings/BackupRestore";
import { L } from "@/lib/labels";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title={L.settings}
        subtitle="Dark mode is in the top bar · backup/restore below"
      />
      <BackupRestore />
    </div>
  );
}
