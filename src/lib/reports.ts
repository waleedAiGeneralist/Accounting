import { prisma } from "./prisma";
import { roundMoney } from "./money";
import { rangeBounds } from "./dates";
import { CODES } from "./accounts";

export type LedgerRow = {
  date: Date;
  voucherId: string;
  voucherType: string;
  narration: string;
  partyName: string | null;
  debit: number;
  credit: number;
  balance: number;
};

export async function accountLedger(
  accountId: string,
  from?: string,
  to?: string
): Promise<{ rows: LedgerRow[]; opening: number }> {
  const { fromDate, toDate } = rangeBounds(from, to);

  const openingLines = fromDate
    ? await prisma.voucherLine.findMany({
        where: {
          accountId,
          voucher: { date: { lt: fromDate } },
        },
      })
    : [];

  const opening = roundMoney(
    openingLines.reduce((s, l) => s + l.debit - l.credit, 0)
  );

  const lines = await prisma.voucherLine.findMany({
    where: {
      accountId,
      voucher: {
        ...(fromDate || toDate
          ? { date: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
          : {}),
      },
    },
    include: {
      voucher: { include: { party: true } },
    },
    orderBy: [{ voucher: { date: "asc" } }, { voucher: { createdAt: "asc" } }],
  });

  let bal = opening;
  const rows: LedgerRow[] = lines.map((l) => {
    bal = roundMoney(bal + l.debit - l.credit);
    return {
      date: l.voucher.date,
      voucherId: l.voucherId,
      voucherType: l.voucher.type,
      narration: l.voucher.narration,
      partyName: l.voucher.party?.name ?? null,
      debit: l.debit,
      credit: l.credit,
      balance: bal,
    };
  });

  return { rows, opening };
}

export async function partyLedger(
  partyId: string,
  from?: string,
  to?: string
): Promise<{ rows: LedgerRow[]; opening: number }> {
  const { fromDate, toDate } = rangeBounds(from, to);

  // Party balance via receivables/payables lines on their vouchers
  const recv = await prisma.account.findUnique({ where: { code: CODES.RECEIVABLES } });
  const pay = await prisma.account.findUnique({ where: { code: CODES.PAYABLES } });
  const accountIds = [recv?.id, pay?.id].filter(Boolean) as string[];

  const openingLines = fromDate
    ? await prisma.voucherLine.findMany({
        where: {
          accountId: { in: accountIds },
          voucher: { partyId, date: { lt: fromDate } },
        },
      })
    : [];

  // Positive = they owe us (receivable), negative = we owe them
  const opening = roundMoney(
    openingLines.reduce((s, l) => {
      // For receivable: debit increases what they owe; for payable: credit increases what we owe
      return s + l.debit - l.credit;
    }, 0)
  );

  const lines = await prisma.voucherLine.findMany({
    where: {
      accountId: { in: accountIds },
      voucher: {
        partyId,
        ...(fromDate || toDate
          ? { date: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
          : {}),
      },
    },
    include: { voucher: { include: { party: true } }, account: true },
    orderBy: [{ voucher: { date: "asc" } }, { voucher: { createdAt: "asc" } }],
  });

  let bal = opening;
  const rows: LedgerRow[] = lines.map((l) => {
    bal = roundMoney(bal + l.debit - l.credit);
    return {
      date: l.voucher.date,
      voucherId: l.voucherId,
      voucherType: l.voucher.type,
      narration: `${l.account.code} · ${l.voucher.narration}`,
      partyName: l.voucher.party?.name ?? null,
      debit: l.debit,
      credit: l.credit,
      balance: bal,
    };
  });

  return { rows, opening };
}

export async function trialBalance(from?: string, to?: string) {
  const { fromDate, toDate } = rangeBounds(from, to);
  const accounts = await prisma.account.findMany({
    where: { isActive: true, isSystem: false },
    orderBy: { code: "asc" },
  });

  const lines = await prisma.voucherLine.findMany({
    where: {
      voucher: {
        ...(fromDate || toDate
          ? { date: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
          : {}),
      },
    },
  });

  const byAccount = new Map<string, { debit: number; credit: number }>();
  for (const l of lines) {
    const cur = byAccount.get(l.accountId) ?? { debit: 0, credit: 0 };
    cur.debit = roundMoney(cur.debit + l.debit);
    cur.credit = roundMoney(cur.credit + l.credit);
    byAccount.set(l.accountId, cur);
  }

  const rows = accounts
    .map((a) => {
      const t = byAccount.get(a.id) ?? { debit: 0, credit: 0 };
      const net = roundMoney(t.debit - t.credit);
      // Present as debit or credit balance by account nature
      let debitBal = 0;
      let creditBal = 0;
      if (a.type === "ASSET" || a.type === "EXPENSE") {
        if (net >= 0) debitBal = net;
        else creditBal = -net;
      } else {
        if (net <= 0) creditBal = -net;
        else debitBal = net;
      }
      return {
        code: a.code,
        name: a.name,
        nameUrdu: a.nameUrdu,
        type: a.type,
        debit: debitBal,
        credit: creditBal,
      };
    })
    .filter((r) => r.debit !== 0 || r.credit !== 0);

  const totalDebit = roundMoney(rows.reduce((s, r) => s + r.debit, 0));
  const totalCredit = roundMoney(rows.reduce((s, r) => s + r.credit, 0));
  return { rows, totalDebit, totalCredit };
}

export async function profitAndLoss(from?: string, to?: string) {
  const { fromDate, toDate } = rangeBounds(from, to);
  const accounts = await prisma.account.findMany({
    where: { type: { in: ["INCOME", "EXPENSE"] }, isActive: true },
    orderBy: { code: "asc" },
  });

  const lines = await prisma.voucherLine.findMany({
    where: {
      accountId: { in: accounts.map((a) => a.id) },
      voucher: {
        ...(fromDate || toDate
          ? { date: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
          : {}),
      },
    },
  });

  const byId = new Map<string, number>();
  for (const l of lines) {
    // Income: credit - debit; Expense: debit - credit
    byId.set(l.accountId, roundMoney((byId.get(l.accountId) ?? 0) + l.debit - l.credit));
  }

  const income = accounts
    .filter((a) => a.type === "INCOME")
    .map((a) => ({
      code: a.code,
      name: a.name,
      nameUrdu: a.nameUrdu,
      amount: roundMoney(-(byId.get(a.id) ?? 0)), // credits net as positive income
    }))
    .filter((r) => r.amount !== 0);

  // Purchase/COGS accounts (5001/5002) shown as COGS from stock movements when present
  const cogsCodes = new Set([CODES.RICE_PURCHASE, CODES.KIRYANA_PURCHASE]);
  const expenses = accounts
    .filter((a) => a.type === "EXPENSE" && !cogsCodes.has(a.code as typeof CODES.RICE_PURCHASE))
    .map((a) => ({
      code: a.code,
      name: a.name,
      nameUrdu: a.nameUrdu,
      amount: roundMoney(byId.get(a.id) ?? 0),
    }))
    .filter((r) => r.amount !== 0);

  // COGS from stock movements (qtyOut * cost rate stored on movement)
  const stockOut = await prisma.stockMovement.findMany({
    where: {
      qtyOut: { gt: 0 },
      voucher: {
        type: "SALE",
        ...(fromDate || toDate
          ? { date: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
          : {}),
      },
    },
  });
  const cogsFromStock = roundMoney(
    stockOut.reduce((s, m) => s + m.qtyOut * m.rate, 0)
  );
  // Prefer journal COGS (perpetual) when posted; else stock movement
  const cogsFromBooks = roundMoney(
    accounts
      .filter((a) => cogsCodes.has(a.code as typeof CODES.RICE_PURCHASE))
      .reduce((s, a) => s + (byId.get(a.id) ?? 0), 0)
  );
  const cogs = cogsFromBooks !== 0 ? cogsFromBooks : cogsFromStock;

  const totalIncome = roundMoney(income.reduce((s, r) => s + r.amount, 0));
  const totalExpense = roundMoney(
    expenses.reduce((s, r) => s + r.amount, 0) + cogs
  );
  const net = roundMoney(totalIncome - totalExpense);

  return { income, expenses, cogs, totalIncome, totalExpense, net };
}

export async function balanceSheet(asOf?: string) {
  const { toDate } = rangeBounds(undefined, asOf ?? undefined);
  const accounts = await prisma.account.findMany({
    where: {
      type: { in: ["ASSET", "LIABILITY", "EQUITY"] },
      isActive: true,
      isSystem: false,
    },
    orderBy: { code: "asc" },
  });

  const lines = await prisma.voucherLine.findMany({
    where: {
      accountId: { in: accounts.map((a) => a.id) },
      ...(toDate ? { voucher: { date: { lte: toDate } } } : {}),
    },
  });

  const byId = new Map<string, number>();
  for (const l of lines) {
    byId.set(l.accountId, roundMoney((byId.get(l.accountId) ?? 0) + l.debit - l.credit));
  }

  const pl = await profitAndLoss(undefined, asOf);
  const retained = pl.net;

  function section(type: "ASSET" | "LIABILITY" | "EQUITY") {
    return accounts
      .filter((a) => a.type === type)
      .map((a) => {
        const raw = byId.get(a.id) ?? 0;
        const amount =
          type === "ASSET" ? roundMoney(raw) : roundMoney(-raw);
        return {
          code: a.code,
          name: a.name,
          nameUrdu: a.nameUrdu,
          amount,
        };
      })
      .filter((r) => r.amount !== 0);
  }

  const assets = section("ASSET");
  const liabilities = section("LIABILITY");
  const equity = [
    ...section("EQUITY"),
    {
      code: CODES.PL,
      name: "Profit & Loss (current)",
      nameUrdu: "منافع و نقصان",
      amount: retained,
    },
  ].filter((r) => r.amount !== 0);

  const totalAssets = roundMoney(assets.reduce((s, r) => s + r.amount, 0));
  const totalLiabEquity = roundMoney(
    liabilities.reduce((s, r) => s + r.amount, 0) +
      equity.reduce((s, r) => s + r.amount, 0)
  );

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabEquity,
  };
}

export type AgingBucket = {
  partyId: string;
  partyName: string;
  phone: string | null;
  current: number;
  d30: number;
  d60: number;
  d90: number;
  older: number;
  total: number;
};

async function aging(
  accountCode: string,
  partyTypes: ("CUSTOMER" | "SUPPLIER" | "BOTH")[],
  side: "debit" | "credit"
): Promise<AgingBucket[]> {
  const account = await prisma.account.findUniqueOrThrow({
    where: { code: accountCode },
  });
  const parties = await prisma.party.findMany({
    where: { type: { in: partyTypes } },
    orderBy: { name: "asc" },
  });

  const lines = await prisma.voucherLine.findMany({
    where: { accountId: account.id, voucher: { partyId: { not: null } } },
    include: { voucher: true },
  });

  const now = Date.now();
  const day = 86400000;

  return parties
    .map((p) => {
      const plines = lines.filter((l) => l.voucher.partyId === p.id);
      const bucket = {
        partyId: p.id,
        partyName: p.name,
        phone: p.phone,
        current: 0,
        d30: 0,
        d60: 0,
        d90: 0,
        older: 0,
        total: 0,
      };
      for (const l of plines) {
        const amt =
          side === "debit"
            ? roundMoney(l.debit - l.credit)
            : roundMoney(l.credit - l.debit);
        if (amt === 0) continue;
        const age = Math.floor((now - l.voucher.date.getTime()) / day);
        if (age <= 30) bucket.current += amt;
        else if (age <= 60) bucket.d30 += amt;
        else if (age <= 90) bucket.d60 += amt;
        else if (age <= 120) bucket.d90 += amt;
        else bucket.older += amt;
        bucket.total += amt;
      }
      bucket.current = roundMoney(bucket.current);
      bucket.d30 = roundMoney(bucket.d30);
      bucket.d60 = roundMoney(bucket.d60);
      bucket.d90 = roundMoney(bucket.d90);
      bucket.older = roundMoney(bucket.older);
      bucket.total = roundMoney(bucket.total);
      return bucket;
    })
    .filter((b) => b.total !== 0);
}

export function receivablesAging() {
  return aging(CODES.RECEIVABLES, ["CUSTOMER", "BOTH"], "debit");
}

export function payablesAging() {
  return aging(CODES.PAYABLES, ["SUPPLIER", "BOTH"], "credit");
}

export async function stockReport() {
  const items = await prisma.stockItem.findMany({ orderBy: { name: "asc" } });
  const moves = await prisma.stockMovement.findMany();

  return items.map((item) => {
    const m = moves.filter((x) => x.itemId === item.id);
    const qtyIn = roundMoney(m.reduce((s, x) => s + x.qtyIn, 0));
    const qtyOut = roundMoney(m.reduce((s, x) => s + x.qtyOut, 0));
    const qty = roundMoney(qtyIn - qtyOut);
    const valueIn = roundMoney(m.reduce((s, x) => s + x.qtyIn * x.rate, 0));
    const avgRate = qtyIn > 0 ? roundMoney(valueIn / qtyIn) : 0;
    const value = roundMoney(qty * avgRate);
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      qty,
      avgRate,
      value,
    };
  });
}

export async function cashBook(from?: string, to?: string) {
  const cash = await prisma.account.findUniqueOrThrow({
    where: { code: CODES.CASH },
  });
  return accountLedger(cash.id, from, to);
}

export async function accountBalance(code: string) {
  const account = await prisma.account.findUnique({ where: { code } });
  if (!account) return 0;
  const lines = await prisma.voucherLine.findMany({
    where: { accountId: account.id },
  });
  const raw = roundMoney(lines.reduce((s, l) => s + l.debit - l.credit, 0));
  if (account.type === "ASSET" || account.type === "EXPENSE") return raw;
  return roundMoney(-raw);
}

export async function dashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const sales = await prisma.voucher.findMany({
    where: {
      type: "SALE",
      isReversal: false,
      reversedBy: null,
      date: { gte: todayStart, lte: todayEnd },
    },
    include: { lines: true },
  });

  // Today's sales = sum of credits to sale accounts on today's sale vouchers
  const saleAccounts = await prisma.account.findMany({
    where: { code: { in: [CODES.RICE_SALE, CODES.KIRYANA_SALE, CODES.BARDANA_SALE] } },
  });
  const saleIds = new Set(saleAccounts.map((a) => a.id));
  const todaySales = roundMoney(
    sales.reduce(
      (s, v) =>
        s +
        v.lines
          .filter((l) => saleIds.has(l.accountId))
          .reduce((x, l) => x + l.credit, 0),
      0
    )
  );

  const [cash, bank, receivables, payables] = await Promise.all([
    accountBalance(CODES.CASH),
    accountBalance(CODES.BANK),
    accountBalance(CODES.RECEIVABLES),
    accountBalance(CODES.PAYABLES),
  ]);

  return { todaySales, cash, bank, receivables, payables };
}
