import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type {
  AccountType,
  PartyType,
  StockCategory,
  StockUnit,
  VoucherType,
} from "@prisma/client";

type BackupPayload = {
  version?: number;
  accounts?: Array<{
    id: string;
    code: string;
    name: string;
    nameUrdu: string;
    type: AccountType;
    isActive: boolean;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  parties?: Array<{
    id: string;
    name: string;
    phone: string | null;
    type: PartyType;
    createdAt: string;
    updatedAt: string;
  }>;
  stockItems?: Array<{
    id: string;
    name: string;
    category: StockCategory;
    unit: StockUnit;
    createdAt: string;
    updatedAt: string;
  }>;
  vouchers?: Array<{
    id: string;
    date: string;
    type: VoucherType;
    narration: string;
    partyId?: string | null;
    isReversal?: boolean;
    reversesId?: string | null;
    createdAt?: string;
    updatedAt?: string;
    lines?: Array<{
      id: string;
      voucherId: string;
      accountId: string;
      debit: number;
      credit: number;
    }>;
    stockMoves?: Array<{
      id: string;
      itemId: string;
      voucherId: string;
      qtyIn: number;
      qtyOut: number;
      rate: number;
    }>;
  }>;
};

/** Restore from a JSON backup exported by /api/backup. */
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  let data: BackupPayload;
  try {
    data = JSON.parse(await file.text()) as BackupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON backup" }, { status: 400 });
  }

  if (!data.accounts?.length) {
    return NextResponse.json({ error: "Backup missing accounts" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.stockMovement.deleteMany();
    await tx.voucherLine.deleteMany();
    await tx.voucher.deleteMany();
    await tx.stockItem.deleteMany();
    await tx.party.deleteMany();
    await tx.account.deleteMany();

    if (data.accounts?.length) {
      await tx.account.createMany({ data: data.accounts });
    }
    if (data.parties?.length) {
      await tx.party.createMany({ data: data.parties });
    }
    if (data.stockItems?.length) {
      await tx.stockItem.createMany({ data: data.stockItems });
    }

    for (const v of data.vouchers ?? []) {
      const lines = (v.lines ?? []).map((l) => ({
        id: l.id,
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
      }));
      const stockMoves = (v.stockMoves ?? []).map((m) => ({
        id: m.id,
        itemId: m.itemId,
        qtyIn: m.qtyIn,
        qtyOut: m.qtyOut,
        rate: m.rate,
      }));

      await tx.voucher.create({
        data: {
          id: v.id,
          date: new Date(v.date),
          type: v.type,
          narration: v.narration,
          partyId: v.partyId ?? null,
          isReversal: v.isReversal ?? false,
          reversesId: null,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
          updatedAt: v.updatedAt ? new Date(v.updatedAt) : undefined,
          lines: { create: lines },
          stockMoves: { create: stockMoves },
        },
      });
    }

    for (const v of data.vouchers ?? []) {
      if (v.reversesId) {
        await tx.voucher.update({
          where: { id: v.id },
          data: { reversesId: v.reversesId },
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
