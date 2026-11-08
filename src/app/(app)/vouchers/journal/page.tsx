import { prisma } from "@/lib/prisma";
import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import { JournalForm } from "@/components/vouchers/JournalForm";


export const dynamic = "force-dynamic";
export default async function JournalPage() {
  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });

  return (
    <div>
      <PageHeader title={<Tx k="journal" />} subtitle="Manual double-entry (debit must equal credit)" />
      <div className="card-panel">
        <JournalForm accounts={accounts} />
      </div>
    </div>
  );
}
