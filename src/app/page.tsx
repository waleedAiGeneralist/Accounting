import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { dashboardStats } from "@/lib/reports";
import { L } from "@/lib/labels";
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
    { label: "Today's Sales (آج کی فروخت)", value: stats.todaySales },
    { label: L.cash, value: stats.cash },
    { label: L.bank, value: stats.bank },
    { label: L.receivables, value: stats.receivables },
    { label: L.payables, value: stats.payables },
  ];

  return (
    <div>
      <PageHeader
        title={L.appName}
        subtitle="Rice & Kiryana shop ledger — چاول و کریانہ"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/vouchers/sale"
              className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
            >
              {L.sale}
            </Link>
            <Link
              href="/vouchers/purchase"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
            >
              {L.purchase}
            </Link>
            <Link
              href="/vouchers/cash?kind=receipt"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
            >
              {L.cashReceipt}
            </Link>
          </div>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="card-panel animate-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="text-xs text-[var(--muted)]">{c.label}</div>
            <div className="mt-2 font-display text-2xl font-bold tabular-nums text-[var(--accent)]">
              {formatPKR(c.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="card-panel overflow-x-auto p-0">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
          <h2 className="font-display font-semibold">Recent vouchers (حالیہ)</h2>
          <Link href="/vouchers" className="text-sm text-[var(--accent)] hover:underline">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {recent.map((v) => (
              <tr key={v.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">
                  <Link href={`/vouchers/${v.id}`} className="text-[var(--accent)] hover:underline">
                    {formatDate(v.date)}
                  </Link>
                </td>
                <td className="px-3 py-2">{v.type}</td>
                <td className="px-3 py-2">{v.party?.name ?? "—"}</td>
                <td className="max-w-xs truncate px-3 py-2 text-[var(--muted)]">{v.narration}</td>
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
      </div>
    </div>
  );
}
