"use client";

import { PageHeader } from "@/components/PageHeader";
import { formatPKR, roundMoney } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { accountByCode } from "@/lib/demo/compute";

export default function ReceivablesPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const recv = accountByCode(state.accounts, "1003");
  const byParty = new Map<string, number>();
  for (const v of state.vouchers) {
    if (!v.partyId) continue;
    for (const l of v.lines) {
      if (l.accountId !== recv?.id) continue;
      byParty.set(v.partyId, roundMoney((byParty.get(v.partyId) ?? 0) + l.debit - l.credit));
    }
  }
  const rows = [...byParty.entries()]
    .map(([id, bal]) => ({
      party: state.parties.find((p) => p.id === id),
      bal,
    }))
    .filter((r) => r.party && r.bal > 0);

  return (
    <div>
      <PageHeader title="Receivables" subtitle="What customers owe" />
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Party</th>
              <th className="px-3 py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.party!.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{r.party!.name}</td>
                <td className="px-3 py-2 tabular-nums">{formatPKR(r.bal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
