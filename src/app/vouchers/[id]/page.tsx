import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { VoucherActions } from "@/components/vouchers/VoucherActions";
import { L, VOUCHER_TYPE_LABEL } from "@/lib/labels";
import { formatDate } from "@/lib/dates";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function VoucherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const voucher = await prisma.voucher.findUnique({
    where: { id },
    include: {
      party: true,
      lines: { include: { account: true }, orderBy: { debit: "desc" } },
      stockMoves: { include: { item: true } },
      reversedBy: true,
      reverses: true,
    },
  });
  if (!voucher) notFound();

  const totalDebit = voucher.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = voucher.lines.reduce((s, l) => s + l.credit, 0);
  const canReverse = !voucher.isReversal && !voucher.reversedBy;

  return (
    <div>
      <PageHeader
        title={VOUCHER_TYPE_LABEL[voucher.type] ?? voucher.type}
        subtitle={formatDate(voucher.date)}
        actions={
          <Link
            href="/vouchers"
            className="no-print rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          >
            ← Back
          </Link>
        }
      />

      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <div className="card-panel">
          <div className="text-xs text-[var(--muted)]">{L.party}</div>
          <div className="font-semibold">{voucher.party?.name ?? "—"}</div>
        </div>
        <div className="card-panel md:col-span-2">
          <div className="text-xs text-[var(--muted)]">{L.narration}</div>
          <div>{voucher.narration}</div>
          {voucher.isReversal && voucher.reverses ? (
            <p className="mt-2 text-xs text-amber-700">
              Reverses{" "}
              <Link className="underline" href={`/vouchers/${voucher.reverses.id}`}>
                {voucher.reverses.id.slice(0, 8)}…
              </Link>
            </p>
          ) : null}
          {voucher.reversedBy ? (
            <p className="mt-2 text-xs text-red-700">
              Reversed by{" "}
              <Link className="underline" href={`/vouchers/${voucher.reversedBy.id}`}>
                {voucher.reversedBy.id.slice(0, 8)}…
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div className="card-panel mb-4 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">{L.account}</th>
              <th className="px-3 py-2 text-right">{L.debit}</th>
              <th className="px-3 py-2 text-right">{L.credit}</th>
            </tr>
          </thead>
          <tbody>
            {voucher.lines.map((l) => (
              <tr key={l.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">
                  {l.account.code} — {l.account.name}{" "}
                  <span className="urdu text-[var(--muted)]">({l.account.nameUrdu})</span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {l.debit ? formatPKR(l.debit) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {l.credit ? formatPKR(l.credit) : ""}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--border)] bg-[var(--surface-2)] font-semibold">
              <td className="px-3 py-2">{L.total}</td>
              <td className="px-3 py-2 text-right">{formatPKR(totalDebit)}</td>
              <td className="px-3 py-2 text-right">{formatPKR(totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {voucher.stockMoves.length > 0 ? (
        <div className="card-panel mb-4 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">{L.item}</th>
                <th className="px-3 py-2 text-right">In</th>
                <th className="px-3 py-2 text-right">Out</th>
                <th className="px-3 py-2 text-right">{L.rate}</th>
              </tr>
            </thead>
            <tbody>
              {voucher.stockMoves.map((m) => (
                <tr key={m.id} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2">
                    {m.item.name} ({m.item.unit})
                  </td>
                  <td className="px-3 py-2 text-right">{m.qtyIn || ""}</td>
                  <td className="px-3 py-2 text-right">{m.qtyOut || ""}</td>
                  <td className="px-3 py-2 text-right">{formatPKR(m.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="no-print">
        <VoucherActions id={voucher.id} canReverse={canReverse} />
      </div>
    </div>
  );
}
