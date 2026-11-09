"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Select } from "@/components/ui/FormField";
import { formatPKR, roundMoney } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";

function LedgerInner() {
  const sp = useSearchParams();
  const { state, ready } = useDemo();
  const [accountId, setAccountId] = useState(
    sp.get("accountId") || state.accounts[0]?.id || ""
  );
  const rows = useMemo(() => {
    let bal = 0;
    const out: Array<{
      date: string;
      narration: string;
      debit: number;
      credit: number;
      balance: number;
    }> = [];
    for (const v of [...state.vouchers].sort((a, b) => a.date.localeCompare(b.date))) {
      for (const l of v.lines) {
        if (l.accountId !== accountId) continue;
        bal = roundMoney(bal + l.debit - l.credit);
        out.push({
          date: v.date,
          narration: v.narration,
          debit: l.debit,
          credit: l.credit,
          balance: bal,
        });
      }
    }
    return out;
  }, [state.vouchers, accountId]);

  if (!ready) return null;

  return (
    <div>
      <PageHeader title="Ledger" subtitle="Account activity" />
      <div className="card-panel mb-4">
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {state.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Narration</th>
              <th className="px-3 py-2">Debit</th>
              <th className="px-3 py-2">Credit</th>
              <th className="px-3 py-2">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2">{r.narration}</td>
                <td className="px-3 py-2 tabular-nums">{r.debit ? formatPKR(r.debit) : ""}</td>
                <td className="px-3 py-2 tabular-nums">{r.credit ? formatPKR(r.credit) : ""}</td>
                <td className="px-3 py-2 tabular-nums">{formatPKR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[var(--muted)]">Loading…</div>}>
      <LedgerInner />
    </Suspense>
  );
}
