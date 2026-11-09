"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { dashboardStats, recentVouchers, pettyCashBook } from "@/lib/demo/compute";

export default function DashboardPage() {
  const { state, ready } = useDemo();
  if (!ready) {
    return <div className="p-6 text-sm text-[var(--muted)]">Loading demo…</div>;
  }
  const stats = dashboardStats(state);
  const recent = recentVouchers(state);
  const book = pettyCashBook(state);
  const closing = book[book.length - 1]?.balance ?? stats.cash;
  const partyName = (id: string | null) =>
    state.parties.find((p) => p.id === id)?.name ?? "—";

  const cards = [
    { label: "Petty Cash", value: closing },
    { label: "Bank (ABL #24)", value: stats.bank },
    { label: "Payables", value: stats.payables },
    { label: "Receivables", value: stats.receivables },
    { label: "Parties loaded", value: state.parties.length },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        title={<Tx k="appName" />}
        subtitle={
          <span>
            <Tx k="shop" /> · petty cash double-entry demo
          </span>
        }
        actions={
          <>
            <Link
              href="/vouchers/cash?kind=payment"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] sm:min-h-10 sm:flex-none"
            >
              Cash payment
            </Link>
            <Link
              href="/vouchers/cash?kind=receipt"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold sm:min-h-10 sm:flex-none"
            >
              Cash receipt
            </Link>
            <Link
              href="/reports/petty-cash"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold sm:min-h-10 sm:w-auto"
            >
              Petty cash book
            </Link>
          </>
        }
      />

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm leading-relaxed">
        <strong>How to post (demo):</strong> Open{" "}
        <Link className="text-[var(--accent)] underline" href="/vouchers/cash?kind=payment">
          Cash payment
        </Link>
        → select <em>Party</em> (vendors from your book are already created) → choose{" "}
        <em>Project</em> + <em>Head of A/C</em> → enter amount. The preview shows Debit head /
        Credit petty cash. Remaining supplier balance stays on Payables / Trial Balance.
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card-panel">
            <div className="text-xs text-[var(--muted)]">{c.label}</div>
            <div className="mt-1 font-display text-lg font-semibold tabular-nums text-[var(--accent)]">
              {typeof c.value === "number" && c.label !== "Parties loaded"
                ? formatPKR(c.value)
                : c.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card-panel">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">
            <Tx k="recentVouchers" />
          </h2>
          <Link href="/vouchers" className="text-sm text-[var(--accent)] hover:underline">
            <Tx k="viewAll" />
          </Link>
        </div>
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--muted)]">
              <tr>
                <th className="py-1 pe-2">Date</th>
                <th className="py-1 pe-2">Type</th>
                <th className="py-1 pe-2">Party</th>
                <th className="py-1">Narration</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((v) => (
                <tr key={v.id} className="border-t border-[var(--border)]">
                  <td className="py-1.5 pe-2 whitespace-nowrap">{v.date}</td>
                  <td className="py-1.5 pe-2">
                    <Link href={`/vouchers/${v.id}`} className="text-[var(--accent)] hover:underline">
                      {v.type}
                    </Link>
                  </td>
                  <td className="py-1.5 pe-2">{partyName(v.partyId)}</td>
                  <td className="py-1.5 truncate max-w-[280px]">{v.narration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
