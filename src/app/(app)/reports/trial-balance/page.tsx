"use client";

import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { trialBalance } from "@/lib/demo/compute";

export default function TrialBalancePage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const rows = trialBalance(state);
  const totDr = rows.reduce((s, r) => s + r.debit, 0);
  const totCr = rows.reduce((s, r) => s + r.credit, 0);

  return (
    <div>
      <PageHeader title="Trial Balance" subtitle="From local demo vouchers" />
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Debit</th>
              <th className="px-3 py-2">Credit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.account.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 font-mono text-xs">{r.account.code}</td>
                <td className="px-3 py-2">{r.account.name}</td>
                <td className="px-3 py-2 tabular-nums">{r.debit ? formatPKR(r.debit) : ""}</td>
                <td className="px-3 py-2 tabular-nums">{r.credit ? formatPKR(r.credit) : ""}</td>
              </tr>
            ))}
            <tr className="border-t border-[var(--border)] font-semibold">
              <td className="px-3 py-2" colSpan={2}>
                Total
              </td>
              <td className="px-3 py-2 tabular-nums">{formatPKR(totDr)}</td>
              <td className="px-3 py-2 tabular-nums">{formatPKR(totCr)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
