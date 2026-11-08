import Link from "next/link";
import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import { ExportCsvButton } from "@/components/reports/ExportCsvButton";
import { PrintButton } from "@/components/reports/PrintButton";
import { payablesAging } from "@/lib/reports";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function PayablesPage() {
  const rows = await payablesAging();
  const csv = [
    ["Party", "Phone", "0-30", "31-60", "61-90", "91-120", "120+", "Total"],
    ...rows.map((r) => [
      r.partyName,
      r.phone ?? "",
      String(r.current),
      String(r.d30),
      String(r.d60),
      String(r.d90),
      String(r.older),
      String(r.total),
    ]),
  ];

  return (
    <div>
      <PageHeader title={<Tx k="payables" />} subtitle="Supplier aging (عمر)" />
      <div className="mb-3 no-print flex gap-2">
        <ExportCsvButton filename="payables.csv" rows={csv} />
        <PrintButton />
      </div>
      <div className="card-panel table-scroll p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2"><Tx k="party" /></th>
              <th className="px-3 py-2 text-right">0–30</th>
              <th className="px-3 py-2 text-right">31–60</th>
              <th className="px-3 py-2 text-right">61–90</th>
              <th className="px-3 py-2 text-right">91–120</th>
              <th className="px-3 py-2 text-right">120+</th>
              <th className="px-3 py-2 text-right"><Tx k="total" /></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.partyId} className="border-t border-[var(--border)]">
                <td className="px-3 py-2">
                  <Link
                    href={`/reports/ledger?partyId=${r.partyId}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {r.partyName}
                  </Link>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.current)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.d30)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.d60)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.d90)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatPKR(r.older)}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  {formatPKR(r.total)}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-[var(--muted)]">
                  No payables
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
