"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { todayISO } from "@/lib/dates";
import { roundMoney, formatPKR } from "@/lib/money";
import { useDemo } from "@/lib/demo/store";
import { accountByCode } from "@/lib/demo/compute";

export function SalePurchaseForm({ kind }: { kind: "sale" | "purchase" }) {
  const router = useRouter();
  const { t } = usePrefs();
  const { state, addVoucher } = useDemo();
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [partyId, setPartyId] = useState("");
  const [itemId, setItemId] = useState(state.stockItems[0]?.id ?? "");
  const [qty, setQty] = useState("1");
  const [rate, setRate] = useState("0");
  const [narration, setNarration] = useState("");

  const parties = useMemo(() => {
    if (kind === "sale") {
      return state.parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");
    }
    return state.parties.filter((p) => p.type === "SUPPLIER" || p.type === "BOTH");
  }, [state.parties, kind]);

  const item = state.stockItems.find((i) => i.id === itemId);
  const amount = roundMoney(Number(qty || 0) * Number(rate || 0));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!partyId || !item || amount <= 0) {
      setError("Party, item, qty and rate are required");
      return;
    }
    const recv = accountByCode(state.accounts, "1003");
    const pay = accountByCode(state.accounts, "2001");
    const riceSale = accountByCode(state.accounts, "4001");
    const kiryanaSale = accountByCode(state.accounts, "4002");
    const ricePur = accountByCode(state.accounts, "5001");
    const kiryanaPur = accountByCode(state.accounts, "5002");
    const saleAcc = item.category === "KIRYANA" ? kiryanaSale : riceSale;
    const purAcc = item.category === "KIRYANA" ? kiryanaPur : ricePur;

    if (kind === "sale") {
      if (!recv || !saleAcc) {
        setError("Missing sale accounts");
        return;
      }
      const res = addVoucher({
        date,
        type: "SALE",
        narration: narration || `Sale — ${item.name}`,
        partyId,
        lines: [
          { accountId: recv.id, debit: amount },
          { accountId: saleAcc.id, credit: amount },
        ],
        stockMoves: [{ itemId: item.id, qtyOut: Number(qty), rate: Number(rate) }],
      });
      if (!res.ok) return setError(res.error);
      router.push(`/vouchers/${res.id}`);
      return;
    }

    if (!pay || !purAcc) {
      setError("Missing purchase accounts");
      return;
    }
    const res = addVoucher({
      date,
      type: "PURCHASE",
      narration: narration || `Purchase — ${item.name}`,
      partyId,
      lines: [
        { accountId: purAcc.id, debit: amount },
        { accountId: pay.id, credit: amount },
      ],
      stockMoves: [{ itemId: item.id, qtyIn: Number(qty), rate: Number(rate) }],
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
      <FormField label="Party">
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)} required>
          <option value="">Select…</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Item">
        <Select value={itemId} onChange={(e) => setItemId(e.target.value)} required>
          {state.stockItems.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.unit})
            </option>
          ))}
        </Select>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Qty">
          <Input type="number" min="0" step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} required />
        </FormField>
        <FormField label="Rate">
          <Input type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} required />
        </FormField>
      </div>
      <div className="text-sm text-[var(--muted)]">Amount: {formatPKR(amount)}</div>
      <FormField label={<Tx k="narration" />}>
        <Textarea value={narration} onChange={(e) => setNarration(e.target.value)} />
      </FormField>
      <Button type="submit">{t("save")}</Button>
    </form>
  );
}
