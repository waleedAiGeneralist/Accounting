"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseVoucher } from "@/app/actions/vouchers";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
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
  const { t, lang } = usePrefs();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [expenseAccountId, setExpenseAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [partyId, setPartyId] = useState("");
  const [narration, setNarration] = useState("");

  function accountLabel(a: Account) {
    if (lang === "ur") return `${a.code} — ${a.nameUrdu}`;
    if (lang === "both") return `${a.code} — ${a.name} (${a.nameUrdu})`;
    return `${a.code} — ${a.name}`;
  }

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
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Flash error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={<Tx k="date" />}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required autoFocus />
        </FormField>
        <FormField label={<Tx k="cash" />}>
          <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
            <option value="cash">{t("cash")}</option>
            <option value="bank">{t("bank")}</option>
          </Select>
        </FormField>
      </div>
      <FormField label={<Tx k="account" />}>
        <Select
          value={expenseAccountId}
          onChange={(e) => setExpenseAccountId(e.target.value)}
          required
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {accountLabel(a)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={<Tx k="amount" />}>
        <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </FormField>
      <FormField label={<Tx k="party" />}>
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">—</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={<Tx k="narration" />}>
        <Textarea rows={2} value={narration} onChange={(e) => setNarration(e.target.value)} required />
      </FormField>
      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "…" : t("save")}
        </Button>
        <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
