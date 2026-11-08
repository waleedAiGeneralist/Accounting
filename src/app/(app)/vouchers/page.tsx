import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";
import { VOUCHER_TYPE_KEYS } from "@/lib/labels";
import type { LabelKey } from "@/lib/labels";
import { formatDate } from "@/lib/dates";
import { formatPKR } from "@/lib/money";

export const dynamic = "force-dynamic";

const QUICK: { href: string; key: LabelKey }[] = [
  { href: "/vouchers/cash?kind=receipt", key: "cashReceipt" },
  { href: "/vouchers/cash?kind=payment", key: "cashPayment" },
  { href: "/vouchers/sale", key: "sale" },
  { href: "/vouchers/purchase", key: "purchase" },
  { href: "/vouchers/expense", key: "expense" },
  { href: "/vouchers/journal", key: "journal" },
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
      <PageHeader title={<Tx k="vouchers" />} subtitle="Keyboard-friendly entry screens" />
      <div className="no-print mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:flex sm:flex-wrap">
        {QUICK.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent)] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[var(--accent-hover)] sm:min-h-10"
          >
            <Tx k={q.key} />
          </Link>
        ))}
      </div>

      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">
                <Tx k="date" />
              </th>
              <th className="px-3 py-2">
                <Tx k="type" />
              </th>
              <th className="px-3 py-2">
                <Tx k="party" />
              </th>
              <th className="px-3 py-2">
                <Tx k="narration" />
              </th>
              <th className="px-3 py-2 text-right">
                <Tx k="amount" />
              </th>
              <th className="px-3 py-2">
                <Tx k="status" />
              </th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => {
              const amount = v.lines.reduce((s, l) => s + l.debit, 0);
              const typeKey = VOUCHER_TYPE_KEYS[v.type];
              return (
                <tr key={v.id} className="border-t border-[var(--border)] hover:bg-[var(--surface-2)]/50">
                  <td className="px-3 py-2">
                    <Link href={`/vouchers/${v.id}`} className="text-[var(--accent)] hover:underline">
                      {formatDate(v.date)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {typeKey ? <Tx k={typeKey} /> : v.type}
                  </td>
                  <td className="px-3 py-2">{v.party?.name ?? "—"}</td>
                  <td className="max-w-xs truncate px-3 py-2">{v.narration}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPKR(amount)}</td>
                  <td className="px-3 py-2 text-xs">
                    {v.isReversal ? (
                      <span className="text-amber-700 dark:text-amber-300">
                        <Tx k="reversal" />
                      </span>
                    ) : v.reversedBy ? (
                      <span className="text-red-700 dark:text-red-300">
                        <Tx k="reversed" />
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-300">
                        <Tx k="active" />
                      </span>
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
