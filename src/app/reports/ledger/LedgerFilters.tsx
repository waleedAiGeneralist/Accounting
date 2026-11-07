"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FormField, Select } from "@/components/ui/FormField";
import { L } from "@/lib/labels";

type Account = { id: string; code: string; name: string };
type Party = { id: string; name: string };

export function LedgerFilters({
  accounts,
  parties,
}: {
  accounts: Account[];
  parties: Party[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function setParam(key: string, value: string, clear?: string[]) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    clear?.forEach((c) => params.delete(c));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <FormField label={L.account}>
        <Select
          value={sp.get("accountId") ?? ""}
          onChange={(e) => setParam("accountId", e.target.value, ["partyId"])}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={L.party}>
        <Select
          value={sp.get("partyId") ?? ""}
          onChange={(e) => setParam("partyId", e.target.value, e.target.value ? ["accountId"] : [])}
        >
          <option value="">— Account mode —</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
    </>
  );
}
