"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";
import { formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { dashboardStats, recentVouchers } from "@/lib/demo/compute";

export default function DashboardPage() {
  const { state, ready } = useDemo();
  if (!ready) {
    return <div className="p-6 text-sm text-[var(--muted)]">Loading demo…</div>;
  }
  const stats = dashboardStats(state);
  const recent = recentVouchers(state);
  const partyName = (id: string | null) =>
    state.parties.find((p) => p.id === id)?.name ?? "—";

  const cards = [
    { key: "todaySales" as const, value: stats.todaySales },
    { key: "cash" as const, value: stats.cash },
    { key: "bank" as const, value: stats.bank },
    { key: "receivables" as const, value: stats.receivables },
    { key: "payables" as const, value: stats.payables },
  ];

  return (
    <div className="min-w-0">
      <PageHeader
        title={<Tx k="appName" />}
        subtitle={
          <span>
            <Tx k="shop" /> · client demo (browser data)
          </span>
        }
        actions={
          <>
            <Link
              href="/vouchers/sale"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] sm:min-h-10 sm:flex-none"
            >
              <Tx k="sale" />
            </Link>
            <Link
              href="/vouchers/purchase"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold sm:min-h-10 sm:flex-none"
            >
              <Tx k="purchase" />
            </Link>
            <Link
              href="/vouchers/cash?kind=receipt"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold sm:min-h-10 sm:w-auto"
            >
              <Tx k="cashReceipt" />
            </Link>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-2 sm:mb-8 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <div
            key={c.key}
            className={`card-panel animate-in p-3 sm:p-4 ${
              i === 0 ? "col-span-2 md:col-span-1" : ""
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="text-[11px] text-[var(--muted)] sm:text-xs">
              <Tx k={c.key} />
            </div>
            <div className="mt-1.5 font-display text-lg font-bold tabular-nums text-[var(--accent)] sm:mt-2 sm:text-2xl">
              {formatPKR(c.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="card-panel p-0">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2">
          <h2 className="font-display text-sm font-semibold sm:text-base">
            Recent vouchers
          </h2>
          <Link href="/vouchers" className="text-xs text-[var(--accent)] hover:underline">
            View all
          </Link>
        </div>
        <div className="table-scroll">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Party</th>
                <th className="px-3 py-2">Narration</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((v) => (
                <tr key={v.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2">{v.date}</td>
                  <td className="px-3 py-2">
                    <Link className="text-[var(--accent)] hover:underline" href={`/vouchers/${v.id}`}>
                      {v.type}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{partyName(v.partyId)}</td>
                  <td className="px-3 py-2">{v.narration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
