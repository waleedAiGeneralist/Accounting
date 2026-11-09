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

type Line = { accountId: string; debit: string; credit: string };

export function JournalForm() {
  const router = useRouter();
  const { t, lang } = usePrefs();
  const { state, addVoucher } = useDemo();
  const postable = state.accounts.filter((a) => !a.isSystem && a.isActive);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<Line[]>([
    { accountId: postable[0]?.id ?? "", debit: "", credit: "" },
    { accountId: postable[1]?.id ?? "", debit: "", credit: "" },
  ]);

  const totals = useMemo(() => {
    const debit = roundMoney(lines.reduce((s, l) => s + Number(l.debit || 0), 0));
    const credit = roundMoney(lines.reduce((s, l) => s + Number(l.credit || 0), 0));
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.005 };
  }, [lines]);

  function accountLabel(a: (typeof postable)[0]) {
    if (lang === "ur") return `${a.code} — ${a.nameUrdu}`;
    if (lang === "both") return `${a.code} — ${a.name} (${a.nameUrdu})`;
    return `${a.code} — ${a.name}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!totals.balanced) {
      setError(`Unbalanced: Dr ${totals.debit} ≠ Cr ${totals.credit}`);
      return;
    }
    const res = addVoucher({
      date,
      type: "JOURNAL",
      narration: narration || "Journal entry",
      lines: lines.map((l) => ({
        accountId: l.accountId,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
      })),
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
      <FormField label={<Tx k="narration" />}>
        <Textarea value={narration} onChange={(e) => setNarration(e.target.value)} />
      </FormField>
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-md border border-[var(--border)] p-3 sm:grid-cols-3">
          <FormField label="Account">
            <Select
              value={l.accountId}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((row, idx) =>
                    idx === i ? { ...row, accountId: e.target.value } : row
                  )
                )
              }
            >
              {postable.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountLabel(a)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Debit">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={l.debit}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((row, idx) =>
                    idx === i ? { ...row, debit: e.target.value, credit: "" } : row
                  )
                )
              }
            />
          </FormField>
          <FormField label="Credit">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={l.credit}
              onChange={(e) =>
                setLines((prev) =>
                  prev.map((row, idx) =>
                    idx === i ? { ...row, credit: e.target.value, debit: "" } : row
                  )
                )
              }
            />
          </FormField>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)]"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              { accountId: postable[0]?.id ?? "", debit: "", credit: "" },
            ])
          }
        >
          Add line
        </Button>
        <div className="ms-auto self-center text-sm text-[var(--muted)]">
          Dr {formatPKR(totals.debit)} · Cr {formatPKR(totals.credit)}
        </div>
      </div>
      <Button type="submit" disabled={!totals.balanced}>
        {t("save")}
      </Button>
    </form>
  );
}
