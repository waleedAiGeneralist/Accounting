"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createParty } from "@/app/actions/vouchers";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { Flash } from "@/components/vouchers/Flash";
import { L } from "@/lib/labels";

export function PartyForm() {
  const router = useRouter();
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
      <Flash error={error} />
      <FormField label="Name (نام)">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label="Phone (فون)">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>
      <FormField label="Type">
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as "CUSTOMER" | "SUPPLIER" | "BOTH")}
        >
          <option value="CUSTOMER">Customer</option>
          <option value="SUPPLIER">Supplier</option>
          <option value="BOTH">Both</option>
        </Select>
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "…" : L.save}
      </Button>
    </form>
  );
}
