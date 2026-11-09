"use client";

import { PageHeader } from "@/components/PageHeader";
import { ExpenseForm } from "@/components/vouchers/ExpenseForm";
import { Tx } from "@/components/i18n/Tx";

export default function ExpensePage() {
  return (
    <div>
      <PageHeader title={<Tx k="expense" />} subtitle="Shop expense" />
      <div className="card-panel">
        <ExpenseForm />
      </div>
    </div>
  );
}
