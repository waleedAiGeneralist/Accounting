"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStockItem } from "@/app/actions/vouchers";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { Flash } from "@/components/vouchers/Flash";
import { L } from "@/lib/labels";

export function StockForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"RICE" | "KIRYANA" | "BARDANA">("RICE");
  const [unit, setUnit] = useState<"KG" | "MAUND" | "BAG" | "PCS">("KG");

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await createStockItem({ name, category, unit });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setName("");
          router.refresh();
        });
      }}
    >
      <Flash error={error} />
      <FormField label="Name (نام)">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label="Category">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as "RICE" | "KIRYANA" | "BARDANA")}
        >
          <option value="RICE">Rice</option>
          <option value="KIRYANA">Kiryana</option>
          <option value="BARDANA">Bardana</option>
        </Select>
      </FormField>
      <FormField label={L.unit}>
        <Select
          value={unit}
          onChange={(e) => setUnit(e.target.value as "KG" | "MAUND" | "BAG" | "PCS")}
        >
          <option value="KG">KG</option>
          <option value="MAUND">Maund</option>
          <option value="BAG">Bag</option>
          <option value="PCS">Pcs</option>
        </Select>
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "…" : L.save}
      </Button>
    </form>
  );
}
