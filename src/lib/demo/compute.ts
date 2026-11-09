import { roundMoney } from "@/lib/money";
import type { Account, DemoState, Voucher } from "./types";

function accountBalance(state: DemoState, accountId: string): number {
  let bal = 0;
  for (const v of state.vouchers) {
    for (const l of v.lines) {
      if (l.accountId === accountId) bal += l.debit - l.credit;
    }
  }
  return roundMoney(bal);
}

export function dashboardStats(state: DemoState) {
  const byCode = Object.fromEntries(state.accounts.map((a) => [a.code, a]));
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = state.vouchers
    .filter((v) => v.date === today && v.type === "SALE")
    .reduce(
      (s, v) =>
        s +
        v.lines
          .filter((l) => state.accounts.find((a) => a.id === l.accountId)?.type === "INCOME")
          .reduce((x, l) => x + l.credit, 0),
      0
    );

  return {
    todaySales: roundMoney(todaySales),
    cash: byCode["1001"] ? accountBalance(state, byCode["1001"].id) : 0,
    bank: byCode["1002"] ? accountBalance(state, byCode["1002"].id) : 0,
    receivables: byCode["1003"] ? accountBalance(state, byCode["1003"].id) : 0,
    payables: byCode["2001"]
      ? roundMoney(-accountBalance(state, byCode["2001"].id))
      : 0,
  };
}

export function trialBalance(state: DemoState) {
  return state.accounts
    .map((a) => {
      const bal = accountBalance(state, a.id);
      const debit = bal > 0 ? bal : 0;
      const credit = bal < 0 ? -bal : 0;
      return { account: a, debit, credit };
    })
    .filter((r) => r.debit !== 0 || r.credit !== 0);
}

export function stockOnHand(state: DemoState) {
  return state.stockItems.map((item) => {
    let qty = 0;
    let value = 0;
    for (const v of state.vouchers) {
      for (const m of v.stockMoves) {
        if (m.itemId !== item.id) continue;
        qty += m.qtyIn - m.qtyOut;
        value += m.qtyIn * m.rate - m.qtyOut * m.rate;
      }
    }
    return { item, qty: roundMoney(qty), value: roundMoney(value) };
  });
}

export function accountByCode(accounts: Account[], code: string) {
  return accounts.find((a) => a.code === code);
}

export function recentVouchers(state: DemoState, take = 8): Voucher[] {
  return [...state.vouchers]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, take);
}

/** Running petty-cash book (Excel-style): Dr/Cr against cash account with balance. */
export function pettyCashBook(state: DemoState) {
  const cash = accountByCode(state.accounts, "1001");
  if (!cash) return [];
  const partyName = (id: string | null) =>
    state.parties.find((p) => p.id === id)?.name ?? "";

  const rows: Array<{
    id: string;
    sno: string;
    date: string;
    postRef: string;
    head: string;
    project: string;
    party: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }> = [];

  let balance = 0;
  const ordered = [...state.vouchers]
    .filter((v) => !v.isReversal)
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.createdAt.localeCompare(b.createdAt);
    });

  let i = 0;
  for (const v of ordered) {
    const line = v.lines.find((l) => l.accountId === cash.id);
    if (!line) continue;
    const debit = line.debit || 0;
    const credit = line.credit || 0;
    if (!debit && !credit) continue;
    balance = roundMoney(balance + debit - credit);
    i += 1;
    rows.push({
      id: v.id,
      sno: v.sno || String(i).padStart(2, "0"),
      date: v.date,
      postRef: v.postRef || "",
      head: v.head || state.accounts.find((a) => a.id === v.lines.find((l) => l.accountId !== cash.id)?.accountId)?.name || "",
      project: v.project || "",
      party: partyName(v.partyId),
      description: v.narration,
      debit,
      credit,
      balance,
    });
  }
  return rows;
}

export function partyPayableBalance(state: DemoState, partyId: string) {
  // Net from cash payments/receipts + purchase/sale linked to party via AP/AR codes
  const ap = accountByCode(state.accounts, "2001");
  const ar = accountByCode(state.accounts, "1003");
  let payable = 0;
  let receivable = 0;
  for (const v of state.vouchers) {
    if (v.partyId !== partyId || v.isReversal) continue;
    for (const l of v.lines) {
      if (ap && l.accountId === ap.id) payable += l.credit - l.debit;
      if (ar && l.accountId === ar.id) receivable += l.debit - l.credit;
      // liability heads tagged to party also count as payable movement
      const acc = state.accounts.find((a) => a.id === l.accountId);
      if (acc?.type === "LIABILITY" && acc.code !== "2001") {
        payable += l.credit - l.debit;
      }
    }
  }
  return {
    payable: roundMoney(payable),
    receivable: roundMoney(receivable),
  };
}
