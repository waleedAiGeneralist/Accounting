"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createParty } from "@/app/actions/vouchers";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { Flash } from "@/components/vouchers/Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";

export function PartyForm() {
  const router = useRouter();
  const { t } = usePrefs();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<"CUSTOMER" | "SUPPLIER" | "BOTH">("CUSTOMER");

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await createParty({ name, phone, type });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setName("");
          setPhone("");
          router.refresh();
        });
      }}
    >
      <div className="w-full sm:w-auto">
        <Flash error={error} />
      </div>
      <FormField label={<Tx k="name" />}>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label={<Tx k="phone" />}>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>
      <FormField label={<Tx k="type" />}>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as "CUSTOMER" | "SUPPLIER" | "BOTH")}
        >
          <option value="CUSTOMER">{t("customer")}</option>
          <option value="SUPPLIER">{t("supplier")}</option>
          <option value="BOTH">{t("both")}</option>
        </Select>
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "…" : t("save")}
      </Button>
    </form>
  );
}
