"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Tx } from "@/components/i18n/Tx";

const LINKS = [
  { href: "/reports/trial-balance", label: "Trial Balance" },
  { href: "/reports/stock", label: "Stock" },
  { href: "/reports/cash-book", label: "Cash Book" },
  { href: "/reports/profit-loss", label: "Profit & Loss" },
  { href: "/reports/balance-sheet", label: "Balance Sheet" },
  { href: "/reports/ledger", label: "Ledger" },
  { href: "/reports/receivables", label: "Receivables" },
  { href: "/reports/payables", label: "Payables" },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title={<Tx k="reports" />} subtitle="Demo reports from browser data" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="card-panel font-display text-base font-semibold hover:border-[var(--accent)]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
