import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { SalePurchaseForm } from "@/components/vouchers/SalePurchaseForm";
import { L } from "@/lib/labels";


export const dynamic = "force-dynamic";
export default async function SalePage() {
  const [parties, items] = await Promise.all([
    prisma.party.findMany({ orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title={L.sale} subtitle="Dr Cash/Receivables · Cr Sale · stock out" />
      <div className="card-panel">
        <SalePurchaseForm kind="sale" parties={parties} items={items} />
      </div>
    </div>
  );
}
