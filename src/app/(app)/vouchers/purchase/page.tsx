"use client";

import { PageHeader } from "@/components/PageHeader";
import { SalePurchaseForm } from "@/components/vouchers/SalePurchaseForm";
import { Tx } from "@/components/i18n/Tx";

export default function PurchasePage() {
  return (
    <div>
      <PageHeader title={<Tx k="purchase" />} subtitle="Supplier purchase entry" />
      <div className="card-panel">
        <SalePurchaseForm kind="purchase" />
      </div>
    </div>
  );
}
