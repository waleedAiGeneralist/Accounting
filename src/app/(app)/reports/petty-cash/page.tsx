"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { pettyCashBook } from "@/lib/demo/compute";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { PrintButton } from "@/components/reports/PrintButton";

export default function PettyCashBookPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const rows = pettyCashBook(state);
  const last = rows[rows.length - 1];

  const csv = [
    ["S#", "Date", "Post Ref", "Head of A/C", "Project", "Party", "Description", "Debit", "Credit", "Balance"],
    ...rows.map((r) => [
      r.sno,
      r.date,
      r.postRef,
      r.head,
      r.project,
      r.party,
      r.description,
      String(r.debit || ""),
      String(r.credit || ""),
      String(r.balance),
    ]),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Petty Cash Book"
        subtitle="Hidden Hills Hotels & Resort — daily petty cash (double-entry)"
        actions={
          <>
            <Link
              href="/vouchers/cash?kind=payment"
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white"
            >
              New payment
            </Link>
            <Link
              href="/vouchers/cash?kind=receipt"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-semibold"
            >
              New receipt
            </Link>
            <ExportCsvButton rows={csv} filename="petty-cash-book.csv" />
            <PrintButton />
          </>
        }
      />

      <div className="text-sm text-[var(--muted)]">
        Closing balance:{" "}
        <span className="font-semibold text-[var(--fg)]">
          {formatPKR(last?.balance ?? 0)}
        </span>{" "}
        · {rows.length} lines from browser demo data
      </div>

      <div className="card-panel table-scroll p-0">
        <table className="w-full min-w-[960px] text-left text-xs sm:text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--muted)]">
            <tr>
              <th className="px-2 py-2">S#</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Post Ref</th>
              <th className="px-2 py-2">Head of A/C</th>
              <th className="px-2 py-2">Project</th>
              <th className="px-2 py-2">Party</th>
              <th className="px-2 py-2">Description</th>
              <th className="px-2 py-2 text-right">Debit</th>
              <th className="px-2 py-2 text-right">Credit</th>
              <th className="px-2 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--border)] align-top">
                <td className="px-2 py-1.5 tabular-nums">{r.sno}</td>
                <td className="px-2 py-1.5 whitespace-nowrap">{r.date}</td>
                <td className="px-2 py-1.5">{r.postRef}</td>
                <td className="px-2 py-1.5">{r.head}</td>
                <td className="px-2 py-1.5">{r.project}</td>
                <td className="px-2 py-1.5">{r.party}</td>
                <td className="px-2 py-1.5">
                  <Link href={`/vouchers/${r.id}`} className="hover:text-[var(--accent)] hover:underline">
                    {r.description}
                  </Link>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {r.debit ? formatPKR(r.debit) : ""}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {r.credit ? formatPKR(r.credit) : ""}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums font-medium">
                  {formatPKR(r.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
