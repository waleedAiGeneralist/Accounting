"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, Input, Select, Textarea, Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { Tx } from "@/components/i18n/Tx";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import { todayISO } from "@/lib/dates";
import { useDemo } from "@/lib/demo/store";
import { accountByCode, partyPayableBalance } from "@/lib/demo/compute";
import { formatPKR } from "@/lib/money";

export function CashForm({ kind }: { kind: "receipt" | "payment" }) {
  const router = useRouter();
  const { t, lang } = usePrefs();
  const { state, addVoucher } = useDemo();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [mode, setMode] = useState<"cash" | "bank">("cash");
  const [partyId, setPartyId] = useState("");
  const [project, setProject] = useState("");
  const cash = accountByCode(state.accounts, "1001");
  const bankAccounts = state.accounts.filter(
    (a) => a.isActive && a.type === "ASSET" && a.code.startsWith("100") && a.code !== "1001" && a.code !== "1003"
  );
  const [bankId, setBankId] = useState(bankAccounts[0]?.id ?? "");
  const heads = state.accounts.filter(
    (a) =>
      a.isActive &&
      !a.isSystem &&
      a.code !== "1001" &&
      !bankAccounts.some((b) => b.id === a.id)
  );
  const [accountId, setAccountId] = useState(
    heads.find((a) => a.type === "EXPENSE")?.id ?? heads[0]?.id ?? ""
  );
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const filteredParties = useMemo(() => {
    if (kind === "receipt") {
      return state.parties.filter((p) => p.type === "CUSTOMER" || p.type === "BOTH");
    }
    return state.parties.filter((p) => p.type === "SUPPLIER" || p.type === "BOTH");
  }, [state.parties, kind]);

  const selectedPartyBal = partyId ? partyPayableBalance(state, partyId) : null;

  function accountLabel(a: (typeof heads)[0]) {
    if (lang === "ur") return `${a.code} — ${a.nameUrdu}`;
    if (lang === "both") return `${a.code} — ${a.name} (${a.nameUrdu})`;
    return `${a.code} — ${a.name}`;
  }

  const amt = Number(amount) || 0;
  const headAcc = heads.find((a) => a.id === accountId);
  const cashOrBank = mode === "cash" ? cash : state.accounts.find((a) => a.id === bankId);
  const isReceipt = kind === "receipt";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!amt || amt <= 0) {
      setError("Amount must be positive");
      return;
    }
    if (!cashOrBank || !accountId) {
      setError("Missing accounts");
      return;
    }
    const res = addVoucher({
      date,
      type: isReceipt ? "CASH_RECEIPT" : "CASH_PAYMENT",
      narration:
        narration ||
        (isReceipt
          ? `Petty cash receipt — ${headAcc?.name ?? "account"}`
          : `Petty cash payment — ${headAcc?.name ?? "account"}`),
      partyId: partyId || null,
      project: project || null,
      head: headAcc?.name ?? null,
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
    setSuccess("Saved — double entry posted");
    router.push(`/vouchers/${res.id}`);
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Flash error={error} success={success} />

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--muted)]">
        {isReceipt ? (
          <p>
            Double entry: <strong>Debit</strong> Petty Cash / Bank · <strong>Credit</strong> Head of A/C
            (source). Petty cash balance goes up.
          </p>
        ) : (
          <p>
            Double entry: <strong>Debit</strong> Head of A/C (expense / party payable) ·{" "}
            <strong>Credit</strong> Petty Cash. If you bought Rs 5,00,000 and pay Rs 3,00,000, the
            remaining Rs 2,00,000 stays payable on the party / trial balance.
          </p>
        )}
      </div>

      <FormField label="Date">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </FormField>
      <FormField label="Mode">
        <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "bank")}>
          <option value="cash">Petty Cash</option>
          <option value="bank">Bank</option>
        </Select>
      </FormField>
      {mode === "bank" ? (
        <FormField label="Bank account">
          <Select value={bankId} onChange={(e) => setBankId(e.target.value)}>
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </FormField>
      ) : null}
      <FormField label="Party (select vendor / payee)">
        <Select value={partyId} onChange={(e) => setPartyId(e.target.value)}>
          <option value="">—</option>
          {filteredParties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </FormField>
      {selectedPartyBal ? (
        <p className="text-xs text-[var(--muted)]">
          Party balance — Payable: {formatPKR(selectedPartyBal.payable)} · Receivable:{" "}
          {formatPKR(selectedPartyBal.receivable)}
        </p>
      ) : null}
      <FormField label="Project">
        <Select value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">—</option>
          {state.projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Head of A/C">
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          {heads.map((a) => (
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

      {amt > 0 && cashOrBank && headAcc ? (
        <div className="card-panel text-sm">
          <div className="mb-1 font-semibold">Entry preview</div>
          {isReceipt ? (
            <ul className="list-inside list-disc text-[var(--muted)]">
              <li>
                Dr {cashOrBank.name} {formatPKR(amt)}
              </li>
              <li>
                Cr {headAcc.name} {formatPKR(amt)}
              </li>
            </ul>
          ) : (
            <ul className="list-inside list-disc text-[var(--muted)]">
              <li>
                Dr {headAcc.name} {formatPKR(amt)}
              </li>
              <li>
                Cr {cashOrBank.name} {formatPKR(amt)}
              </li>
            </ul>
          )}
        </div>
      ) : null}

      <Button type="submit">{t("save")}</Button>
    </form>
  );
}
