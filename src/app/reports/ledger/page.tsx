import { Suspense } from "react";
import { Tx } from "@/components/i18n/Tx";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { DateRangeFilter } from "@/components/reports/DateRangeFilter";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { accountLedger, partyLedger } from "@/lib/reports";
import { formatDate } from "@/lib/dates";
import { formatPKR } from "@/lib/money";
import { LedgerFilters } from "./LedgerFilters";


export const dynamic = "force-dynamic";
export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; accountId?: string; partyId?: string }>;
}) {
  const sp = await searchParams;
  const [accounts, parties] = await Promise.all([
    prisma.account.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    prisma.party.findMany({ orderBy: { name: "asc" } }),
  ]);

  const accountId = sp.accountId || accounts[0]?.id;
  const partyId = sp.partyId;

  const data = partyId
    ? await partyLedger(partyId, sp.from, sp.to)
    : accountId
      ? await accountLedger(accountId, sp.from, sp.to)
      : { rows: [], opening: 0 };

  const titleEntity = partyId
    ? parties.find((p) => p.id === partyId)?.name
    : accounts.find((a) => a.id === accountId)
      ? `${accounts.find((a) => a.id === accountId)!.code} — ${accounts.find((a) => a.id === accountId)!.name}`
      : "";

  const csv = [
    ["Date", "Type", "Narration", "Party", "Debit", "Credit", "Balance"],
    ...data.rows.map((r) => [
      formatDate(r.date),
      r.voucherType,
      r.narration,
      r.partyName ?? "",
      String(r.debit),
      String(r.credit),
      String(r.balance),
    ]),
  ];

  return (
    <div>
      <PageHeader title={<Tx k="ledger" />} subtitle={titleEntity} />
      <Suspense>
        <DateRangeFilter
          extra={<LedgerFilters accounts={accounts} parties={parties} />}
        />
      </Suspense>
      <div className="mb-3 no-print">
        <ExportCsvButton filename="ledger.csv" rows={csv} />
      </div>
      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2"><Tx k="date" /></th>
              <th className="px-3 py-2"><Tx k="narration" /></th>
              <th className="px-3 py-2 text-right"><Tx k="debit" /></th>
              <th className="px-3 py-2 text-right"><Tx k="credit" /></th>
              <th className="px-3 py-2 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)] text-[var(--muted)]">
              <td className="px-3 py-2" colSpan={4}>
                Opening
              </td>
              <td className="px-3 py-2 text-right">{formatPKR(data.opening)}</td>
            </tr>
            {data.rows.map((r) => (
              <tr key={`${r.voucherId}-${r.debit}-${r.credit}-${r.balance}`} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">
                  <Link href={`/vouchers/${r.voucherId}`} className="text-[var(--accent)] hover:underline">
                    {formatDate(r.date)}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  {r.narration}
                  {r.partyName ? (
                    <span className="text-[var(--muted)]"> · {r.partyName}</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.debit ? formatPKR(r.debit) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.credit ? formatPKR(r.credit) : ""}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
