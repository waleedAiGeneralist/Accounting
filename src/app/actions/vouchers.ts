"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  createVoucherTx,
  reverseVoucher,
  editVoucher,
  getAccountsByCodes,
  buildSaleLines,
  buildPurchaseLines,
  appendCogsLines,
  saleAccountCodeFor,
  purchaseAccountCodeFor,
  stockAccountCodeFor,
  type CreateVoucherInput,
} from "@/lib/voucher";
import { CODES } from "@/lib/accounts";
import { roundMoney } from "@/lib/money";
import { toDateOnly } from "@/lib/dates";
import type { VoucherType, StockCategory } from "@prisma/client";
import { requireSession } from "@/lib/auth";

/** Weighted-average unit cost from prior stock movements. */
async function avgCost(itemId: string, fallback: number): Promise<number> {
  const moves = await prisma.stockMovement.findMany({ where: { itemId } });
  const qtyIn = moves.reduce((s, m) => s + m.qtyIn, 0);
  if (qtyIn <= 0) return fallback;
  const valueIn = moves.reduce((s, m) => s + m.qtyIn * m.rate, 0);
  return roundMoney(valueIn / qtyIn);
}

export type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

function fail(e: unknown): ActionResult {
  const msg = e instanceof Error ? e.message : "Unknown error";
  return { ok: false, error: msg };
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/vouchers");
  revalidatePath("/reports");
}

export async function createCashVoucher(form: {
  date: string;
  kind: "receipt" | "payment";
  mode: "cash" | "bank";
  partyId?: string;
  accountId: string; // other side account
  amount: number;
  narration: string;
}): Promise<ActionResult> {
  try {
    await requireSession();
    const map = await getAccountsByCodes([CODES.CASH, CODES.BANK]);
    const cashOrBank = form.mode === "cash" ? map.get(CODES.CASH)! : map.get(CODES.BANK)!;
    const amount = roundMoney(form.amount);
    if (amount <= 0) throw new Error("Amount must be positive");

    const isReceipt = form.kind === "receipt";
    const type: VoucherType = isReceipt ? "CASH_RECEIPT" : "CASH_PAYMENT";

    const lines = isReceipt
      ? [
          { accountId: cashOrBank.id, debit: amount },
          { accountId: form.accountId, credit: amount },
        ]
      : [
          { accountId: form.accountId, debit: amount },
          { accountId: cashOrBank.id, credit: amount },
        ];

    const v = await createVoucherTx({
      date: toDateOnly(form.date),
      type,
      narration: form.narration || (isReceipt ? "Cash receipt" : "Cash payment"),
      partyId: form.partyId || null,
      lines,
    });
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function createSaleVoucher(form: {
  date: string;
  partyId?: string;
  itemId: string;
  qty: number;
  rate: number;
  discount: number;
  isCash: boolean;
  mode: "cash" | "bank";
  narration?: string;
}): Promise<ActionResult> {
  try {
    await requireSession();
    const item = await prisma.stockItem.findUniqueOrThrow({
      where: { id: form.itemId },
    });
    const qty = roundMoney(form.qty);
    const rate = roundMoney(form.rate);
    const discount = roundMoney(form.discount || 0);
    const amount = roundMoney(qty * rate);
    if (qty <= 0 || rate < 0) throw new Error("Invalid qty/rate");

    const codes = [
      CODES.CASH,
      CODES.BANK,
      CODES.RECEIVABLES,
      CODES.DISCOUNT_GIVEN,
      saleAccountCodeFor(item.category as StockCategory),
      purchaseAccountCodeFor(item.category as StockCategory),
      stockAccountCodeFor(item.category as StockCategory),
    ];
    const map = await getAccountsByCodes(codes);
    const cashOrBank =
      form.mode === "bank" ? map.get(CODES.BANK)! : map.get(CODES.CASH)!;

    const unitCost = await avgCost(item.id, rate);
    const cogs = roundMoney(qty * unitCost);

    const lines = appendCogsLines(
      buildSaleLines({
        cashOrBankId: cashOrBank.id,
        saleAccountId: map.get(saleAccountCodeFor(item.category))!.id,
        receivablesId: map.get(CODES.RECEIVABLES)!.id,
        discountGivenId: map.get(CODES.DISCOUNT_GIVEN)!.id,
        amount,
        discount,
        isCash: form.isCash,
      }),
      {
        cogsAccountId: map.get(purchaseAccountCodeFor(item.category))!.id,
        stockAccountId: map.get(stockAccountCodeFor(item.category))!.id,
        cost: cogs,
      }
    );

    const v = await createVoucherTx({
      date: toDateOnly(form.date),
      type: "SALE",
      narration:
        form.narration ||
        `Sale: ${item.name} ${qty} ${item.unit} @ ${rate}`,
      partyId: form.partyId || null,
      lines,
      stockMoves: [{ itemId: item.id, qtyOut: qty, rate: unitCost }],
    });
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function createPurchaseVoucher(form: {
  date: string;
  partyId?: string;
  itemId: string;
  qty: number;
  rate: number;
  discount: number;
  isCash: boolean;
  mode: "cash" | "bank";
  narration?: string;
}): Promise<ActionResult> {
  try {
    await requireSession();
    const item = await prisma.stockItem.findUniqueOrThrow({
      where: { id: form.itemId },
    });
    const qty = roundMoney(form.qty);
    const rate = roundMoney(form.rate);
    const discount = roundMoney(form.discount || 0);
    const amount = roundMoney(qty * rate);
    if (qty <= 0 || rate < 0) throw new Error("Invalid qty/rate");

    const codes = [
      CODES.CASH,
      CODES.BANK,
      CODES.PAYABLES,
      CODES.DISCOUNT_RECEIVED,
      stockAccountCodeFor(item.category as StockCategory),
    ];
    const map = await getAccountsByCodes(codes);
    const cashOrBank =
      form.mode === "bank" ? map.get(CODES.BANK)! : map.get(CODES.CASH)!;

    const lines = buildPurchaseLines({
      cashOrBankId: cashOrBank.id,
      stockAccountId: map.get(stockAccountCodeFor(item.category))!.id,
      payablesId: map.get(CODES.PAYABLES)!.id,
      discountReceivedId: map.get(CODES.DISCOUNT_RECEIVED)!.id,
      amount,
      discount,
      isCash: form.isCash,
    });

    const v = await createVoucherTx({
      date: toDateOnly(form.date),
      type: "PURCHASE",
      narration:
        form.narration ||
        `Purchase: ${item.name} ${qty} ${item.unit} @ ${rate}`,
      partyId: form.partyId || null,
      lines,
      stockMoves: [{ itemId: item.id, qtyIn: qty, rate }],
    });
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function createExpenseVoucher(form: {
  date: string;
  expenseAccountId: string;
  amount: number;
  mode: "cash" | "bank";
  partyId?: string;
  narration: string;
}): Promise<ActionResult> {
  try {
    await requireSession();
    const amount = roundMoney(form.amount);
    if (amount <= 0) throw new Error("Amount must be positive");
    const map = await getAccountsByCodes([CODES.CASH, CODES.BANK]);
    const cashOrBank =
      form.mode === "bank" ? map.get(CODES.BANK)! : map.get(CODES.CASH)!;

    const v = await createVoucherTx({
      date: toDateOnly(form.date),
      type: "EXPENSE",
      narration: form.narration || "Expense",
      partyId: form.partyId || null,
      lines: [
        { accountId: form.expenseAccountId, debit: amount },
        { accountId: cashOrBank.id, credit: amount },
      ],
    });
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function createJournalVoucher(form: {
  date: string;
  narration: string;
  partyId?: string;
  lines: { accountId: string; debit: number; credit: number }[];
}): Promise<ActionResult> {
  try {
    await requireSession();
    const v = await createVoucherTx({
      date: toDateOnly(form.date),
      type: "JOURNAL",
      narration: form.narration || "Journal entry",
      partyId: form.partyId || null,
      lines: form.lines,
    });
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function reverseVoucherAction(id: string): Promise<ActionResult> {
  try {
    await requireSession();
    const v = await reverseVoucher(id);
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function editVoucherAction(
  id: string,
  next: CreateVoucherInput
): Promise<ActionResult> {
  try {
    await requireSession();
    const v = await editVoucher(id, next);
    revalidateAll();
    return { ok: true, id: v.id };
  } catch (e) {
    return fail(e);
  }
}

export async function createParty(form: {
  name: string;
  phone?: string;
  type: "CUSTOMER" | "SUPPLIER" | "BOTH";
}): Promise<ActionResult> {
  try {
    await requireSession();
    const p = await prisma.party.create({
      data: {
        name: form.name.trim(),
        phone: form.phone?.trim() || null,
        type: form.type,
      },
    });
    revalidatePath("/parties");
    return { ok: true, id: p.id };
  } catch (e) {
    return fail(e);
  }
}

export async function createStockItem(form: {
  name: string;
  category: "RICE" | "KIRYANA" | "BARDANA";
  unit: "KG" | "MAUND" | "BAG" | "PCS";
}): Promise<ActionResult> {
  try {
    await requireSession();
    const item = await prisma.stockItem.create({ data: form });
    revalidatePath("/stock");
    return { ok: true, id: item.id };
  } catch (e) {
    return fail(e);
  }
}
