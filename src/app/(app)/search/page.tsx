import Link from "next/link";
import { Tx } from "@/components/i18n/Tx";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/dates";
import { formatPKR } from "@/lib/money";


export const dynamic = "force-dynamic";
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const [parties, vouchers, items, accounts] = query
    ? await Promise.all([
        prisma.party.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { phone: { contains: query } },
            ],
          },
          take: 20,
        }),
        prisma.voucher.findMany({
          where: { narration: { contains: query } },
          include: { party: true, lines: true },
          take: 20,
          orderBy: { date: "desc" },
        }),
        prisma.stockItem.findMany({
          where: { name: { contains: query } },
          take: 20,
        }),
        prisma.account.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { nameUrdu: { contains: query } },
              { code: { contains: query } },
            ],
          },
          take: 20,
        }),
      ])
    : [[], [], [], []];

  return (
    <div>
      <PageHeader title={<Tx k="search" />} subtitle={query ? `Results for “${query}”` : "Type in the nav search"} />
      {!query ? (
        <p className="text-[var(--muted)]">Enter a party, voucher narration, item, or account.</p>
      ) : (
        <div className="space-y-6">
          <ResultBlock title={<Tx k="parties" />}>
            {parties.map((p) => (
              <li key={p.id}>
                <Link href={`/parties/${p.id}/statement`} className="text-[var(--accent)] hover:underline">
                  {p.name}
                </Link>{" "}
                <span className="text-[var(--muted)]">{p.phone}</span>
              </li>
            ))}
          </ResultBlock>
          <ResultBlock title={<Tx k="vouchers" />}>
            {vouchers.map((v) => (
              <li key={v.id}>
                <Link href={`/vouchers/${v.id}`} className="text-[var(--accent)] hover:underline">
                  {formatDate(v.date)}
                </Link>{" "}
                {v.narration} — {formatPKR(v.lines.reduce((s, l) => s + l.debit, 0))}
              </li>
            ))}
          </ResultBlock>
          <ResultBlock title={<Tx k="stock" />}>
            {items.map((i) => (
              <li key={i.id}>
                {i.name} [{i.category}]
              </li>
            ))}
          </ResultBlock>
          <ResultBlock title={<Tx k="accounts" />}>
            {accounts.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/reports/ledger?accountId=${a.id}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  {a.code} {a.name}
                </Link>
              </li>
            ))}
          </ResultBlock>
        </div>
      )}
    </div>
  );
}

function ResultBlock({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-panel">
      <h2 className="mb-2 font-display font-semibold text-[var(--accent)]">{title}</h2>
      <ul className="space-y-1 text-sm">{children}</ul>
    </div>
  );
}
