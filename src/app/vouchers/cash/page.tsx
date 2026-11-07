import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { CashForm } from "@/components/vouchers/CashForm";
import { L } from "@/lib/labels";
import { CODES } from "@/lib/accounts";


export const dynamic = "force-dynamic";
export default async function CashVoucherPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const sp = await searchParams;
  const kind = sp.kind === "payment" ? "payment" : "receipt";

  const [parties, accounts] = await Promise.all([
    prisma.party.findMany({ orderBy: { name: "asc" } }),
    prisma.account.findMany({
      where: {
        isActive: true,
        isSystem: false,
        code: { notIn: [CODES.CASH, CODES.BANK] },
      },
      orderBy: { code: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={kind === "receipt" ? L.cashReceipt : L.cashPayment}
        subtitle="Auto-posts Dr/Cr against Cash or Bank"
      />
      <div className="card-panel">
        <CashForm kind={kind} parties={parties} accounts={accounts} />
      </div>
    </div>
  );
}
