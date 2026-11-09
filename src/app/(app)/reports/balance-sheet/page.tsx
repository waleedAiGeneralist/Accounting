"use client";

import { PageHeader } from "@/components/PageHeader";
import { formatPKR, roundMoney } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";

export default function BalanceSheetPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;

  const bal = (id: string) => {
    let b = 0;
    for (const v of state.vouchers) {
      for (const l of v.lines) {
        if (l.accountId === id) b += l.debit - l.credit;
      }
    }
    return roundMoney(b);
  };

  const section = (type: "ASSET" | "LIABILITY" | "EQUITY") =>
    state.accounts
      .filter((a) => a.type === type)
      .map((a) => ({ a, b: bal(a.id) }))
      .filter((x) => x.b !== 0);

  const assets = section("ASSET");
  const liabilities = section("LIABILITY").map((x) => ({ ...x, b: -x.b }));
  const equity = section("EQUITY").map((x) => ({ ...x, b: -x.b }));

  const sum = (rows: { b: number }[]) => roundMoney(rows.reduce((s, r) => s + r.b, 0));

  return (
    <div className="space-y-4">
      <PageHeader title="Balance Sheet" subtitle="Demo snapshot" />
      {[
        ["Assets", assets],
        ["Liabilities", liabilities],
        ["Equity", equity],
      ].map(([title, rows]) => (
        <div key={title as string} className="card-panel table-scroll p-0">
          <div className="border-b border-[var(--border)] px-3 py-2 font-display font-semibold">
            {title as string}
          </div>
          <table className="w-full text-sm">
            <tbody>
              {(rows as { a: { id: string; name: string }; b: number }[]).map((r) => (
                <tr key={r.a.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2">{r.a.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.b)}</td>
                </tr>
              ))}
              <tr className="border-t border-[var(--border)] font-semibold">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatPKR(sum(rows as { b: number }[]))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
