"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CashForm } from "@/components/vouchers/CashForm";
import { Tx } from "@/components/i18n/Tx";

function CashInner() {
  const sp = useSearchParams();
  const kind = sp.get("kind") === "payment" ? "payment" : "receipt";
  return (
    <div>
      <PageHeader
        title={kind === "receipt" ? <Tx k="cashReceipt" /> : <Tx k="cashPayment" />}
        subtitle="Posts against Cash or Bank"
      />
      <div className="card-panel">
        <CashForm kind={kind} />
      </div>
    </div>
  );
}

export default function CashVoucherPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[var(--muted)]">Loading…</div>}>
      <CashInner />
    </Suspense>
  );
}
