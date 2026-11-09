"use client";

import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { stockOnHand } from "@/lib/demo/compute";

export default function StockReportPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const rows = stockOnHand(state);

  return (
    <div>
      <PageHeader title="Stock report" subtitle="On-hand quantities" />
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, qty, value }) => (
              <tr key={item.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2 tabular-nums">
                  {qty} {item.unit}
                </td>
                <td className="px-3 py-2 tabular-nums">{formatPKR(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
