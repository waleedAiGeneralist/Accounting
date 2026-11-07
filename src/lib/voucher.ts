import {
  Prisma,
  PrismaClient,
  VoucherType,
  StockCategory,
} from "@prisma/client";
import { prisma } from "./prisma";
import { nearlyEqual, roundMoney } from "./money";
import { CODES, SALE_ACCOUNT_BY_CATEGORY, STOCK_ACCOUNT_BY_CATEGORY } from "./accounts";

export type LineInput = {
  accountId: string;
  debit?: number;
  credit?: number;
};

export type StockMoveInput = {
  itemId: string;
  qtyIn?: number;
  qtyOut?: number;
  rate: number;
};

export type CreateVoucherInput = {
  date: Date | string;
  type: VoucherType;
  narration: string;
  partyId?: string | null;
  lines: LineInput[];
  stockMoves?: StockMoveInput[];
  isReversal?: boolean;
  reversesId?: string | null;
};

export class VoucherBalanceError extends Error {
  constructor(debit: number, credit: number) {
    super(
      `Voucher unbalanced: debit ${debit.toFixed(2)} ≠ credit ${credit.toFixed(2)}`
    );
    this.name = "VoucherBalanceError";
  }
}

export class SystemAccountError extends Error {
  constructor(code: string) {
    super(`Account ${code} is system-calculated and cannot be posted to manually`);
    this.name = "SystemAccountError";
  }
}

type Tx = Prisma.TransactionClient | PrismaClient;

function sumLines(lines: LineInput[]) {
  const debit = roundMoney(lines.reduce((s, l) => s + (l.debit ?? 0), 0));
  const credit = roundMoney(lines.reduce((s, l) => s + (l.credit ?? 0), 0));
  return { debit, credit };
}

async function assertNoSystemManualPosting(tx: Tx, lines: LineInput[]) {
  const accountIds = lines.map((l) => l.accountId);
  const accounts = await tx.account.findMany({
    where: { id: { in: accountIds } },
  });
  for (const a of accounts) {
    if (a.isSystem) {
      throw new SystemAccountError(a.code);
    }
  }
}

/** Create a voucher inside a transaction with debit=credit enforcement. */
export async function createVoucher(
  input: CreateVoucherInput,
  client: Tx = prisma
) {
  const lines = input.lines
    .map((l) => ({
      accountId: l.accountId,
      debit: roundMoney(l.debit ?? 0),
      credit: roundMoney(l.credit ?? 0),
    }))
    .filter((l) => l.debit > 0 || l.credit > 0);

  if (lines.length < 2) {
    throw new Error("Voucher needs at least two lines");
  }

  for (const l of lines) {
    if (l.debit > 0 && l.credit > 0) {
      throw new Error("A line cannot have both debit and credit");
    }
  }

  const { debit, credit } = sumLines(lines);
  if (!nearlyEqual(debit, credit)) {
    throw new VoucherBalanceError(debit, credit);
  }

  await assertNoSystemManualPosting(client, lines);

  const date = typeof input.date === "string" ? new Date(input.date) : input.date;

  return client.voucher.create({
    data: {
      date,
      type: input.type,
      narration: input.narration,
      partyId: input.partyId || null,
      isReversal: input.isReversal ?? false,
      reversesId: input.reversesId ?? null,
      lines: { create: lines },
      stockMoves: input.stockMoves?.length
        ? {
            create: input.stockMoves.map((m) => ({
              itemId: m.itemId,
              qtyIn: roundMoney(m.qtyIn ?? 0),
              qtyOut: roundMoney(m.qtyOut ?? 0),
              rate: roundMoney(m.rate),
            })),
          }
        : undefined,
    },
    include: {
      lines: { include: { account: true } },
      party: true,
      stockMoves: { include: { item: true } },
    },
  });
}

/** Run createVoucher in an interactive transaction. */
export async function createVoucherTx(input: CreateVoucherInput) {
  return prisma.$transaction(async (tx) => createVoucher(input, tx));
}

/** Soft-delete via reversing voucher (keeps audit trail). */
export async function reverseVoucher(voucherId: string) {
  return prisma.$transaction(async (tx) => {
    const original = await tx.voucher.findUnique({
      where: { id: voucherId },
      include: {
        lines: true,
        stockMoves: true,
        reversedBy: true,
      },
    });

    if (!original) throw new Error("Voucher not found");
    if (original.isReversal) throw new Error("Cannot reverse a reversal voucher");
    if (original.reversedBy) throw new Error("Voucher already reversed");

    const reversal = await createVoucher(
      {
        date: new Date(),
        type: original.type,
        narration: `REVERSAL of ${original.id}: ${original.narration}`,
        partyId: original.partyId,
        isReversal: true,
        reversesId: original.id,
        lines: original.lines.map((l) => ({
          accountId: l.accountId,
          debit: l.credit,
          credit: l.debit,
        })),
        stockMoves: original.stockMoves.map((m) => ({
          itemId: m.itemId,
          qtyIn: m.qtyOut,
          qtyOut: m.qtyIn,
          rate: m.rate,
        })),
      },
      tx
    );

    return reversal;
  });
}

/** Replace a voucher by reversing the old one and posting a new one. */
export async function editVoucher(
  voucherId: string,
  next: CreateVoucherInput
) {
  return prisma.$transaction(async (tx) => {
    const original = await tx.voucher.findUnique({
      where: { id: voucherId },
      include: { lines: true, stockMoves: true, reversedBy: true },
    });
    if (!original) throw new Error("Voucher not found");
    if (original.isReversal) throw new Error("Cannot edit a reversal voucher");
    if (original.reversedBy) throw new Error("Voucher already reversed");

    await createVoucher(
      {
        date: new Date(),
        type: original.type,
        narration: `REVERSAL (edit) of ${original.id}: ${original.narration}`,
        partyId: original.partyId,
        isReversal: true,
        reversesId: original.id,
        lines: original.lines.map((l) => ({
          accountId: l.accountId,
          debit: l.credit,
          credit: l.debit,
        })),
        stockMoves: original.stockMoves.map((m) => ({
          itemId: m.itemId,
          qtyIn: m.qtyOut,
          qtyOut: m.qtyIn,
          rate: m.rate,
        })),
      },
      tx
    );

    return createVoucher(next, tx);
  });
}

export async function getAccountByCode(code: string, client: Tx = prisma) {
  const account = await client.account.findUnique({ where: { code } });
  if (!account) throw new Error(`Account ${code} not found — run seed`);
  return account;
}

export async function getAccountsByCodes(codes: string[], client: Tx = prisma) {
  const accounts = await client.account.findMany({
    where: { code: { in: codes } },
  });
  const map = new Map(accounts.map((a) => [a.code, a]));
  for (const c of codes) {
    if (!map.has(c)) throw new Error(`Account ${c} not found — run seed`);
  }
  return map;
}

/** Helpers for auto-posting sale/purchase journal lines. */
export function buildSaleLines(opts: {
  cashOrBankId: string;
  saleAccountId: string;
  receivablesId: string;
  discountGivenId: string;
  amount: number;
  discount: number;
  isCash: boolean;
}): LineInput[] {
  const gross = roundMoney(opts.amount);
  const discount = roundMoney(opts.discount);
  const net = roundMoney(gross - discount);
  const lines: LineInput[] = [
    {
      accountId: opts.isCash ? opts.cashOrBankId : opts.receivablesId,
      debit: net,
    },
    { accountId: opts.saleAccountId, credit: gross },
  ];
  if (discount > 0) {
    lines.push({ accountId: opts.discountGivenId, debit: discount });
  }
  return lines;
}

/** Purchase posts to stock asset (perpetual inventory). */
export function buildPurchaseLines(opts: {
  cashOrBankId: string;
  stockAccountId: string;
  payablesId: string;
  discountReceivedId: string;
  amount: number;
  discount: number;
  isCash: boolean;
}): LineInput[] {
  const gross = roundMoney(opts.amount);
  const discount = roundMoney(opts.discount);
  const net = roundMoney(gross - discount);
  const lines: LineInput[] = [
    { accountId: opts.stockAccountId, debit: gross },
    {
      accountId: opts.isCash ? opts.cashOrBankId : opts.payablesId,
      credit: net,
    },
  ];
  if (discount > 0) {
    lines.push({ accountId: opts.discountReceivedId, credit: discount });
  }
  return lines;
}

/** Append COGS lines: Dr purchase/expense, Cr stock. */
export function appendCogsLines(
  lines: LineInput[],
  opts: { cogsAccountId: string; stockAccountId: string; cost: number }
): LineInput[] {
  const cost = roundMoney(opts.cost);
  if (cost <= 0) return lines;
  return [
    ...lines,
    { accountId: opts.cogsAccountId, debit: cost },
    { accountId: opts.stockAccountId, credit: cost },
  ];
}

export function saleAccountCodeFor(category: StockCategory): string {
  return SALE_ACCOUNT_BY_CATEGORY[category] ?? CODES.KIRYANA_SALE;
}

export function stockAccountCodeFor(category: StockCategory): string {
  return STOCK_ACCOUNT_BY_CATEGORY[category] ?? CODES.KIRYANA_STOCK;
}

export function purchaseAccountCodeFor(category: StockCategory): string {
  if (category === "RICE") return CODES.RICE_PURCHASE;
  if (category === "KIRYANA") return CODES.KIRYANA_PURCHASE;
  // Bardana purchase posts to bardana-related expense or treat as kiryana purchase line
  return CODES.KIRYANA_PURCHASE;
}
