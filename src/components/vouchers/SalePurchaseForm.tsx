"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createSaleVoucher,
  createPurchaseVoucher,
} from "@/app/actions/vouchers";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { todayISO } from "@/lib/dates";
import { roundMoney, formatPKR } from "@/lib/money";

type Party = { id: string; name: string; type: string };
type Item = {
  id: string;
  name: string;
  category: string;
  unit: string;
};

export function SalePurchaseForm({
  kind,
  parties,
  items,
}: {
  kind: "sale" | "purchase";
  parties: Party[];
  items: Item[];
}) {
  const router = useRouter();
  const { t } = usePrefs();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [partyId, setPartyId] = useState("");
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [qty, setQty] = useState("1");
  const [rate, setRate] = useState("");
  const [discount, setDiscount] = useState("0");
  const [isCash, setIsCash] = useState(true);
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [narration, setNarration] = useState("");

  const item = items.find((i) => i.id === itemId);
  const total = useMemo(() => {
    const g = roundMoney(Number(qty || 0) * Number(rate || 0));
    const d = roundMoney(Number(discount || 0));
    return { gross: g, discount: d, net: roundMoney(g - d) };
  }, [qty, rate, discount]);

  const filteredParties = useMemo(() => {
    if (kind === "sale") {
      return parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");
    }
    return parties.filter((p) => p.type === "SUPPLIER" || p.type === "BOTH");
  }, [parties, kind]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const payload = {
        date,
        partyId: partyId || undefined,
        itemId,
        qty: Number(qty),
        rate: Number(rate),
        discount: Number(discount || 0),
        isCash,
        mode,
        narration: narration || undefined,
      };
      const res =
        kind === "sale"
          ? await createSaleVoucher(payload)
          : await createPurchaseVoucher(payload);
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
        <FormField label={<Tx k="party" />}>
          <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
            <option value="">—</option>
            {filteredParties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label={<Tx k="item" />}>
        <Select value={itemId} onChange={(e) => setItemId(e.target.value)} required>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} [{i.category}] ({i.unit})
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <FormField
          label={
            <>
              <Tx k="qty" />
              {item ? ` (${item.unit})` : ""}
            </>
          }
        >
          <Input type="number" min="0" step="0.01" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} required />
        </FormField>
        <FormField label={<Tx k="rate" />}>
          <Input type="number" min="0" step="0.01" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} required />
        </FormField>
        <FormField label={<Tx k="discount" />}>
          <Input type="number" min="0" step="0.01" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </FormField>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span>
            <Tx k="total" />
          </span>
          <strong>{formatPKR(total.net)}</strong>
        </div>
        {total.discount > 0 ? (
          <div className="mt-1 flex justify-between text-[var(--muted)]">
            <span>
              <Tx k="discount" />
            </span>
            <span>-{formatPKR(total.discount)}</span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={<Tx k="payment" />}>
          <Select
            value={isCash ? "cash" : "credit"}
            onChange={(e) => setIsCash(e.target.value === "cash")}
          >
            <option value="cash">{t("cash")}</option>
            <option value="credit">{t("creditSale")}</option>
          </Select>
        </FormField>
        {isCash ? (
          <FormField label={<Tx k="bank" />}>
            <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
              <option value="cash">{t("cash")}</option>
              <option value="bank">{t("bank")}</option>
            </Select>
          </FormField>
        ) : (
          <div />
        )}
      </div>

      <FormField label={<Tx k="narration" />}>
        <Textarea rows={2} value={narration} onChange={(e) => setNarration(e.target.value)} />
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
