import type { Account, DemoState, Party, Voucher, VoucherType } from "./types";
import data from "./petty-cash-data.json";

function id(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

const LIABILITY_HEADS = new Set([
  "PAYABLE",
  "A/P",
  "AL HADEED CORPORATION",
]);

const EQUITY_HEADS = new Set(["DRAWING-1", "DRAWING-2"]);

const INCOME_HINT = /income|received cash against income/i;

function classifyHead(head: string): Account["type"] {
  const h = head.trim().toUpperCase();
  if (h === "PETTY CASH") return "ASSET";
  if (LIABILITY_HEADS.has(h) || h.includes("PAYABLE") || h === "A/P") return "LIABILITY";
  if (EQUITY_HEADS.has(h) || h.includes("DRAWING")) return "EQUITY";
  return "EXPENSE";
}

function headCode(index: number, type: Account["type"]) {
  const base =
    type === "ASSET"
      ? 1100
      : type === "LIABILITY"
        ? 2100
        : type === "EQUITY"
          ? 3100
          : type === "INCOME"
            ? 4100
            : 5100;
  return String(base + index);
}

export function createSeedState(): DemoState {
  const cash: Account = {
    id: id("acc", 1),
    code: "1001",
    name: "Petty Cash",
    nameUrdu: "پیٹی کیش",
    type: "ASSET",
    isActive: true,
    isSystem: false,
  };
  const banks: Account[] = [
    {
      id: id("acc", 2),
      code: "1002",
      name: "Allied Bank A/C #24",
      nameUrdu: "الائیڈ بینک اکاؤنٹ 24",
      type: "ASSET",
      isActive: true,
      isSystem: false,
    },
    {
      id: id("acc", 3),
      code: "1008",
      name: "Bank Account 2 (placeholder)",
      nameUrdu: "بینک اکاؤنٹ 2",
      type: "ASSET",
      isActive: true,
      isSystem: false,
    },
    {
      id: id("acc", 4),
      code: "1009",
      name: "Bank Account 3 (placeholder)",
      nameUrdu: "بینک اکاؤنٹ 3",
      type: "ASSET",
      isActive: true,
      isSystem: false,
    },
  ];
  const receivables: Account = {
    id: id("acc", 5),
    code: "1003",
    name: "Receivables",
    nameUrdu: "وصولیاں",
    type: "ASSET",
    isActive: true,
    isSystem: false,
  };
  const payablesCtrl: Account = {
    id: id("acc", 6),
    code: "2001",
    name: "Accounts Payable",
    nameUrdu: "واجب الادا",
    type: "LIABILITY",
    isActive: true,
    isSystem: false,
  };
  const capital: Account = {
    id: id("acc", 7),
    code: "3001",
    name: "Owner Capital / Opening",
    nameUrdu: "سرمایہ / اوپننگ",
    type: "EQUITY",
    isActive: true,
    isSystem: false,
  };
  const loanIncome: Account = {
    id: id("acc", 8),
    code: "3004",
    name: "Loans & Contra Receipts",
    nameUrdu: "قرض / کنٹرا وصولی",
    type: "LIABILITY",
    isActive: true,
    isSystem: false,
  };
  const pnl: Account = {
    id: id("acc", 9),
    code: "3003",
    name: "Profit & Loss",
    nameUrdu: "منافع و نقصان",
    type: "EQUITY",
    isActive: true,
    isSystem: true,
  };
  const otherIncome: Account = {
    id: id("acc", 10),
    code: "4001",
    name: "Other Income",
    nameUrdu: "دیگر آمدنی",
    type: "INCOME",
    isActive: true,
    isSystem: false,
  };

  const headAccounts: Account[] = [];
  let hi = 0;
  for (const head of data.heads as string[]) {
    const name = head.trim();
    if (!name || name.toUpperCase() === "PETTY CASH") continue;
    const type = classifyHead(name);
    hi += 1;
    headAccounts.push({
      id: id("acc", 100 + hi),
      code: headCode(hi, type),
      name,
      nameUrdu: name,
      type,
      isActive: true,
      isSystem: false,
    });
  }

  const accounts: Account[] = [
    cash,
    ...banks,
    receivables,
    payablesCtrl,
    capital,
    loanIncome,
    pnl,
    otherIncome,
    ...headAccounts,
  ];

  const byHead = Object.fromEntries(
    headAccounts.map((a) => [a.name.toUpperCase(), a])
  );

  const partyNames = Array.from(
    new Set(
      [
        ...(data.namedParties as string[]),
        ...(data.sheetParties as string[]),
        "Saif Ur Rehman",
        "Al Hadeed Corporation",
        "KVT",
        "Anis Sb",
        "Waqas Ali",
        "Imran Jalil",
        "Mehran Khan",
        "CEO",
      ].map((n) => n.trim()).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  const parties: Party[] = partyNames.map((name, i) => {
    const upper = name.toUpperCase();
    const supplierLike =
      upper.includes("CORPORATION") ||
      upper.includes("KVT") ||
      upper.includes("ENTERPRISES") ||
      upper.includes("FACTORY") ||
      upper.includes("STATION") ||
      upper.includes("AL HADEED") ||
      upper.includes("SANITARY") ||
      upper.includes("MATERIAL");
    return {
      id: id("pty", i + 1),
      name,
      phone: null,
      type: supplierLike ? "SUPPLIER" : "BOTH",
    };
  });

  const findParty = (hint: string | null | undefined): string | null => {
    if (!hint) return null;
    const h = hint.trim().toLowerCase();
    if (!h) return null;
    const exact = parties.find((p) => p.name.toLowerCase() === h);
    if (exact) return exact.id;
    const partial = parties.find(
      (p) =>
        h.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(h)
    );
    return partial?.id ?? null;
  };

  const projects = (data.projects as string[]).map((p) => p.trim()).filter(Boolean);

  const vouchers: Voucher[] = [];
  let vn = 0;
  let ln = 0;

  function pushVoucher(input: {
    date: string;
    type: VoucherType;
    narration: string;
    partyId: string | null;
    project: string | null;
    postRef: string | null;
    head: string | null;
    sno: string | null;
    lines: Array<{ accountId: string; debit: number; credit: number }>;
  }) {
    vn += 1;
    vouchers.push({
      id: id("vch", vn),
      date: input.date,
      type: input.type,
      narration: input.narration,
      partyId: input.partyId,
      project: input.project,
      postRef: input.postRef,
      head: input.head,
      sno: input.sno,
      isReversal: false,
      reversesId: null,
      createdAt: `${input.date}T12:00:${String(vn % 60).padStart(2, "0")}.000Z`,
      lines: input.lines.map((l) => {
        ln += 1;
        return { id: id("ln", ln), ...l };
      }),
      stockMoves: [],
    });
  }

  for (const row of data.rows as Array<{
    kind: string;
    sno?: string;
    date: string;
    postRef: string;
    head: string;
    project: string;
    party: string;
    desc: string;
    debit: number;
    credit: number;
  }>) {
    const date = row.date;
    const head = (row.head || "").trim();
    const project = (row.project || "").trim() || null;
    const postRef = (row.postRef || "").trim() || null;
    const sno = row.sno || (row.kind === "opening" ? "OB" : null);
    const desc = row.desc || head || "Petty cash entry";
    const partyId =
      findParty(row.party) ||
      findParty(desc) ||
      (head.toUpperCase().includes("AL HADEED")
        ? findParty("Al Hadeed Corporation")
        : null) ||
      (project?.toUpperCase() === "KVT" ? findParty("KVT") : null);

    if (row.kind === "opening" || (row.debit > 0 && !row.credit && head.toUpperCase() === "PETTY CASH" && desc.toLowerCase().includes("opening"))) {
      const amt = row.debit || 0;
      if (amt <= 0) continue;
      pushVoucher({
        date,
        type: "JOURNAL",
        narration: desc,
        partyId: null,
        project,
        postRef,
        head: "Petty Cash",
        sno,
        lines: [
          { accountId: cash.id, debit: amt, credit: 0 },
          { accountId: capital.id, debit: 0, credit: amt },
        ],
      });
      continue;
    }

    if (row.debit > 0 && row.credit === 0) {
      // Cash in — Dr Petty Cash, Cr source
      let creditAcc = loanIncome;
      if (/allied bank|abl\/24|cheque/i.test(desc) || project === "ABL/24") {
        creditAcc = banks[0];
      } else if (INCOME_HINT.test(desc)) {
        creditAcc = otherIncome;
      } else if (head.toUpperCase() === "PAYABLE" || head.toUpperCase() === "A/P") {
        creditAcc = byHead[head.toUpperCase()] || payablesCtrl;
      } else if (head && byHead[head.toUpperCase()] && head.toUpperCase() !== "PETTY CASH") {
        // contra / loan style heads credited when cash increases under that head
        const ha = byHead[head.toUpperCase()];
        creditAcc = ha.type === "LIABILITY" || ha.type === "INCOME" ? ha : loanIncome;
      }
      pushVoucher({
        date,
        type: "CASH_RECEIPT",
        narration: desc,
        partyId,
        project,
        postRef,
        head: head || "Petty Cash",
        sno,
        lines: [
          { accountId: cash.id, debit: row.debit, credit: 0 },
          { accountId: creditAcc.id, debit: 0, credit: row.debit },
        ],
      });
      continue;
    }

    if (row.credit > 0) {
      // Cash out — Dr head / payable, Cr Petty Cash
      let debitAcc =
        (head && byHead[head.toUpperCase()]) ||
        (LIABILITY_HEADS.has(head.toUpperCase()) ? payablesCtrl : null);
      if (!debitAcc) {
        // create fallback under expense name if missing
        debitAcc = otherIncome; // shouldn't happen
        const fallback = headAccounts.find((a) => a.name.toUpperCase() === "SALARY");
        debitAcc = fallback || capital;
      }
      // Paying Al Hadeed / payable heads hit liability
      if (
        head.toUpperCase().includes("AL HADEED") ||
        head.toUpperCase() === "PAYABLE" ||
        head.toUpperCase() === "A/P"
      ) {
        debitAcc = byHead[head.toUpperCase()] || payablesCtrl;
      }
      pushVoucher({
        date,
        type: "CASH_PAYMENT",
        narration: desc,
        partyId,
        project,
        postRef,
        head: head || null,
        sno,
        lines: [
          { accountId: debitAcc.id, debit: row.credit, credit: 0 },
          { accountId: cash.id, debit: 0, credit: row.credit },
        ],
      });
    }
  }

  return {
    accounts,
    parties,
    stockItems: [],
    vouchers,
    projects,
  };
}
