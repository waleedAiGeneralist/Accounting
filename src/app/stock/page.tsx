import { PageHeader } from "@/components/PageHeader";
import { StockForm } from "@/components/stock/StockForm";
import { stockReport } from "@/lib/reports";
import { L } from "@/lib/labels";
import { formatPKR } from "@/lib/money";
import Link from "next/link";


export const dynamic = "force-dynamic";
export default async function StockPage() {
  const rows = await stockReport();

  return (
    <div>
      <PageHeader
        title={L.stock}
        subtitle="Rice · Kiryana · Bardana"
        actions={
          <Link
            href="/reports/stock"
            className="rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          >
            {L.stockReport}
          </Link>
        }
      />
      <div className="card-panel mb-6">
        <StockForm />
      </div>
      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">{L.item}</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">{L.qty}</th>
              <th className="px-3 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">
                  {r.name} <span className="text-[var(--muted)]">({r.unit})</span>
                </td>
                <td className="px-3 py-2">{r.category}</td>
                <td className="px-3 py-2 text-right tabular-nums">{r.qty}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
