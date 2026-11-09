"use client";

import { PageHeader } from "@/components/PageHeader";
import { JournalForm } from "@/components/vouchers/JournalForm";
import { Tx } from "@/components/i18n/Tx";

export default function JournalPage() {
  return (
    <div>
      <PageHeader title={<Tx k="journal" />} subtitle="Manual double-entry" />
      <div className="card-panel">
        <JournalForm />
      </div>
    </div>
  );
}
