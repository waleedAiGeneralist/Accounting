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
