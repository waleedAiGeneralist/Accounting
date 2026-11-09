"use client";

import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { accountByCode } from "@/lib/demo/compute";

export default function CashBookPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const cash = accountByCode(state.accounts, "1001");
  const rows = state.vouchers
    .flatMap((v) =>
      v.lines
        .filter((l) => l.accountId === cash?.id)
        .map((l) => ({ v, l }))
    )
    .sort((a, b) => a.v.date.localeCompare(b.v.date));

  return (
    <div>
      <PageHeader title="Cash book" subtitle="Cash in hand movements" />
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Narration</th>
              <th className="px-3 py-2">In</th>
              <th className="px-3 py-2">Out</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ v, l }) => (
              <tr key={l.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{v.date}</td>
                <td className="px-3 py-2">{v.narration}</td>
                <td className="px-3 py-2 tabular-nums">{l.debit ? formatPKR(l.debit) : ""}</td>
                <td className="px-3 py-2 tabular-nums">{l.credit ? formatPKR(l.credit) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
