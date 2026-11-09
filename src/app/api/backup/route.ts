import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [accounts, parties, stockItems, vouchers] = await Promise.all([
    prisma.account.findMany({ orderBy: { code: "asc" } }),
    prisma.party.findMany({ orderBy: { name: "asc" } }),
    prisma.stockItem.findMany({ orderBy: { name: "asc" } }),
    prisma.voucher.findMany({
      include: { lines: true, stockMoves: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts,
    parties,
    stockItems,
    vouchers,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hisab-kitab-backup.json"`,
    },
  });
}
