import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";
import type { LabelKey } from "@/lib/labels";

const REPORTS: { href: string; key: LabelKey; desc: string }[] = [
  { href: "/reports/ledger", key: "ledger", desc: "Any account or party" },
  { href: "/reports/trial-balance", key: "trialBalance", desc: "Debits = Credits check" },
  { href: "/reports/profit-loss", key: "profitLoss", desc: "Income − Expenses + COGS" },
  { href: "/reports/balance-sheet", key: "balanceSheet", desc: "Assets = Liabilities + Equity" },
  { href: "/reports/receivables", key: "receivables", desc: "Customer aging" },
  { href: "/reports/payables", key: "payables", desc: "Supplier aging" },
  { href: "/reports/stock", key: "stockReport", desc: "Qty + value per item" },
  { href: "/reports/cash-book", key: "cashBook", desc: "Daily cash movements" },
];

export default function ReportsIndexPage() {
  return (
    <div>
      <PageHeader title={<Tx k="reports" />} subtitle="Date-range · print · CSV" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="card-panel min-h-11 transition hover:border-[var(--accent)] hover:shadow-sm active:scale-[0.99]"
          >
            <div className="font-display text-base font-semibold text-[var(--accent)] sm:text-lg">
              <Tx k={r.key} />
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
