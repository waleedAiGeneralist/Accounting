"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { todayISO } from "@/lib/dates";
import { useDemo } from "@/lib/demo/store";
import { accountByCode } from "@/lib/demo/compute";

export function CashForm({ kind }: { kind: "receipt" | "payment" }) {
  const router = useRouter();
  const { t, lang } = usePrefs();
  const { state, addVoucher } = useDemo();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [partyId, setPartyId] = useState("");
  const cash = accountByCode(state.accounts, "1001");
  const bank = accountByCode(state.accounts, "1002");
  const accounts = state.accounts.filter(
    (a) => a.isActive && !a.isSystem && a.code !== "1001" && a.code !== "1002"
  );
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const filteredParties = useMemo(() => {
    if (kind === "receipt") {
      return state.parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");
    }
    return state.parties.filter((p) => p.type === "SUPPLIER" || p.type === "BOTH");
  }, [state.parties, kind]);

  function accountLabel(a: (typeof accounts)[0]) {
    if (lang === "ur") return `${a.code} — ${a.nameUrdu}`;
    if (lang === "both") return `${a.code} — ${a.name} (${a.nameUrdu})`;
    return `${a.code} — ${a.name}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Amount must be positive");
      return;
    }
    const cashOrBank = mode === "cash" ? cash : bank;
    if (!cashOrBank || !accountId) {
      setError("Missing accounts");
      return;
    }
    const isReceipt = kind === "receipt";
    const res = addVoucher({
      date,
      type: isReceipt ? "CASH_RECEIPT" : "CASH_PAYMENT",
      narration:
        narration || (isReceipt ? "Cash receipt" : "Cash payment"),
      partyId: partyId || null,
      lines: isReceipt
        ? [
            { accountId: cashOrBank.id, debit: amt },
            { accountId, credit: amt },
          ]
        : [
            { accountId, debit: amt },
            { accountId: cashOrBank.id, credit: amt },
          ],
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess("Saved");
    router.push(`/vouchers/${res.id}`);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Flash error={error} success={success} />
      <FormField label="Date">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </FormField>
      <FormField label="Mode">
        <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
          <option value="cash">Cash</option>
          <option value="bank">Bank / JazzCash</option>
        </Select>
      </FormField>
      <FormField label="Party (optional)">
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">—</option>
          {filteredParties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Account">
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {accountLabel(a)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label={<Tx k="amount" />}>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </FormField>
      <FormField label={<Tx k="narration" />}>
        <Textarea value={narration} onChange={(e) => setNarration(e.target.value)} />
      </FormField>
      <Button type="submit">{t("save")}</Button>
    </form>
  );
}
