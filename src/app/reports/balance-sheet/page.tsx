import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { balanceSheet } from "@/lib/reports";
import { L } from "@/lib/labels";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
function Section({
  title,
  rows,
  total,
}: {
  title: string;
  rows: { code: string; name: string; nameUrdu: string; amount: number }[];
  total: number;
}) {
  return (
    <div className="card-panel">
      <h2 className="mb-3 font-display text-lg font-semibold text-[var(--accent)]">{title}</h2>
      <ul className="space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.code + r.name} className="flex justify-between gap-2">
            <span>
              {r.code} {r.name}{" "}
              <span className="urdu text-[var(--muted)]">({r.nameUrdu})</span>
            </span>
            <span className="tabular-nums">{formatPKR(r.amount)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold">
          <span>{L.total}</span>
          <span>{formatPKR(total)}</span>
        </li>
      </ul>
    </div>
  );
}

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; from?: string }>;
}) {
  const sp = await searchParams;
  const data = await balanceSheet(sp.to);
  const csv = [
    ["Section", "Code", "Name", "Amount"],
    ...data.assets.map((r) => ["Asset", r.code, r.name, String(r.amount)]),
    ...data.liabilities.map((r) => ["Liability", r.code, r.name, String(r.amount)]),
    ...data.equity.map((r) => ["Equity", r.code, r.name, String(r.amount)]),
  ];

  return (
    <div>
      <PageHeader title={L.balanceSheet} subtitle={sp.to ? `As of ${sp.to}` : "As of today"} />
      <Suspense>
        <DateRangeFilter />
      </Suspense>
      <div className="mb-3 no-print">
        <ExportCsvButton filename="balance-sheet.csv" rows={csv} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Assets (اثاثے)" rows={data.assets} total={data.totalAssets} />
        <div className="space-y-4">
          <Section
            title="Liabilities (واجبات)"
            rows={data.liabilities}
            total={data.liabilities.reduce((s, r) => s + r.amount, 0)}
          />
          <Section
            title="Equity (سرمایہ)"
            rows={data.equity}
            total={data.equity.reduce((s, r) => s + r.amount, 0)}
          />
          <div className="card-panel flex justify-between font-semibold">
            <span>Liabilities + Equity</span>
            <span className="tabular-nums">{formatPKR(data.totalLiabEquity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
