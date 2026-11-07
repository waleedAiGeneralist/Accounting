import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { L } from "@/lib/labels";

const REPORTS = [
  { href: "/reports/ledger", label: L.ledger, desc: "Any account or party" },
  { href: "/reports/trial-balance", label: L.trialBalance, desc: "Debits = Credits check" },
  { href: "/reports/profit-loss", label: L.profitLoss, desc: "Income − Expenses + COGS" },
  { href: "/reports/balance-sheet", label: L.balanceSheet, desc: "Assets = Liabilities + Equity" },
  { href: "/reports/receivables", label: L.receivables, desc: "Customer aging" },
  { href: "/reports/payables", label: L.payables, desc: "Supplier aging" },
  { href: "/reports/stock", label: L.stockReport, desc: "Qty + value per item" },
  { href: "/reports/cash-book", label: L.cashBook, desc: "Daily cash movements" },
];

export default function ReportsIndexPage() {
  return (
    <div>
      <PageHeader title={L.reports} subtitle="Date-range · print · CSV" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="card-panel transition hover:border-[var(--accent)] hover:shadow-sm"
          >
            <div className="font-display text-lg font-semibold text-[var(--accent)]">
              {r.label}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
