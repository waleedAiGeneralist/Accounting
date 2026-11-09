"use client";

import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import { useDemo } from "@/lib/demo/store";

export default function AccountsPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;

  return (
    <div>
      <PageHeader title={<Tx k="accounts" />} subtitle="Chart of accounts" />
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Urdu</th>
              <th className="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {state.accounts.map((a) => (
              <tr key={a.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 font-mono text-xs">{a.code}</td>
                <td className="px-3 py-2 font-medium">{a.name}</td>
                <td className="px-3 py-2">{a.nameUrdu}</td>
                <td className="px-3 py-2">{a.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
