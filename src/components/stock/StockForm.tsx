"use client";

import { useState } from "react";
import { FormField, Input, Select, Button } from "@/components/ui/FormField";
import { Flash } from "@/components/vouchers/Flash";
import { useDemo } from "@/lib/demo/store";
import type { StockCategory, StockUnit } from "@/lib/demo/types";

export function StockForm() {
  const { addStock } = useDemo();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StockCategory>("RICE");
  const [unit, setUnit] = useState<StockUnit>("KG");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        addStock({ name, category, unit });
        setName("");
        setMsg("Item added");
      }}
    >
      <FormField label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </FormField>
      <FormField label="Category">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as StockCategory)}
        >
          <option value="RICE">Rice</option>
          <option value="KIRYANA">Kiryana</option>
          <option value="BARDANA">Bardana</option>
        </Select>
      </FormField>
      <FormField label="Unit">
        <Select value={unit} onChange={(e) => setUnit(e.target.value as StockUnit)}>
          <option value="KG">KG</option>
          <option value="MAUND">Maund</option>
          <option value="BAG">Bag</option>
          <option value="PCS">Pcs</option>
        </Select>
      </FormField>
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          Add item
        </Button>
      </div>
      <div className="sm:col-span-4">
        <Flash success={msg} />
      </div>
    </form>
  );
}
