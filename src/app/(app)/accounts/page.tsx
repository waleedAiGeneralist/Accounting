import { prisma } from "@/lib/prisma";
import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";


export const dynamic = "force-dynamic";
export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({ orderBy: { code: "asc" } });
  const groups = ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] as const;

  return (
    <div>
      <PageHeader title={<Tx k="accounts" />} subtitle="Chart of accounts (چارٹ آف اکاؤنٹس)" />
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g} className="card-panel table-scroll p-0">
            <div className="bg-[var(--surface-2)] px-3 py-2 font-display font-semibold text-[var(--accent)]">
              {g}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {accounts
                  .filter((a) => a.type === g)
                  .map((a) => (
                    <tr key={a.id} className="border-t border-[var(--border)]">
                      <td className="w-20 px-3 py-2 font-mono text-xs">{a.code}</td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/reports/ledger?accountId=${a.id}`}
                          className="hover:text-[var(--accent)] hover:underline"
                        >
                          {a.name}
                        </Link>
                        {a.isSystem ? (
                          <span className="ml-2 text-xs text-amber-700">(system)</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-right urdu text-[var(--muted)]">
                        {a.nameUrdu}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
