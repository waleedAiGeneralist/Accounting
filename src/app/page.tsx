import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";
import { TableScroll } from "@/components/ui/TableScroll";
import { dashboardStats } from "@/lib/reports";
import { formatPKR } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    dashboardStats(),
    prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { party: true, lines: true },
    }),
  ]);

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
        subtitle={<Tx k="shop" />}
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
            <Tx k="recentVouchers" />
          </h2>
          <Link href="/vouchers" className="shrink-0 text-sm text-[var(--accent)] hover:underline">
            <Tx k="viewAll" />
          </Link>
        </div>

        {/* Mobile cards */}
        <div className="mobile-stack p-3">
          {recent.map((v) => (
            <Link
              key={v.id}
              href={`/vouchers/${v.id}`}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--accent)]">{formatDate(v.date)}</div>
                  <div className="mt-0.5 text-xs text-[var(--muted)]">{v.type}</div>
                  <div className="mt-1 truncate text-sm">{v.party?.name ?? "—"}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">{v.narration}</div>
                </div>
                <div className="shrink-0 font-semibold tabular-nums">
                  {formatPKR(v.lines.reduce((s, l) => s + l.debit, 0))}
                </div>
              </div>
            </Link>
          ))}
          {recent.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-[var(--muted)]">
              No activity yet — post opening capital via Journal, then try a Sale.
            </p>
          ) : null}
        </div>

        {/* Desktop table */}
        <div className="desktop-only-table">
          <TableScroll>
            <table className="w-full text-sm">
              <tbody>
                {recent.map((v) => (
                  <tr key={v.id} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2">
                      <Link
                        href={`/vouchers/${v.id}`}
                        className="text-[var(--accent)] hover:underline"
                      >
                        {formatDate(v.date)}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{v.type}</td>
                    <td className="px-3 py-2">{v.party?.name ?? "—"}</td>
                    <td className="wrap max-w-xs truncate px-3 py-2 text-[var(--muted)]">
                      {v.narration}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatPKR(v.lines.reduce((s, l) => s + l.debit, 0))}
                    </td>
                  </tr>
                ))}
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted)]">
                      No activity yet — post opening capital via Journal, then try a Sale.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </TableScroll>
        </div>
      </div>
    </div>
  );
}
