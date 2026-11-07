import { PageHeader } from "@/components/PageHeader";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { PrintButton } from "@/components/reports/PrintButton";
import { stockReport } from "@/lib/reports";
import { L } from "@/lib/labels";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function StockReportPage() {
  const rows = await stockReport();
  const csv = [
    ["Name", "Category", "Unit", "Qty", "Avg Rate", "Value"],
    ...rows.map((r) => [
      r.name,
      r.category,
      r.unit,
      String(r.qty),
      String(r.avgRate),
      String(r.value),
    ]),
  ];
  const totalValue = rows.reduce((s, r) => s + r.value, 0);

  return (
    <div>
      <PageHeader title={L.stockReport} />
      <div className="mb-3 no-print flex gap-2">
        <ExportCsvButton filename="stock.csv" rows={csv} />
        <PrintButton />
      </div>
      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">{L.item}</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">{L.qty}</th>
              <th className="px-3 py-2 text-right">Avg {L.rate}</th>
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
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.avgRate)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.value)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--border)] bg-[var(--surface-2)] font-semibold">
              <td className="px-3 py-2" colSpan={4}>
                {L.total}
              </td>
              <td className="px-3 py-2 text-right">{formatPKR(totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
