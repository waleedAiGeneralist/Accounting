import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { ExpenseForm } from "@/components/vouchers/ExpenseForm";
import { L } from "@/lib/labels";
import { EXPENSE_CODES } from "@/lib/accounts";


export const dynamic = "force-dynamic";
export default async function ExpensePage() {
  const [accounts, parties] = await Promise.all([
    prisma.account.findMany({
      where: { code: { in: [...EXPENSE_CODES] }, isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.party.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title={L.expense} subtitle="Accounts 5003–5008" />
      <div className="card-panel">
        <ExpenseForm accounts={accounts} parties={parties} />
      </div>
    </div>
  );
}
