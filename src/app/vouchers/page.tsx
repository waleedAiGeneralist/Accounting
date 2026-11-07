import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { L, VOUCHER_TYPE_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/dates";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
const QUICK = [
  { href: "/vouchers/cash?kind=receipt", label: L.cashReceipt },
  { href: "/vouchers/cash?kind=payment", label: L.cashPayment },
  { href: "/vouchers/sale", label: L.sale },
  { href: "/vouchers/purchase", label: L.purchase },
  { href: "/vouchers/expense", label: L.expense },
  { href: "/vouchers/journal", label: L.journal },
];

export default async function VouchersPage() {
  const vouchers = await prisma.voucher.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: {
      party: true,
      lines: true,
      reversedBy: true,
    },
  });

  return (
    <div>
      <PageHeader title={L.vouchers} subtitle="Keyboard-friendly entry screens" />
      <div className="no-print mb-6 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            {q.label}
          </Link>
        ))}
      </div>

      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">{L.date}</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">{L.party}</th>
              <th className="px-3 py-2">{L.narration}</th>
              <th className="px-3 py-2 text-right">{L.amount}</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => {
              const amount = v.lines.reduce((s, l) => s + l.debit, 0);
              return (
                <tr key={v.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]/50">
                  <td className="px-3 py-2">
                    <Link href={`/vouchers/${v.id}`} className="text-[var(--accent)] hover:underline">
                      {formatDate(v.date)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{VOUCHER_TYPE_LABEL[v.type] ?? v.type}</td>
                  <td className="px-3 py-2">{v.party?.name ?? "—"}</td>
                  <td className="max-w-xs truncate px-3 py-2">{v.narration}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPKR(amount)}</td>
                  <td className="px-3 py-2 text-xs">
                    {v.isReversal ? (
                      <span className="text-amber-700 dark:text-amber-300">Reversal</span>
                    ) : v.reversedBy ? (
                      <span className="text-red-700 dark:text-red-300">Reversed</span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-300">Active</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-[var(--muted)]">
                  No vouchers yet. Create a cash receipt or sale.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
