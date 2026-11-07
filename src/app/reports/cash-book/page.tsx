import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { cashBook } from "@/lib/reports";
import { L } from "@/lib/labels";
import { formatDate, todayISO } from "@/lib/dates";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function CashBookPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from ?? todayISO();
  const to = sp.to ?? todayISO();
  const data = await cashBook(from, to);
  const csv = [
    ["Date", "Narration", "Debit", "Credit", "Balance"],
    ...data.rows.map((r) => [
      formatDate(r.date),
      r.narration,
      String(r.debit),
      String(r.credit),
      String(r.balance),
    ]),
  ];

  return (
    <div>
      <PageHeader title={L.cashBook} subtitle={`${from} → ${to}`} />
      <Suspense>
        <DateRangeFilter />
      </Suspense>
      <div className="mb-3 no-print">
        <ExportCsvButton filename="cash-book.csv" rows={csv} />
      </div>
      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">{L.date}</th>
              <th className="px-3 py-2">{L.narration}</th>
              <th className="px-3 py-2 text-right">In</th>
              <th className="px-3 py-2 text-right">Out</th>
              <th className="px-3 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)] text-[var(--muted)]">
              <td className="px-3 py-2" colSpan={4}>
                Opening
              </td>
              <td className="px-3 py-2 text-right">{formatPKR(data.opening)}</td>
            </tr>
            {data.rows.map((r) => (
              <tr key={`${r.voucherId}-${r.balance}`} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">
                  <Link href={`/vouchers/${r.voucherId}`} className="text-[var(--accent)] hover:underline">
                    {formatDate(r.date)}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.narration}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.debit ? formatPKR(r.debit) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.credit ? formatPKR(r.credit) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
