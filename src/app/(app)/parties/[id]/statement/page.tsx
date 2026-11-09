"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR, roundMoney } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { accountByCode } from "@/lib/demo/compute";

export default function PartyStatementPage() {
  const params = useParams<{ id: string }>();
  const { state, ready } = useDemo();
  if (!ready) return null;
  const party = state.parties.find((p) => p.id === params.id);
  if (!party) return <div className="card-panel">Party not found</div>;

  const recv = accountByCode(state.accounts, "1003");
  const pay = accountByCode(state.accounts, "2001");
  let bal = 0;
  const lines: Array<{ date: string; narration: string; amount: number }> = [];
  for (const v of state.vouchers) {
    if (v.partyId !== party.id) continue;
    for (const l of v.lines) {
      if (l.accountId !== recv?.id && l.accountId !== pay?.id) continue;
      const delta = l.debit - l.credit;
      bal = roundMoney(bal + delta);
      lines.push({ date: v.date, narration: v.narration, amount: delta });
    }
  }

  const text = encodeURIComponent(
    `Hisab Kitab statement for ${party.name}\nBalance: ${formatPKR(bal)}\n(Demo preview)`
  );
  const wa = party.phone
    ? `https://wa.me/92${party.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${text}`
    : null;

  return (
    <div className="space-y-4">
      <PageHeader
        title={party.name}
        subtitle="Party statement"
        actions={
          wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
            >
              WhatsApp
            </a>
          ) : null
        }
      />
      <div className="card-panel text-sm">
        Balance: <strong className="tabular-nums">{formatPKR(bal)}</strong>
      </div>
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Narration</th>
              <th className="px-3 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{l.date}</td>
                <td className="px-3 py-2">{l.narration}</td>
                <td className="px-3 py-2 tabular-nums">{formatPKR(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
