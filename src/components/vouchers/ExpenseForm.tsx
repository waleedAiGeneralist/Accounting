"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { todayISO } from "@/lib/dates";
import { useDemo } from "@/lib/demo/store";
import { accountByCode } from "@/lib/demo/compute";

export function ExpenseForm() {
  const router = useRouter();
  const { t, lang } = usePrefs();
  const { state, addVoucher } = useDemo();
  const expenseAccounts = state.accounts.filter((a) => a.type === "EXPENSE" && a.isActive);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [expenseAccountId, setExpenseAccountId] = useState(expenseAccounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [partyId, setPartyId] = useState("");
  const [narration, setNarration] = useState("");

  function accountLabel(a: (typeof expenseAccounts)[0]) {
    if (lang === "ur") return `${a.code} — ${a.nameUrdu}`;
    if (lang === "both") return `${a.code} — ${a.name} (${a.nameUrdu})`;
    return `${a.code} — ${a.name}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (amt <= 0 || !expenseAccountId) {
      setError("Amount and expense account required");
      return;
    }
    const cashOrBank = accountByCode(state.accounts, mode === "cash" ? "1001" : "1002");
    if (!cashOrBank) {
      setError("Cash/Bank account missing");
      return;
    }
    const res = addVoucher({
      date,
      type: "EXPENSE",
      narration: narration || "Expense",
      partyId: partyId || null,
      lines: [
        { accountId: expenseAccountId, debit: amt },
        { accountId: cashOrBank.id, credit: amt },
      ],
    });
    if (!res.ok) return setError(res.error);
    router.push(`/vouchers/${res.id}`);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Flash error={error} />
      <FormField label="Date">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </FormField>
      <FormField label="Expense account">
        <Select value={expenseAccountId} onChange={(e) => setExpenseAccountId(e.target.value)} required>
          {expenseAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {accountLabel(a)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Pay from">
        <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
        </Select>
      </FormField>
      <FormField label="Party (optional)">
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">—</option>
          {state.parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={<Tx k="amount" />}>
        <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </FormField>
      <FormField label={<Tx k="narration" />}>
        <Textarea value={narration} onChange={(e) => setNarration(e.target.value)} />
      </FormField>
      <Button type="submit">{t("save")}</Button>
    </form>
  );
}
