import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Export all ledger data as JSON (works for Postgres and local). */
export async function GET() {
  const [accounts, parties, stockItems, vouchers] = await Promise.all([
    prisma.account.findMany(),
    prisma.party.findMany(),
    prisma.stockItem.findMany(),
    prisma.voucher.findMany({
      include: { lines: true, stockMoves: true },
      orderBy: { createdAt: "asc" },
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

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hisab-kitab-${stamp}.json"`,
    },
  });
}
