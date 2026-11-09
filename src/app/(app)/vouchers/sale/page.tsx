"use client";

import { PageHeader } from "@/components/PageHeader";
import { SalePurchaseForm } from "@/components/vouchers/SalePurchaseForm";
import { Tx } from "@/components/i18n/Tx";

export default function SalePage() {
  return (
    <div>
      <PageHeader title={<Tx k="sale" />} subtitle="Customer sale entry" />
      <div className="card-panel">
        <SalePurchaseForm kind="sale" />
      </div>
    </div>
  );
}
