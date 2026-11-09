"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";
import { useDemo } from "@/lib/demo/store";

export default function VouchersPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const rows = [...state.vouchers].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const partyName = (id: string | null) =>
    state.parties.find((p) => p.id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title={<Tx k="vouchers" />}
        subtitle="All entries"
        actions={
          <div className="flex flex-wrap gap-2">
            {[
              ["/vouchers/cash?kind=receipt", "Cash receipt"],
              ["/vouchers/cash?kind=payment", "Cash payment"],
              ["/vouchers/sale", "Sale"],
              ["/vouchers/purchase", "Purchase"],
              ["/vouchers/expense", "Expense"],
              ["/vouchers/journal", "Journal"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold hover:bg-[var(--surface-2)]"
              >
                {label}
              </Link>
            ))}
          </div>
        }
      />
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Party</th>
              <th className="px-3 py-2">Narration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{v.date}</td>
                <td className="px-3 py-2">
                  <Link className="text-[var(--accent)] hover:underline" href={`/vouchers/${v.id}`}>
                    {v.type}
                    {v.isReversal ? " (rev)" : ""}
                  </Link>
                </td>
                <td className="px-3 py-2">{partyName(v.partyId)}</td>
                <td className="px-3 py-2">{v.narration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
