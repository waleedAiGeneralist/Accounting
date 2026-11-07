import Link from "next/link";
import { Tx } from "@/components/i18n/Tx";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { PartyForm } from "@/components/parties/PartyForm";


export const dynamic = "force-dynamic";
export default async function PartiesPage() {
  const parties = await prisma.party.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title={<Tx k="parties" />} subtitle="Customers & suppliers" />
      <div className="card-panel mb-6">
        <PartyForm />
      </div>
      <div className="card-panel overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Statement</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => (
              <tr key={p.id} className="border-t border-[var(--border)]">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">{p.phone ?? "—"}</td>
                <td className="px-3 py-2">{p.type}</td>
                <td className="px-3 py-2">
                  <Link
                    className="text-[var(--accent)] hover:underline"
                    href={`/reports/ledger?partyId=${p.id}`}
                  >
                    Ledger
                  </Link>
                  {" · "}
                  <Link
                    className="text-[var(--accent)] hover:underline"
                    href={`/parties/${p.id}/statement`}
                  >
                    WhatsApp
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
