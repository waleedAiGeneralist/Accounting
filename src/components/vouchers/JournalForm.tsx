"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createJournalVoucher } from "@/app/actions/vouchers";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { todayISO } from "@/lib/dates";
import { roundMoney, formatPKR } from "@/lib/money";

type Account = { id: string; code: string; name: string; nameUrdu: string; isSystem: boolean };

type Line = { accountId: string; debit: string; credit: string };

export function JournalForm({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const { t, lang } = usePrefs();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [narration, setNarration] = useState("");
  const postable = accounts.filter((a) => !a.isSystem);
  const [lines, setLines] = useState<Line[]>([
    { accountId: postable[0]?.id ?? "", debit: "", credit: "" },
    { accountId: postable[1]?.id ?? "", debit: "", credit: "" },
  ]);

  const totals = useMemo(() => {
    const debit = roundMoney(lines.reduce((s, l) => s + Number(l.debit || 0), 0));
    const credit = roundMoney(lines.reduce((s, l) => s + Number(l.credit || 0), 0));
    return { debit, credit, balanced: Math.abs(debit - credit) < 0.005 };
  }, [lines]);

  function accountLabel(a: Account) {
    if (lang === "ur") return `${a.code} — ${a.nameUrdu}`;
    if (lang === "both") return `${a.code} — ${a.name} (${a.nameUrdu})`;
    return `${a.code} — ${a.name}`;
  }

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!totals.balanced) {
      setError(`Unbalanced: Dr ${totals.debit} ≠ Cr ${totals.credit}`);
      return;
    }
    start(async () => {
      const res = await createJournalVoucher({
        date,
        narration,
        lines: lines.map((l) => ({
          accountId: l.accountId,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
        })),
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
    <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl flex-col gap-4">
      <Flash error={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={<Tx k="date" />}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required autoFocus />
        </FormField>
        <FormField label={<Tx k="narration" />}>
          <Textarea rows={1} value={narration} onChange={(e) => setNarration(e.target.value)} required />
        </FormField>
      </div>

      <div className="overflow-x-auto rounded-md border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface-2)] text-left text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">
                <Tx k="account" />
              </th>
              <th className="w-32 px-3 py-2">
                <Tx k="debit" />
              </th>
              <th className="w-32 px-3 py-2">
                <Tx k="credit" />
              </th>
              <th className="w-16 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-t border-[var(--border)]">
                <td className="px-2 py-1.5">
                  <Select
                    value={line.accountId}
                    onChange={(e) => updateLine(i, { accountId: e.target.value })}
                  >
                    {postable.map((a) => (
                      <option key={a.id} value={a.id}>
                        {accountLabel(a)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.debit}
                    onChange={(e) =>
                      updateLine(i, { debit: e.target.value, credit: e.target.value ? "" : line.credit })
                    }
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.credit}
                    onChange={(e) =>
                      updateLine(i, { credit: e.target.value, debit: e.target.value ? "" : line.debit })
                    }
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-2"
                    disabled={lines.length <= 2}
                    onClick={() => setLines((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    ×
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--border)] bg-[var(--surface-2)] font-semibold">
              <td className="px-3 py-2">
                <Tx k="total" />
              </td>
              <td className="px-3 py-2">{formatPKR(totals.debit)}</td>
              <td className="px-3 py-2">{formatPKR(totals.credit)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            setLines((prev) => [
              ...prev,
              { accountId: postable[0]?.id ?? "", debit: "", credit: "" },
            ])
          }
        >
          + Line
        </Button>
        <Button type="submit" disabled={pending || !totals.balanced}>
          {pending ? "…" : t("save")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
