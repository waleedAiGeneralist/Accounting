"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCashVoucher } from "@/app/actions/vouchers";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { L } from "@/lib/labels";
import { todayISO } from "@/lib/dates";

type Party = { id: string; name: string; type: string };
type Account = { id: string; code: string; name: string; nameUrdu: string };

export function CashForm({
  kind,
  parties,
  accounts,
}: {
  kind: "receipt" | "payment";
  parties: Party[];
  accounts: Account[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [partyId, setPartyId] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const filteredParties = useMemo(() => {
    if (kind === "receipt") {
      return parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");
    }
    return parties.filter((p) => p.type === "SUPPLIER" || p.type === "BOTH");
  }, [parties, kind]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    start(async () => {
      const res = await createCashVoucher({
        date,
        kind,
        mode,
        partyId: partyId || undefined,
        accountId,
        amount: Number(amount),
        narration,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(`Saved voucher ${res.id}`);
      setAmount("");
      setNarration("");
      router.push(`/vouchers/${res.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-xl flex-col gap-4">
      <Flash error={error} success={success} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={L.date}>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            autoFocus
          />
        </FormField>
        <FormField label={biMode()}>
          <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
            <option value="cash">{L.cash}</option>
            <option value="bank">{L.bank}</option>
          </Select>
        </FormField>
      </div>
      <FormField label={L.party}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">—</option>
          {filteredParties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={kind === "receipt" ? "From Account (اکاؤنٹ سے)" : "To Account (اکاؤنٹ کو)"}>
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.name} ({a.nameUrdu})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={L.amount}>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </FormField>
      <FormField label={L.narration}>
        <Textarea
          rows={2}
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
        />
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

function biMode() {
  return "Cash / Bank (نقد / بینک)";
}
