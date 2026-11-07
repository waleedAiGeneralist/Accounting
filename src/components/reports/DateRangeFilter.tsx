"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormField, Input, Button } from "@/components/ui/FormField";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";

export function DateRangeFilter({
  extra,
}: {
  extra?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { t } = usePrefs();
  const [from, setFrom] = useState(sp.get("from") ?? "");
  const [to, setTo] = useState(sp.get("to") ?? "");

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp.toString());
    if (from) params.set("from", from);
    else params.delete("from");
    if (to) params.set("to", to);
    else params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={apply} className="no-print mb-4 flex flex-wrap items-end gap-3">
      <FormField label={<Tx k="from" />}>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </FormField>
      <FormField label={<Tx k="to" />}>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </FormField>
      {extra}
      <Button type="submit" variant="secondary">
        {t("apply")}
      </Button>
      <Button type="button" variant="ghost" onClick={() => window.print()}>
        <Tx k="print" />
      </Button>
    </form>
  );
}
