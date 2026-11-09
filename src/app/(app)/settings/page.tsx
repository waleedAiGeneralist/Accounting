import { PageHeader } from "@/components/PageHeader";
import { BackupRestore } from "@/components/settings/BackupRestore";
import { SettingsPreferences } from "@/components/prefs/PreferenceControls";
import { Tx } from "@/components/i18n/Tx";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <PageHeader
        title={<Tx k="settings" />}
        subtitle={
          session ? (
            <span>
              Signed in as {session.email} ({session.role})
            </span>
          ) : (
            <Tx k="preferences" />
          )
        }
      />
      <SettingsPreferences />
      {isAdmin ? (
        <BackupRestore />
      ) : (
        <div className="card-panel space-y-1 text-sm text-[var(--muted)]">
          <p>Your account is view-only.</p>
          <p>
            Creating vouchers, parties, stock, and backup/restore require an
            admin.
          </p>
        </div>
      )}
    </div>
  );
}
