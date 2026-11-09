"use client";

import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import { StockForm } from "@/components/stock/StockForm";
import { useDemo } from "@/lib/demo/store";
import { stockOnHand } from "@/lib/demo/compute";
import { formatPKR } from "@/lib/money";

export default function StockPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;
  const rows = stockOnHand(state);

  return (
    <div>
      <PageHeader title={<Tx k="stock" />} subtitle="Inventory items" />
      <div className="card-panel mb-6">
        <StockForm />
      </div>
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, qty, value }) => (
              <tr key={item.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2">{item.category}</td>
                <td className="px-3 py-2">{item.unit}</td>
                <td className="px-3 py-2 tabular-nums">{qty}</td>
                <td className="px-3 py-2 tabular-nums">{formatPKR(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
