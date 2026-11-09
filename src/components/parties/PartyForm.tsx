"use client";

import { useState } from "react";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { Flash } from "@/components/vouchers/Flash";
import { useDemo } from "@/lib/demo/store";
import type { PartyType } from "@/lib/demo/types";

export function PartyForm() {
  const { addParty } = useDemo();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<PartyType>("CUSTOMER");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        addParty({ name, phone, type });
        setName("");
        setPhone("");
        setMsg("Party added");
      }}
    >
      <FormField label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label="Phone">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </FormField>
      <FormField label="Type">
        <Select value={type} onChange={(e) => setType(e.target.value as PartyType)}>
          <option value="CUSTOMER">Customer</option>
          <option value="SUPPLIER">Supplier</option>
          <option value="BOTH">Both</option>
        </Select>
      </FormField>
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Add party
        </Button>
      </div>
      <div className="sm:col-span-4">
        <Flash success={msg} />
      </div>
    </form>
  );
}
