import { notFound } from "next/navigation";
import { Tx } from "@/components/i18n/Tx";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { partyLedger } from "@/lib/reports";
import { formatDate } from "@/lib/dates";
import { formatPKR } from "@/lib/money";
import { t } from "@/lib/labels";
import { WhatsAppShare } from "@/components/parties/WhatsAppShare";

export const dynamic = "force-dynamic";

export default async function PartyStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const party = await prisma.party.findUnique({ where: { id } });
  if (!party) notFound();

  const { rows, opening } = await partyLedger(id);
  const closing = rows.length ? rows[rows.length - 1].balance : opening;

  const text = [
    `*${t("appName", "en")}*`,
    `Statement for ${party.name}`,
    `Opening: ${formatPKR(opening)}`,
    ...rows.slice(-15).map(
      (r) =>
        `${formatDate(r.date)} | Dr ${r.debit || 0} Cr ${r.credit || 0} | Bal ${formatPKR(r.balance)}`
    ),
    `*Closing balance: ${formatPKR(closing)}*`,
  ].join("\n");

  const waPhone = party.phone?.replace(/\D/g, "") ?? "";
  const waUrl = waPhone
    ? `https://wa.me/92${waPhone.replace(/^0/, "")}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <div>
      <PageHeader
        title={`${party.name} — Statement`}
        subtitle={<Tx k="whatsapp" />}
        actions={<WhatsAppShare url={waUrl} />}
      />
      <div className="card-panel mb-4 flex justify-between text-sm">
        <span>Opening: {formatPKR(opening)}</span>
        <span className="font-semibold">Closing: {formatPKR(closing)}</span>
      </div>
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2"><Tx k="date" /></th>
              <th className="px-3 py-2"><Tx k="narration" /></th>
              <th className="px-3 py-2 text-right"><Tx k="debit" /></th>
              <th className="px-3 py-2 text-right"><Tx k="credit" /></th>
              <th className="px-3 py-2 text-right">Bal</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.voucherId}-${r.balance}`} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">{formatDate(r.date)}</td>
                <td className="px-3 py-2">{r.narration}</td>
                <td className="px-3 py-2 text-right">{r.debit ? formatPKR(r.debit) : ""}</td>
                <td className="px-3 py-2 text-right">{r.credit ? formatPKR(r.credit) : ""}</td>
                <td className="px-3 py-2 text-right">{formatPKR(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
