"use client";

import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { roundMoney } from "@/lib/money";

export default function ProfitLossPage() {
  const { state, ready } = useDemo();
  if (!ready) return null;

  let income = 0;
  let expense = 0;
  for (const v of state.vouchers) {
    for (const l of v.lines) {
      const acc = state.accounts.find((a) => a.id === l.accountId);
      if (!acc) continue;
      if (acc.type === "INCOME") income += l.credit - l.debit;
      if (acc.type === "EXPENSE") expense += l.debit - l.credit;
    }
  }
  income = roundMoney(income);
  expense = roundMoney(expense);
  const net = roundMoney(income - expense);

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Demo P&L" />
      <div className="card-panel space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Income</span>
          <span className="tabular-nums">{formatPKR(income)}</span>
        </div>
        <div className="flex justify-between">
          <span>Expenses</span>
          <span className="tabular-nums">{formatPKR(expense)}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--border)] pt-3 font-semibold">
          <span>Net</span>
          <span className="tabular-nums text-[var(--accent)]">{formatPKR(net)}</span>
        </div>
      </div>
    </div>
  );
}
