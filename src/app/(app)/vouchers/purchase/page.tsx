import { prisma } from "@/lib/prisma";
import { Tx } from "@/components/i18n/Tx";
import { PageHeader } from "@/components/PageHeader";
import { SalePurchaseForm } from "@/components/vouchers/SalePurchaseForm";


export const dynamic = "force-dynamic";
export default async function PurchasePage() {
  const [parties, items] = await Promise.all([
    prisma.party.findMany({ orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title={<Tx k="purchase" />} subtitle="Dr Purchase · Cr Cash/Payables · stock in" />
      <div className="card-panel">
        <SalePurchaseForm kind="purchase" parties={parties} items={items} />
      </div>
    </div>
  );
}
