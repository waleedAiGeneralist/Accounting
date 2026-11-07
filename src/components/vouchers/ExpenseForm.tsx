"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseVoucher } from "@/app/actions/vouchers";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { L } from "@/lib/labels";
import { todayISO } from "@/lib/dates";

type Account = { id: string; code: string; name: string; nameUrdu: string };
type Party = { id: string; name: string };

export function ExpenseForm({
  accounts,
  parties,
}: {
  accounts: Account[];
  parties: Party[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [expenseAccountId, setExpenseAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [partyId, setPartyId] = useState("");
  const [narration, setNarration] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createExpenseVoucher({
        date,
        expenseAccountId,
        amount: Number(amount),
        mode,
        partyId: partyId || undefined,
        narration,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/vouchers/${res.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-4">
      <Flash error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={L.date}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required autoFocus />
        </FormField>
        <FormField label="Cash / Bank">
          <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
            <option value="cash">{L.cash}</option>
            <option value="bank">{L.bank}</option>
          </Select>
        </FormField>
      </div>
      <FormField label={L.account}>
        <Select
          value={expenseAccountId}
          onChange={(e) => setExpenseAccountId(e.target.value)}
          required
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name} ({a.nameUrdu})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={L.amount}>
        <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </FormField>
      <FormField label={L.party}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">—</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={L.narration}>
        <Textarea rows={2} value={narration} onChange={(e) => setNarration(e.target.value)} required />
      </FormField>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "…" : L.save}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {L.cancel}
        </Button>
      </div>
    </form>
  );
}
