import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { profitAndLoss } from "@/lib/reports";
import { L } from "@/lib/labels";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const data = await profitAndLoss(sp.from, sp.to);
  const csv = [
    ["Section", "Code", "Name", "Amount"],
    ...data.income.map((r) => ["Income", r.code, r.name, String(r.amount)]),
    ["COGS", "", "Cost of goods (stock out)", String(data.cogs)],
    ...data.expenses.map((r) => ["Expense", r.code, r.name, String(r.amount)]),
    ["", "", "Net", String(data.net)],
  ];

  return (
    <div>
      <PageHeader title={L.profitLoss} />
      <Suspense>
        <DateRangeFilter />
      </Suspense>
      <div className="mb-3 no-print">
        <ExportCsvButton filename="profit-loss.csv" rows={csv} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-panel">
          <h2 className="mb-3 font-display text-lg font-semibold text-[var(--accent)]">
            Income (آمدنی)
          </h2>
          <ul className="space-y-2 text-sm">
            {data.income.map((r) => (
              <li key={r.code} className="flex justify-between gap-2">
                <span>
                  {r.code} {r.name}
                </span>
                <span className="tabular-nums">{formatPKR(r.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
              <span>{L.total}</span>
              <span>{formatPKR(data.totalIncome)}</span>
            </li>
          </ul>
        </div>
        <div className="card-panel">
          <h2 className="mb-3 font-display text-lg font-semibold text-[var(--accent)]">
            Expenses (اخراجات)
          </h2>
          <ul className="space-y-2 text-sm">
            {data.cogs ? (
              <li className="flex justify-between gap-2">
                <span>COGS (سٹاک آؤٹ)</span>
                <span className="tabular-nums">{formatPKR(data.cogs)}</span>
              </li>
            ) : null}
            {data.expenses.map((r) => (
              <li key={r.code} className="flex justify-between gap-2">
                <span>
                  {r.code} {r.name}
                </span>
                <span className="tabular-nums">{formatPKR(r.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
              <span>{L.total}</span>
              <span>{formatPKR(data.totalExpense)}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="card-panel mt-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold">
          {data.net >= 0 ? "Net Profit (منافع)" : "Net Loss (نقصان)"}
        </span>
        <span className="font-display text-2xl font-bold tabular-nums text-[var(--accent)]">
          {formatPKR(Math.abs(data.net))}
        </span>
      </div>
    </div>
  );
}
