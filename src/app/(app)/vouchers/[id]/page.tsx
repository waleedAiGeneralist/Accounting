"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";

export default function VoucherDetailPage() {
  const params = useParams<{ id: string }>();
  const { state, ready, reverseVoucher } = useDemo();
  if (!ready) return null;
  const v = state.vouchers.find((x) => x.id === params.id);
  if (!v) {
    return (
      <div className="card-panel">
        Voucher not found. <Link href="/vouchers">Back</Link>
      </div>
    );
  }
  const party = state.parties.find((p) => p.id === v.partyId);
  const accName = (id: string) => {
    const a = state.accounts.find((x) => x.id === id);
    return a ? `${a.code} ${a.name}` : id;
  };
  const alreadyReversed = state.vouchers.some((x) => x.reversesId === v.id);

  return (
    <div className="space-y-4">
      <PageHeader
        title={v.type}
        subtitle={v.narration}
        actions={
          !v.isReversal && !alreadyReversed ? (
            <button
              type="button"
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
              onClick={() => {
                if (!confirm("Reverse this voucher?")) return;
                const res = reverseVoucher(v.id);
                if (!res.ok) alert(res.error);
                else window.location.href = `/vouchers/${res.id}`;
              }}
            >
              Reverse
            </button>
          ) : null
        }
      />
      <div className="card-panel text-sm space-y-1">
        <div>Date: {v.date}</div>
        <div>Party: {party?.name ?? "—"}</div>
        <div>Project: {v.project ?? "—"}</div>
        <div>Head of A/C: {v.head ?? "—"}</div>
        <div>Post Ref: {v.postRef ?? "—"}</div>
        {v.isReversal ? <div>Reversal of {v.reversesId}</div> : null}
        <p className="pt-2 text-[var(--muted)]">
          Double entry: every debit has a matching credit (trial balance stays in balance).
        </p>
      </div>
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Debit</th>
              <th className="px-3 py-2">Credit</th>
            </tr>
          </thead>
          <tbody>
            {v.lines.map((l) => (
              <tr key={l.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{accName(l.accountId)}</td>
                <td className="px-3 py-2 tabular-nums">{l.debit ? formatPKR(l.debit) : ""}</td>
                <td className="px-3 py-2 tabular-nums">{l.credit ? formatPKR(l.credit) : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
