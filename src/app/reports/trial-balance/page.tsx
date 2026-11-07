import { Suspense } from "react";
import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { trialBalance } from "@/lib/reports";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const data = await trialBalance(sp.from, sp.to);
  const csv = [
    ["Code", "Name", "Urdu", "Debit", "Credit"],
    ...data.rows.map((r) => [r.code, r.name, r.nameUrdu, String(r.debit), String(r.credit)]),
    ["", "TOTAL", "", String(data.totalDebit), String(data.totalCredit)],
  ];

  return (
    <div>
      <PageHeader title={<Tx k="trialBalance" />} />
      <Suspense>
        <DateRangeFilter />
      </Suspense>
      <div className="mb-3 no-print">
        <ExportCsvButton filename="trial-balance.csv" rows={csv} />
      </div>
      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2"><Tx k="account" /></th>
              <th className="px-3 py-2 text-right"><Tx k="debit" /></th>
              <th className="px-3 py-2 text-right"><Tx k="credit" /></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.code} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{r.code}</td>
                <td className="px-3 py-2">
                  {r.name} <span className="urdu text-[var(--muted)]">({r.nameUrdu})</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.debit ? formatPKR(r.debit) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.credit ? formatPKR(r.credit) : ""}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--border)] bg-[var(--surface-2)] font-semibold">
              <td className="px-3 py-2" colSpan={2}>
                <Tx k="total" />
              </td>
              <td className="px-3 py-2 text-right">{formatPKR(data.totalDebit)}</td>
              <td className="px-3 py-2 text-right">{formatPKR(data.totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
